import { ObjectId } from "mongodb"

export interface GetLocation {
    _id: string,
    [category: string]: string[] | string
}

export interface AiVerificationResult {
    success: boolean
    isRaggingIncident?: boolean;
    sanitizedTitle?: string;
    sanitizedDescription?: string;
    detectedSeverity?: "LOW" | "MEDIUM" | "HIGH";
    rejectionReason?: string | null;
}

export interface ReportPayload {
    university: string;
    dateTime: Date;
    harassmentType: string;
    locationCategory: string;
    specificLocation: string;
    narrative: string;
    proofUrls: string[];
    createdAt: Date;
    isRaggingIncident?: boolean;
    sanitizedTitle?: string;
    sanitizedDescription?: string;
    detectedSeverity?: "LOW" | "MEDIUM" | "HIGH";
    rejectionReason?: string | null;
    verifiedBy?: string;
    status: "PENDING" | "SUBMITTED" | "REJECTED";
    adminVerification: {
        isRequested: boolean,
        appealNote: string,
        status: string,
        adminId: string,
        appealSubmittedAt: Date | null,
        adminNote: string
    };
    postId:string,
    studentEmail:string,
    userId:string
}