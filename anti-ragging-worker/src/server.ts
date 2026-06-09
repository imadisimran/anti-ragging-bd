import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, Application } from 'express';
import { MongoClient, ObjectId, Collection } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. TYPE INTERFACES
// ==========================================
interface CloudinaryUpload {
    secureUrl: string;
    resource_type: string;
    publicId: string;
}

interface JobData {
    complaintId: string;
}

interface AiVerdict {
    isRaggingIncident: boolean;
    sanitizedTitle: string;
    sanitizedDescription: string;
    detectedSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
    rejectionReason: string | null;
}

// Helper to determine mimeType based on extension and resource type
function getMimeType(extension: string, resourceType: string): string {
    const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
    };
    return mimeMap[extension] || (resourceType === 'video' ? 'video/mp4' : 'image/jpeg');
}

// ==========================================
// 2. CONFIGURATION & INITIALIZATION
// ==========================================
const app: Application = express();
app.use(express.json());

const mongoUri = process.env.MONOGO_URI;
if (!mongoUri) throw new Error("Missing MONOGO_URI in environment variables.");

const mongoClient = new MongoClient(mongoUri);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const tempDir = path.join(__dirname, 'temp_proofs');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// ==========================================
// 3. THE REDIS-FREE SEQUENTIAL TASK QUEUE
// ==========================================
const memoryQueue: JobData[] = [];
let isProcessing = false;

// The main processing engine - handles exactly 1 item at a time
async function processNextJob(): Promise<void> {
    if (isProcessing || memoryQueue.length === 0) return;

    isProcessing = true;
    const currentJob = memoryQueue.shift()!;
    const { complaintId } = currentJob;

    console.log(`\n======================================================`);
    console.log(`[Queue Engine] Analyzing Complaint ID: ${complaintId}`);
    console.log(`[Queue Engine] Remaining in Queue: ${memoryQueue.length}`);
    console.log(`======================================================`);

    const geminiUploadedFiles: any[] = [];
    const localTrackedPaths: string[] = [];

    try {
        const db = mongoClient.db(process.env.DB_NAME);
        const reportCollection: Collection = db.collection('reports');

        // Fetch report details directly from MongoDB
        const report = await reportCollection.findOne({ _id: new ObjectId(complaintId) });
        if (!report) {
            throw new Error(`Report not found in database for ID: ${complaintId}`);
        }

        const narrative = report.narrative;
        const proofFiles: CloudinaryUpload[] = report.proofUrls || [];

        // STEP 0: MARK REPORT AS PROCESSING IN THE DATABASE
        await reportCollection.updateOne(
            { _id: new ObjectId(complaintId) },
            {
                $set: { status: "PROCESSING" },
                $push: {
                    updatedAt: {
                        timestamp: new Date(),
                        status: "PROCESSING",
                        verifiedBy: "Ai",
                        adminId: null,
                        note: "AI verification queue processing started."
                    }
                } as any
            }
        );
        console.log(`[Engine] Database status set to PROCESSING for Complaint ID: ${complaintId}`);

        // STEP 1: STREAM CORES FROM CLOUDINARY TO LOCAL DISK (Memory Safety)
        for (let i = 0; i < proofFiles.length; i++) {
            const file = proofFiles[i];
            const cleanUrl = file.secureUrl;

            // Extract the extension from Cloudinary URL (e.g. .webp, .mp4)
            const urlObj = new URL(cleanUrl);
            let extension = path.extname(urlObj.pathname).toLowerCase();
            if (!extension) {
                extension = file.resource_type === 'video' ? '.mp4' : '.jpg';
            }

            const localPath = path.join(tempDir, `comp_${complaintId}_proof_${i}${extension}`);
            localTrackedPaths.push(localPath);

            console.log(`[Engine] Downloading asset: ${cleanUrl}`);
            const response = await fetch(cleanUrl);
            if (!response.body) throw new Error(`Could not mount streaming interface for URL: ${cleanUrl}`);

            await pipeline(response.body as any, fs.createWriteStream(localPath));

            // STEP 2: UPLOAD TO GEMINI FILE API CONTEXT
            console.log(`[Engine] Uploading local file stream to Gemini...`);
            const targetMime = getMimeType(extension, file.resource_type);
            const uploadedFile = await ai.files.upload({
                file: localPath,
                config: {
                    mimeType: targetMime
                }
            });

            if (!uploadedFile.name) {
                throw new Error("Gemini file upload failed: File name is undefined.");
            }

            let fileStatus = await ai.files.get({ name: uploadedFile.name });
            while (fileStatus.state === 'PROCESSING') {
                console.log(`[Engine] Gemini is indexing media, waiting 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                fileStatus = await ai.files.get({ name: uploadedFile.name });
            }

            if (fileStatus.state === 'FAILED') throw new Error("Gemini internal media parsing error.");

            console.log(`[Engine] Content bound safely to Gemini: ${uploadedFile.name}`);
            geminiUploadedFiles.push(uploadedFile);
        }

        // STEP 3: PROMPT CONSTRUCT SYSTEM
        const combinedPrompt = `
You are the core security and engineering AI layer for "Anti-Ragging Bangladesh." Your task is to process raw first-person reports of university ragging and output a strictly structured JSON object for public documentation.

CRITICAL LANGUAGE & PERSPECTIVE RULES:
1. LANGUAGE MATCHING: You must output the "sanitizedTitle" and "sanitizedDescription" in the EXACT same language and script style as the input text. 
   - If the input is in Bangla script (বাংলা), the output must be in Bangla script.
   - If the input is in English, the output must be in English.
   - If the input is in Banglish (Bengali written using the Latin alphabet, e.g., "amake rater bela daka hoyechelo"), the output must be strictly in Banglish, matching the phonetic style of the user.
2. FIRST-PERSON VIEW: Keep the narrative strictly in the FIRST-PERSON PERSPECTIVE ("I", "আমার", "amake", "amari"). Do not convert the story to third-person. Preserve the exact emotional weight, timelines, specific room numbers, and locations.

ABSOLUTE SAFETY & MODERATION RULES:
1. REMOVE PROFANITY: Completely strip out or rephrase any explicit slang, vulgarities, or political slogans while preserving the underlying factual narrative context.
2. SEAMLESS DEFAMATION SHIELD (NO BRACKETS): You must protect individual identities and prevent political weaponization by omitting or generalizing targeted names. 
   - DO NOT use brackets (e.g., do not write "[a senior student]"). 
   - Replace explicit specific individual names or political student wing affiliations with seamless generic terms that flow naturally in the sentence structure.
   - Example 1 (Banglish): "Khaled namer ek boro vai" -> "ek boro vai".
   - Example 2 (English): If 5 individual names are listed ("Asif, Fahim, Siyam...") -> change to "5 senior students".
   - Example 3 (Bangla): "ছাত্রলীগের ইমতিয়াজ আর সাজিদ" -> "রাজনৈতিক সংগঠনের দুই বড় ভাই" or "দুইজন বড় ভাই".

${proofFiles.length > 0 ? `
CRITICAL PROOF ANALYSIS (VIDEO/IMAGE/AUDIO):
You have been provided with attached multimedia evidence files. Analyze this evidence strictly in relation to the user's text description:
1. RELEVANCE CHECK: If the uploaded content is completely irrelevant (e.g., a random meme, movie clip, empty classroom, or spam), you MUST set "isRaggingIncident" to false and set "rejectionReason" to "Irrelevant multimedia proof content provided".
2. CORROBORATION CHECK: Evaluate if the visual/audible elements back up the text. For example, if the text claims "10 boys dragged me" but the video only shows 2 people talking calmly, adjust and lower the "detectedSeverity" tracking matrix accordingly.
3. VERDICT RULE: If the proof matches or correlates with the narrative of harassment, mental/physical abuse, or intimidation, "isRaggingIncident" MUST be true. Set the severity according to both textual and visual gravity.
` : ''}

OUTPUT FORMAT SPECIFICATION:
You must respond ONLY with a raw JSON object matching the schema below. Do not wrap the JSON output inside markdown block markers (such as \`\`\`json ... \`\`\`). Do not include any conversational text outside the JSON object.

JSON SCHEMA:
{
  "isRaggingIncident": boolean, // true if the text/proof describes actual ragging, physical/mental abuse, systemic intimidation, or forced attendance. false if it is an unrelated academic issue or spam.
  "sanitizedTitle": "string", // A clean, professional headline summarizing the incident matching the input language/script.
  "sanitizedDescription": "string", // The first-person, seamlessly redacted, profanity-free narrative matching the input language/script. No brackets allowed.
  "detectedSeverity": "LOW" | "MEDIUM" | "HIGH", // HIGH if physical harm, confinement, weapons, or extreme mental torture is detailed.
  "rejectionReason": "string" | null // If isRaggingIncident is false, provide a short, clear reason in English explaining why.
}

Incident Narrative: 
"${narrative}"
`;

        // STEP 4: FETCH AI VERDICT
        console.log(`[Engine] Dispatching context tree vectors to Gemini...`);
        const modelResponse = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: [
                combinedPrompt,
                ...geminiUploadedFiles.map(file => ({
                    fileData: {
                        fileUri: file.uri,
                        mimeType: file.mimeType
                    }
                }))
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        isRaggingIncident: { type: "BOOLEAN" },
                        sanitizedTitle: { type: "STRING" },
                        sanitizedDescription: { type: "STRING" },
                        detectedSeverity: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH"] },
                        rejectionReason: { type: "STRING", nullable: true }
                    },
                    required: ["isRaggingIncident", "sanitizedTitle", "sanitizedDescription", "detectedSeverity", "rejectionReason"]
                }
            }
        });

        if (!modelResponse.text) throw new Error("AI returned empty string evaluation framework.");
        const aiVerdict: AiVerdict = JSON.parse(modelResponse.text);

        console.log(`[Engine] Assessment Completed. Result: ${aiVerdict.isRaggingIncident} | Severity: ${aiVerdict.detectedSeverity}`);

        // STEP 5: SAVE TO MONGODB
        const finalStatus = aiVerdict.isRaggingIncident ? "SUBMITTED" : "REJECTED";

        await reportCollection.updateOne(
            { _id: new ObjectId(complaintId) },
            {
                $set: {
                    isRaggingIncident: aiVerdict.isRaggingIncident,
                    sanitizedTitle: aiVerdict.sanitizedTitle,
                    sanitizedDescription: aiVerdict.sanitizedDescription,
                    detectedSeverity: aiVerdict.detectedSeverity,
                    rejectionReason: aiVerdict.rejectionReason,
                    verifiedBy: "Ai",
                    status: finalStatus
                },
                $push: {
                    updatedAt: {
                        timestamp: new Date(),
                        status: finalStatus,
                        verifiedBy: "Ai",
                        adminId: null,
                        note: aiVerdict.isRaggingIncident ? "Passed automated validation checkpoint." : aiVerdict.rejectionReason
                    }
                } as any
            }
        );
        console.log(`[Engine] Successfully updated Database record for: ${complaintId}`);

    } catch (error) {
        console.error(`[Engine Critical Error] Processing breakdown on entry ${complaintId}:`, error);
        // Optional: Update DB status to failed or enqueued back to allow human retry
    } finally {
        // STEP 6: EXPEL LOCAL METRICS & DISK SPACE PURGES
        console.log(`[Engine Cleaning] Running local disk recovery...`);
        for (const localPath of localTrackedPaths) {
            if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
        for (const remoteFile of geminiUploadedFiles) {
            try {
                if (remoteFile && remoteFile.name) {
                    await ai.files.delete({ name: remoteFile.name });
                }
            } catch { }
        }

        // Reset tracking flags and automatically invoke the next item waiting in line
        isProcessing = false;
        processNextJob();
    }
}

// ==========================================
// 4. RECEIVER ENDPOINT
// ==========================================
app.post('/webhook/new-report', (req: Request<{}, {}, { complaintId: string }>, res: Response): any => {
    try {
        const { complaintId } = req.body;

        if (!complaintId) {
            return res.status(400).json({ error: "Missing required identifier parameter." });
        }

        // Drop the report cleanly into the local execution array
        memoryQueue.push({ complaintId });
        console.log(`[Receiver] Enqueued Complaint ${complaintId}. Total queue depth: ${memoryQueue.length}`);

        // Trigger the engine execution sequence asynchronously
        processNextJob();

        // Respond to Next.js immediately (under 100ms)
        return res.status(200).json({ success: true, message: "Successfully enqueued for AI moderation." });
    } catch (error) {
        console.error("[Receiver Error]", error);
        return res.status(500).json({ error: "Internal processing queue breakdown." });
    }
});

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("<h1>Anti-Ragging Verification System Running Smoothly ✅</h1><p>Always-on Type-Safe Verification System handling active processes on Port: 4000</p>");
});

// ==========================================
// 5. CRASH RECOVERY DATABASE RESYNC
// ==========================================
async function recoverUnprocessedReports() {
    try {
        const db = mongoClient.db(process.env.DB_NAME);
        const unprocessed = await db.collection('reports')
            .find({ status: { $in: ["QUEUED", "PROCESSING"] } })
            .toArray();

        if (unprocessed.length > 0) {
            console.log(`[Recovery] Found ${unprocessed.length} unfinished/queued reports in MongoDB. Reloading to queue...`);
            for (const doc of unprocessed) {
                memoryQueue.push({
                    complaintId: doc._id.toString()
                });
            }
            // Fire off processing sequence
            processNextJob();
        } else {
            console.log("[Recovery] Clean startup. No pending 'QUEUED' or 'PROCESSING' cases found in MongoDB.");
        }
    } catch (err) {
        console.error("[Recovery Error] Failed loading pending records from MongoDB:", err);
    }
}

// ==========================================
// 6. SERVER SYSTEM LIFECYCLE
// ==========================================
const PORT = process.env.PORT || 4000;
async function startServer(): Promise<void> {
    try {
        await mongoClient.connect();
        console.log("✔ Connected to MongoDB safely.");

        // Scan for entries that missed evaluation due to server update downtime/restarts
        await recoverUnprocessedReports();

        app.listen(PORT, () => console.log(`🚀 24/7 Safety Worker active on Port: ${PORT}`));
    } catch (err) {
        console.error("Fatal boot error:", err);
        process.exit(1);
    }
}

startServer();