"use server"

import { dbConnect, collections } from "@/lib/dbConnect"
import { AiVerificationResult, CloudinaryUpload, GetLocation, ReportPayload } from "@/types/reportForm.type"
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

export const generateSignature = async (paramsToSign: Record<string, any>) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new Error("Unauthorized");
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
        throw new Error("Cloudinary API secret not configured on server");
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    return signature;
};

export const postReport = async (reportData: FormData) => {
    const session = await getServerSession(authOptions)
    try {
        const university = reportData.get("university") as string;
        const dateTime = reportData.get("dateTime") as string;
        const harassmentType = reportData.get("harassmentType") as string;
        const locationCategory = reportData.get("locationCategory") as string;
        const specificLocation = reportData.get("specificLocation") as string;
        const narrative = reportData.get("narrative") as string;

        if (narrative.length > 3500) {
            return {
                success: false,
                message: "Narrative cannot exceed 3500 characters."
            };
        }

        const proofUrlsStr = reportData.get("proofUrls") as string;
        let proofUrls: CloudinaryUpload[] | null = null;
        if (proofUrlsStr) {
            try {
                proofUrls = JSON.parse(proofUrlsStr) as CloudinaryUpload[];
            } catch (err) {
                console.error("Error parsing proofUrls:", err);
            }
        }

        if (proofUrls && proofUrls.length > 5) {
            return {
                success: false,
                message: "You can upload a maximum of 5 files."
            };
        }

        const emailSearchHash = generateBlindIndex(session?.user?.email || "")

        const studentInfo = await dbConnect(collections.USERS).findOne({ emailSearchHash }, { projection: { userId: 1, studentDetails: 1, reportingBanUntil: 1 } })

        if (studentInfo?.reportingBanUntil && new Date() < new Date(studentInfo.reportingBanUntil)) {
            return {
                success: false,
                message: `Your account is temporarily suspended from submitting new reports until ${new Date(studentInfo.reportingBanUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} due to safety policy violations.`
            };
        }

        // Initialize report parameters into a persistent QUEUED status configuration block
        const payload: ReportPayload = {
            university,
            dateTime: new Date(dateTime),
            harassmentType,
            locationCategory,
            specificLocation,
            narrative,
            proofUrls,
            createdAt: new Date(),
            isRaggingIncident: false, 
            detectedSeverity: "LOW",  
            rejectionReason: null,
            verifiedBy: "",
            status: "QUEUED",    
            sanitizedTitle: "",         
            sanitizedDescription: "",  
            adminVerification: null,
            upVotesCount: 0,
            upVotesBy: [],
            postId: nanoid(12),
            studentDetails: {
                studentEmail: emailSearchHash,
                userId: studentInfo ? `${studentInfo?.userId}:${studentInfo?._id.toString()}` : "",
                university: studentInfo?.studentDetails?.university || "",
                academicSession: studentInfo?.studentDetails?.academicSession || "",
            },
            updatedAt: [
                {
                    timestamp: new Date(),
                    status: "QUEUED" as any,
                    verifiedBy: "System",
                    adminId: null,
                    note: "Report submitted and enqueued for multi-modal AI investigation."
                }
            ]
        };

        const result = await dbConnect(collections.REPORTS).insertOne(payload)

        if (result.acknowledged) {
            // Asynchronously wake up the 24/7 standalone worker processing thread
            // We omit "await" here to return a rapid UI confirmation banner to the student
            const workerUrl = process.env.BACKGROUND_WORKER_URL

            fetch(`${workerUrl}/webhook/new-report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ complaintId: result.insertedId.toString() })
            }).catch((err) => {
                // Catches isolated network connection drops so your frontend process doesn't fail
                console.error("[Worker Webhook Ping Failed]:", err);
            });

            return {
                success: true,
                message: "Report submitted successfully. Verification processing is running in the background."
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