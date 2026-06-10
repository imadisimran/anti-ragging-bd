"use server"

import { dbConnect, collections } from "@/lib/dbConnect"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { generateBlindIndex } from "@/lib/encryption"
import { ProofUrlType } from "@/types/DashboardTypes"

export interface StudentReport {
  postId: string;
  createdAt: Date;
  university: string;
  harassmentType: string;
  specificLocation: string;
  sanitizedTitle: string;
  sanitizedDescription: string;
  detectedSeverity: string;
  status: string;
  proofUrls: ProofUrlType[];
  dateTime: Date;
  isRaggingIncident: boolean;
}

export interface StudentDashboardResponse {
  success: boolean;
  data?: StudentReport[];
  error?: string;
}

export interface StudentReportDetailResponse {
  success: boolean;
  data?: StudentReport;
  error?: string;
}

/**
 * Fetch all reports submitted by the logged-in student using their hashed email
 */
export async function getStudentReports(): Promise<StudentDashboardResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Unauthorized. Please log in." }
    }

    const emailSearchHash = generateBlindIndex(session.user.email)
    const rawReports = await dbConnect(collections.REPORTS)
      .find({ "studentDetails.studentEmail": emailSearchHash })
      .toArray()

    const reports: StudentReport[] = rawReports.map((item) => ({
      postId: item.postId || "",
      createdAt: item.createdAt || new Date(),
      university: item.university || "",
      harassmentType: item.harassmentType || "",
      specificLocation: item.specificLocation || "",
      sanitizedTitle: item.sanitizedTitle || "",
      sanitizedDescription: item.sanitizedDescription || "",
      detectedSeverity: item.detectedSeverity || "LOW",
      status: item.status || "SUBMITTED",
      proofUrls: item.proofUrls,
      dateTime: item.dateTime || new Date(),
      isRaggingIncident: item.isRaggingIncident ?? true
    }))

    return { success: true, data: reports }
  } catch (error) {
    console.error("Error in getStudentReports server action:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch student reports." 
    }
  }
}

/**
 * Fetch full details of a specific post submitted by the student
 */
export async function getStudentReportDetail(postId: string): Promise<StudentReportDetailResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Unauthorized. Please log in." }
    }

    const emailSearchHash = generateBlindIndex(session.user.email)
    const rawReport = await dbConnect(collections.REPORTS).findOne({
      postId,
      "studentDetails.studentEmail": emailSearchHash
    })

    if (!rawReport) {
      return { success: false, error: "Report not found or access denied." }
    }

    const report: StudentReport = {
      postId: rawReport.postId || "",
      createdAt: rawReport.createdAt || new Date(),
      university: rawReport.university || "",
      harassmentType: rawReport.harassmentType || "",
      specificLocation: rawReport.specificLocation || "",
      sanitizedTitle: rawReport.sanitizedTitle || "",
      sanitizedDescription: rawReport.sanitizedDescription || "",
      detectedSeverity: rawReport.detectedSeverity || "LOW",
      status: rawReport.status || "SUBMITTED",
      proofUrls: rawReport.proofUrls ? rawReport.proofUrls.map((p: any) => typeof p === "string" ? p : p.secureUrl || p) : [],
      dateTime: rawReport.dateTime || new Date(),
      isRaggingIncident: rawReport.isRaggingIncident ?? true
    }

    return { success: true, data: report }
  } catch (error) {
    console.error("Error in getStudentReportDetail server action:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch report details."
    }
  }
}
