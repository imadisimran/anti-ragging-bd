"use server"
import { collections, dbConnect } from "@/lib/dbConnect"
import { ReportDetail, ShortReport, ShortReports } from "@/types/report.type"

export const getShortReports = async (): Promise<ShortReports> => {
    try {
        const rawData = await dbConnect(collections.REPORTS).find({ isRaggingIncident: true }, { projection: { postId: 1, sanitizedTitle: 1, sanitizedDescription: 1, dateTime: 1, university: 1, specificLocation: 1, createdAt: 1, "studentDetails.userId": 1, status: 1 } }).toArray()
        const data: ShortReport[] = rawData.map(item => ({
            postId: item.postId,
            userId: item.studentDetails?.userId ? item.studentDetails.userId.split(":")[0] : "",
            title: item.sanitizedTitle,
            description: item.sanitizedDescription,
            dateTime: item.dateTime,
            location: `${item.university} - ${item.specificLocation}`,
            createdAt: item.createdAt,
            status: item.status
        }))
        const reports: ShortReports = { success: true, data }
        return reports
    } catch (error) {
        console.error(error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch reports. Please try again later."
        }
    }
}

export const getDetailsReport = async (id: string): Promise<ReportDetail> => {
    try {
        const rawReportData = await dbConnect(collections.REPORTS).findOne({ postId: id }, { projection: { university: 1, dateTime: 1, harassmentType: 1, specificLocation: 1, proofUrls: 1, createdAt: 1, detectedSeverity: 1, status: 1, sanitizedTitle: 1, sanitizedDescription: 1, postId: 1, "studentDetails.userId": 1, "studentDetails.academicSession": 1, "studentDetails.university": 1 } })

        if (!rawReportData) {
            return { success: false, error: "Report not found." }
        }

        const data: ReportDetail = {
            success: true,
            data: {
                postId: rawReportData.postId || "",
                userId: rawReportData.studentDetails?.userId ? rawReportData.studentDetails.userId.split(":")[0] : "",
                university: rawReportData.university || "",
                reporterUniversity: rawReportData.studentDetails?.university || "",
                academicSession: rawReportData.studentDetails?.academicSession || "",
                dateTime: rawReportData.dateTime,
                harassmentType: rawReportData.harassmentType || "",
                specificLocation: rawReportData.specificLocation || "",
                proofUrls: rawReportData.proofUrls || [],
                createdAt: rawReportData.createdAt,
                detectedSeverity: rawReportData.detectedSeverity || "LOW",
                status: rawReportData.status || "PENDING",
                title: rawReportData.sanitizedTitle || "",
                description: rawReportData.sanitizedDescription || ""
            }
        }
        return data
    } catch (error) {
        console.error(error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to retrieve report details."
        }
    }
}