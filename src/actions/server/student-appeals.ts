"use server";

import { dbConnect, collections } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { generateBlindIndex } from "@/lib/encryption";
import { MyDetailedReport } from "./my-reports";

export interface GetMyAppealsOptions {
  limit?: number;
  skip?: number;
  searchQuery?: string;
  statusFilter?: string; // "All", "PENDING", "APPROVED", "REJECTED"
}

export async function getMyAppeals(options: GetMyAppealsOptions = {}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const { limit = 10, skip = 0, searchQuery = "", statusFilter = "All" } = options;
    const emailSearchHash = generateBlindIndex(session.user.email);

    // Filter to reports submitted by this user that requested a human-review appeal
    const query: any = {
      "studentDetails.studentEmail": emailSearchHash,
      "adminVerification.isRequested": true
    };

    // Apply status filter
    if (statusFilter !== "All") {
      query["adminVerification.status"] = statusFilter;
    }

    // Apply search query
    if (searchQuery) {
      const searchRegex = { $regex: searchQuery, $options: "i" };
      query.$or = [
        { postId: searchRegex },
        { harassmentType: searchRegex },
        { sanitizedTitle: searchRegex },
        { "adminVerification.appealNote": searchRegex }
      ];
    }

    const rawReports = await dbConnect(collections.REPORTS)
      .find(query)
      .project({
        postId: 1,
        createdAt: 1,
        university: 1,
        harassmentType: 1,
        specificLocation: 1,
        sanitizedTitle: 1,
        sanitizedDescription: 1,
        detectedSeverity: 1,
        status: 1,
        proofUrls: 1,
        dateTime: 1,
        isRaggingIncident: 1,
        narrative: 1,
        rejectionReason: 1,
        adminVerification: 1
      })
      .sort({ "adminVerification.appealSubmittedAt": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await dbConnect(collections.REPORTS).countDocuments(query);

    const data: MyDetailedReport[] = rawReports.map((item) => ({
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
    }));

    return { success: true, data, total };
  } catch (error: any) {
    console.error("Error in getMyAppeals:", error);
    return { success: false, error: error.message || "Failed to fetch appeals." };
  }
}
