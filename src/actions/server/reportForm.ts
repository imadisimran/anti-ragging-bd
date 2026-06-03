"use server"

import { dbConnect, collections } from "@/lib/dbConnect"
import { AiVerificationResult, GetLocation, ReportPayload } from "@/types/reportForm.type"
import { v2 as cloudinary } from 'cloudinary'
import { GoogleGenAI } from "@google/genai";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { generateBlindIndex } from "@/lib/encryption";

export const getLocation = async (universityName: string, category: string): Promise<GetLocation | null> => {
    if (!category) {
        return null
    }
    const data = await dbConnect(collections.UNIVERSITIES).findOne({ university: universityName }, { projection: { [category]: 1 } })
    if (!data) {
        return null
    }
    const newData: GetLocation = { ...data, _id: data._id.toString() }
    return newData
}

const uploadToCloudinary = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "anti-ragging-reports" },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(result)
                    resolve(result?.secure_url || "");
                }
            }
        ).end(buffer);
    });
};

export const aiVerification = async (narrative: string) => {

    try {
        const ai = new GoogleGenAI({});
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `You are the core security and engineering AI layer for "Anti-Ragging Bangladesh." Your task is to process raw first-person reports of university ragging and output a strictly structured JSON object for public documentation.

CRITICAL LANGUAGE & PERSPECTIVE RULES:
1. LANGUAGE MATCHING: You must output the "sanitizedTitle" and "sanitizedDescription" in the EXACT same language and script style as the input text. 
   - If the input is in Bangla script (বাংলা), the output must be in Bangla script.
   - If the input is in English, the output must be in English.
   - If the input is in Banglish (Bengali written using the Latin alphabet, e.g., "amake rater bela daka hoyechelo"), the output must be strictly in Banglish, matching the phonetic style of the user.
2. FIRST-PERSON VIEW: Keep the narrative strictly in the FIRST-PERSON PERSPECTIVE ("I", "আমার", "amake", "amari"). Do not convert the story to third-person. Preserve the exact emotional weight, timelines, specific room numbers, and locations.

ABSOLUTE SAFETY & MODERATION RULES:
1. REMOVE PROFANITY: Completely strip out or rephrase any explicit slang, vulgarities, or political slogans while preserving the underlying factual narrative.
2. SEAMLESS DEFAMATION SHIELD (NO BRACKETS): You must protect individual identities and prevent political weaponization by omitting or generalizing targeted names. 
   - DO NOT use brackets (e.g., do not write "[a senior student]"). 
   - Replace explicit specific individual names or political student wing affiliations with seamless generic terms that flow naturally in the sentence.
   - Example 1 (Banglish): "Khaled namer ek boro vai" -> "ek boro vai".
   - Example 2 (English): If 5 individual names are listed ("Asif, Fahim, Siyam, Joy, and Tanvir") -> change to "5 senior students".
   - Example 3 (Bangla): "ছাত্রলীগের ইমতিয়াজ আর সাজিদ" -> "রাজনৈতিক সংগঠনের দুই বড় ভাই" or "দুইজন বড় ভাই".

You must respond ONLY with a JSON object matching this schema:
{
  "isRaggingIncident": boolean, // true if the text describes actual ragging, physical/mental abuse, or forced attendance. false if it is an unrelated academic complaint.
  "sanitizedTitle": "string", // A clean headline summarizing the incident matching the input language/script.
  "sanitizedDescription": "string", // The first-person, seamlessly redacted, profanity-free narrative matching the input language/script. No brackets allowed.
  "detectedSeverity": "LOW" | "MEDIUM" | "HIGH", // HIGH if physical harm, confinement, or extreme mental torture is detailed.
  "rejectionReason": "string" | null // If isRaggingIncident is false, provide a short reason in English for the human admin review queue.
}

Incident: ${narrative}

Don't return anything except json format.`,
        });

        // console.log(response.text)

        const result: AiVerificationResult = JSON.parse(response.text || "")
        result.success = true
        return result
    } catch (error) {
        console.log(error)
        return { success: false }
    }
}

export const postReport = async (reportData: FormData) => {
    const session = await getServerSession(authOptions)
    try {
        const university = reportData.get("university") as string;
        const dateTime = reportData.get("dateTime") as string;
        const harassmentType = reportData.get("harassmentType") as string;
        const locationCategory = reportData.get("locationCategory") as string;
        const specificLocation = reportData.get("specificLocation") as string;
        const narrative = reportData.get("narrative") as string;

        const aiResult = await aiVerification(narrative)

        // console.log(aiResult)

        const files = reportData.getAll("proofFiles") as File[];

        const uploadPromises = files
            .filter((file) => file.size > 0 && file.name !== "undefined")
            .map((file) => uploadToCloudinary(file));

        const proofUrls = await Promise.all(uploadPromises);

        const emailSearchHash = generateBlindIndex(session?.user?.email || "")

        const userId = await dbConnect(collections.USERS).findOne({ emailSearchHash }, { projection: { userId: 1 } })

        const payload: ReportPayload = {
            university,
            dateTime: new Date(dateTime),
            harassmentType,
            locationCategory,
            specificLocation,
            narrative,
            proofUrls,
            createdAt: new Date(),
            isRaggingIncident: aiResult.success ? aiResult.isRaggingIncident : false,
            detectedSeverity: aiResult.success ? aiResult.detectedSeverity : "LOW",
            rejectionReason: aiResult.success ? aiResult.rejectionReason : null,
            verifiedBy: aiResult.success ? "Ai" : "",
            status: aiResult.success ? "SUBMITTED" : "PENDING",
            sanitizedTitle: aiResult.success ? aiResult.sanitizedTitle : "",
            sanitizedDescription: aiResult.success ? aiResult.sanitizedDescription : "",
            adminVerification: {
                isRequested: false,
                appealNote: "",
                status: "",
                adminId: "",
                appealSubmittedAt: null,
                adminNote: ""
            },
            postId: nanoid(12),
            studentEmail: emailSearchHash,
            userId: userId ? `${userId?.userId}:${userId?._id.toString()}` : ""
        };

        const result = await dbConnect(collections.REPORTS).insertOne(payload)

        if (result.acknowledged) {
            return {
                success: true,
                message: "Report submitted successfully"
            }
        }
        return {
            success: false,
            message: "Failed to submit report"
        };
    } catch (error) {
        console.error("Error in postReport Server Action:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to submit report due to an unexpected error"
        };
    }
};