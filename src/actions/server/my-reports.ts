"use server"

import { dbConnect, collections } from "@/lib/dbConnect"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { generateBlindIndex } from "@/lib/encryption"

export interface MyDetailedReport {
  postId: string;
  createdAt: Date;
  university: string;
  harassmentType: string;
  specificLocation: string;
  sanitizedTitle: string;
  sanitizedDescription: string;
  detectedSeverity: string;
  status: string;
  proofUrls: string[];
  dateTime: Date;
  isRaggingIncident: boolean;
  narrative: string;
  rejectionReason: string | null;
  upVotesCount: number;
  adminVerification: {
    isRequested: boolean;
    appealNote: string;
    status: "PENDING" | "REJECTED" | "APPROVED";
    adminId: string;
    appealSubmittedAt: Date | null;
    adminNote: string;
    resolvedAt?: Date;
    resolvedBy?: string;
  } | null;
}

export interface MyReportsResponse {
  success: boolean;
  data?: MyDetailedReport[];
  error?: string;
}

export async function getMyDetailedReports(): Promise<MyReportsResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Unauthorized. Please log in." }
    }

    const emailSearchHash = generateBlindIndex(session.user.email)
    const rawReports = await dbConnect(collections.REPORTS)
      .find({ "studentDetails.studentEmail": emailSearchHash })
      .toArray()

    const reports: MyDetailedReport[] = rawReports.map((item) => ({
      postId: item.postId || "",
      createdAt: item.createdAt || new Date(),
      university: item.university || "",
      harassmentType: item.harassmentType || "",
      specificLocation: item.specificLocation || "",
      sanitizedTitle: item.sanitizedTitle || "",
      sanitizedDescription: item.sanitizedDescription || "",
      detectedSeverity: item.detectedSeverity || "LOW",
      status: item.status || "SUBMITTED",
      proofUrls: item.proofUrls ? item.proofUrls.map((p: any) => typeof p === "string" ? p : p.secureUrl || p) : [],
      dateTime: item.dateTime || new Date(),
      isRaggingIncident: item.isRaggingIncident ?? true,
      narrative: item.narrative || "",
      rejectionReason: item.rejectionReason || null,
      upVotesCount: item.upVotesCount || 0,
      adminVerification: item.adminVerification || null,
    }))

    // Sort reports by createdAt descending (newest first)
    reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return { success: true, data: reports }
  } catch (error) {
    console.error("Error in getMyDetailedReports server action:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch student reports."
    }
  }
}

export async function submitReportAppeal(
  postId: string,
  appealNote: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Unauthorized. Please log in." }
    }

    const emailSearchHash = generateBlindIndex(session.user.email)
    
    // Find report and verify ownership
    const report = await dbConnect(collections.REPORTS).findOne({
      postId,
      "studentDetails.studentEmail": emailSearchHash
    })

    if (!report) {
      return { success: false, error: "Report not found or permission denied." }
    }

    // Verify it is in a state that can be appealed
    if (report.isRaggingIncident === true) {
      return { success: false, error: "This report is already active and verified." }
    }

    // Check if user already appealed
    if (report.adminVerification?.isRequested) {
      return { success: false, error: "An appeal has already been requested for this report." }
    }

    const appealPayload = {
      isRequested: true,
      appealNote,
      status: "PENDING",
      adminId: "",
      appealSubmittedAt: new Date(),
      adminNote: "",
      resolvedAt: null,
      resolvedBy: null
    }

    const result = await dbConnect(collections.REPORTS).updateOne(
      { postId },
      { 
        $set: { 
          adminVerification: appealPayload 
        } 
      }
    )

    if (result.modifiedCount > 0) {
      return { success: true, message: "Appeal submitted successfully." }
    }
    return { success: false, error: "Failed to submit appeal." }
  } catch (error) {
    console.error("Error in submitReportAppeal server action:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit appeal."
    }
  }
}

