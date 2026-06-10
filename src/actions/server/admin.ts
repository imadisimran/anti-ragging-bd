"use server"

import { dbConnect, collections } from "@/lib/dbConnect"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { MyDetailedReport } from "./my-reports"
import { decryptData, generateBlindIndex } from "@/lib/encryption"

export interface AppealsResponse {
  success: boolean;
  data?: MyDetailedReport[];
  error?: string;
}

export interface BanStatsResponse {
  success: boolean;
  banHistoryCount?: number;
  error?: string;
}

export interface ModerationActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface VerifyAdminAuth {
  authorized: boolean;
  userId?: string | null;
  error?: string | null;
}

// Check if user has admin/teacher credentials
async function verifyAdminAuth(): Promise<VerifyAdminAuth> {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return { authorized: false, error: "Unauthorized. Please log in." }
  }
  const role = session.user.role
  if (role !== "ADMIN" && role !== "MASTER_ADMIN") {
    return { authorized: false, error: "Forbidden. Admin access required." }
  }
  return { authorized: true, userId: session.user.userId }
}

// Fetch all reports pending human review appeal
export async function getAppealsList(): Promise<AppealsResponse> {
  try {
    const auth = await verifyAdminAuth()
    if (!auth.authorized) {
      return { success: false, error: auth.error || "Unauthorized" }
    }

    const rawReports = await dbConnect(collections.REPORTS)
      .find({
        "adminVerification.isRequested": true,
        "adminVerification.status": "PENDING"
      })
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

    // Sort by appealSubmittedAt descending
    reports.sort((a, b) => {
      const dateA = a.adminVerification?.appealSubmittedAt ? new Date(a.adminVerification.appealSubmittedAt).getTime() : 0
      const dateB = b.adminVerification?.appealSubmittedAt ? new Date(b.adminVerification.appealSubmittedAt).getTime() : 0
      return dateB - dateA
    })

    return { success: true, data: reports }
  } catch (error) {
    console.error("Error in getAppealsList:", error)
    return { success: false, error: "Failed to fetch appeals queue." }
  }
}

// Approve or Reject an appeal
export async function resolveAppeal(
  postId: string,
  action: "APPROVE" | "REJECT",
  adminNote: string
): Promise<ModerationActionResponse> {
  try {
    const auth = await verifyAdminAuth()
    if (!auth.authorized) {
      return { success: false, error: auth.error || "Unauthorized" }
    }

    const report = await dbConnect(collections.REPORTS).findOne({ postId })
    if (!report) {
      return { success: false, error: "Report not found." }
    }

    const isRagging = action === "APPROVE"
    const statusVal = action === "APPROVE" ? "SUBMITTED" : "REJECTED"
    const appealStatus = action === "APPROVE" ? "APPROVED" : "REJECTED"

    const updatedVerification = {
      ...(report.adminVerification || {}),
      status: appealStatus,
      adminNote: adminNote || (action === "APPROVE" ? "Appeal approved by administrator." : "Appeal rejected by administrator."),
      resolvedAt: new Date(),
      resolvedBy: auth.userId
    }

    // Append to updatedAt log array
    const newUpdateLog = {
      timestamp: new Date(),
      status: statusVal,
      verifiedBy: "Admin",
      adminId: auth.userId,
      note: adminNote
    }

    const result = await dbConnect(collections.REPORTS).updateOne(
      { postId },
      {
        $set: {
          isRaggingIncident: isRagging,
          status: statusVal,
          adminVerification: updatedVerification
        },
        $push: {
          updatedAt: newUpdateLog
        }
      } as any
    )

    if (result.modifiedCount > 0) {
      return { success: true, message: `Report appeal successfully ${action.toLowerCase()}d.` }
    }
    return { success: false, error: "Failed to update report appeal status." }
  } catch (error) {
    console.error("Error in resolveAppeal server action:", error)
    return { success: false, error: "Failed to resolve report appeal." }
  }
}

// Directly reject an incident report
export async function rejectAdminIncident(
  postId: string,
  rejectionReason: string
): Promise<ModerationActionResponse> {
  try {
    const auth = await verifyAdminAuth()
    if (!auth.authorized) {
      return { success: false, error: auth.error || "Unauthorized" }
    }

    const report = await dbConnect(collections.REPORTS).findOne({ postId })
    if (!report) {
      return { success: false, error: "Report not found." }
    }

    const updatedVerification = {
      ...(report.adminVerification || {}),
      status: "REJECTED",
      adminNote: rejectionReason,
      resolvedAt: new Date(),
      resolvedBy: auth.userId
    }

    // Append to updatedAt log array
    const newUpdateLog = {
      timestamp: new Date(),
      status: "REJECTED",
      verifiedBy: "Admin",
      adminId: auth.userId,
      note: rejectionReason
    }

    const result = await dbConnect(collections.REPORTS).updateOne(
      { postId },
      {
        $set: {
          isRaggingIncident: false,
          status: "REJECTED",
          rejectionReason: rejectionReason,
          adminVerification: updatedVerification
        },
        $push: {
          updatedAt: newUpdateLog
        }
      } as any
    )

    if (result.modifiedCount > 0) {
      return { success: true, message: "Incident report successfully rejected." }
    }
    return { success: false, error: "Failed to update incident report status." }
  } catch (error) {
    console.error("Error in rejectAdminIncident server action:", error)
    return { success: false, error: "Failed to reject incident report." }
  }
}

// Fetch cumulative ban history count for a report's author
export async function getReporterBanStats(postId: string): Promise<BanStatsResponse> {
  try {
    const auth = await verifyAdminAuth()
    if (!auth.authorized) {
      return { success: false, error: auth.error || "Unauthorized" }
    }

    const report = await dbConnect(collections.REPORTS).findOne({ postId })
    if (!report || !report.studentDetails || !report.studentDetails.studentEmail) {
      return { success: false, error: "Report or reporter details not found." }
    }

    const studentEmailHash = report.studentDetails.studentEmail
    const user = await dbConnect(collections.USERS).findOne({ emailSearchHash: studentEmailHash })
    if (!user) {
      return { success: false, error: "Reporter user account not found." }
    }

    return { success: true, banHistoryCount: user.banHistoryCount || 0 }
  } catch (error) {
    console.error("Error in getReporterBanStats:", error)
    return { success: false, error: "Failed to retrieve student ban statistics." }
  }
}

// Ban a student reporter for 3 months, 6 months, or permanently
export async function banReporter(
  postId: string,
  duration: "3" | "6" | "permanent",
  reason: string
): Promise<ModerationActionResponse> {
  try {
    const auth = await verifyAdminAuth()
    if (!auth.authorized) {
      return { success: false, error: auth.error || "Unauthorized" }
    }

    const report = await dbConnect(collections.REPORTS).findOne({ postId })
    if (!report || !report.studentDetails || !report.studentDetails.studentEmail) {
      return { success: false, error: "Report or reporter details not found." }
    }

    const studentEmailHash = report.studentDetails.studentEmail
    const user = await dbConnect(collections.USERS).findOne({ emailSearchHash: studentEmailHash })
    if (!user) {
      return { success: false, error: "Reporter user account not found." }
    }

    // Double check permanent ban criteria
    const currentBanHistory = user.banHistoryCount || 0
    if (duration === "permanent" && currentBanHistory < 2) {
      return { success: false, error: "Permanent suspension is only allowed for users with at least 2 previous suspensions." }
    }

    let bannedUntilDate: Date
    const now = Date.now()
    if (duration === "3") {
      bannedUntilDate = new Date(now + 3 * 30 * 24 * 60 * 60 * 1000)
    } else if (duration === "6") {
      bannedUntilDate = new Date(now + 6 * 30 * 24 * 60 * 60 * 1000)
    } else {
      // Permanent suspension: 100 years into the future
      bannedUntilDate = new Date(now + 100 * 365 * 24 * 60 * 60 * 1000)
    }

    const result = await dbConnect(collections.USERS).updateOne(
      { emailSearchHash: studentEmailHash },
      {
        $set: {
          reportingBanUntil: bannedUntilDate,
          reportingBanReason: reason
        },
        $inc: {
          banHistoryCount: 1
        }
      }
    )

    if (result.modifiedCount > 0) {
      return {
        success: true,
        message: `Reporter suspended successfully. Duration: ${duration === "permanent" ? "Permanent" : `${duration} Months`}.`
      }
    }
    return { success: false, error: "Failed to apply suspension on the reporter account." }
  } catch (error) {
    console.error("Error in banReporter server action:", error)
    return { success: false, error: "Failed to suspend student reporter." }
  }
}

export interface BriefAdminIncident {
  postId: string;
  createdAt: Date;
  harassmentType: string;
  detectedSeverity: string;
  status: string;
}

export interface GetAdminIncidentsOptions {
  limit?: number;
  skip?: number;
  searchQuery?: string;
  priorityFilter?: string;
  statusFilter?: string;
}

export interface DetailAdminIncident {
  postId: string;
  createdAt: Date;
  harassmentType: string;
  detectedSeverity: string;
  status: string;
  university?: string;
  specificLocation?: string;
  narrative?: string;
  proofUrls?: any[];
  adminVerification?: any;
  isRaggingIncident?: boolean;
  rejectionReason?: string | null;
  userId: string
}

export async function getAdminIncidents(options: GetAdminIncidentsOptions = {}): Promise<{ success: boolean; data?: BriefAdminIncident[]; error?: string; total?: number }> {
  try {
    const auth = await verifyAdminAuth()
    if (!auth.authorized) {
      return { success: false, error: auth.error || "Unauthorized" }
    }

    const { limit = 5, skip = 0, searchQuery = "", priorityFilter = "All", statusFilter = "All" } = options;

    const query: any = {};

    // status filter
    if (statusFilter === "All") {
      query.isRaggingIncident = true;
    } else {
      query.status = statusFilter;
    }

    // priority filter
    if (priorityFilter !== "All") {
      let severity = "LOW";
      if (priorityFilter === "High") severity = "HIGH";
      else if (priorityFilter === "Medium") severity = "MEDIUM";
      query.detectedSeverity = severity;
    }

    // search filter
    if (searchQuery) {
      const searchRegex = { $regex: searchQuery, $options: "i" };
      query.$or = [
        { postId: searchRegex },
        { harassmentType: searchRegex },
        { university: searchRegex },
        { specificLocation: searchRegex },
        { narrative: searchRegex }
      ];
    }

    const rawReports = await dbConnect(collections.REPORTS)
      .find(query)
      .project({
        postId: 1,
        createdAt: 1,
        harassmentType: 1,
        detectedSeverity: 1,
        status: 1
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await dbConnect(collections.REPORTS).countDocuments(query);

    const data: BriefAdminIncident[] = rawReports.map((item) => ({
      postId: item.postId || "",
      createdAt: item.createdAt || new Date(),
      harassmentType: item.harassmentType || "General Incident",
      detectedSeverity: item.detectedSeverity || "LOW",
      status: item.status || "PENDING",
    }));

    return { success: true, data, total };
  } catch (error) {
    console.error("Error in getAdminIncidents server action:", error);
    return { success: false, error: "Failed to fetch incidents list." };
  }
}

export async function getAdminIncidentDetails(postId: string): Promise<{ success: boolean; data?: DetailAdminIncident; error?: string }> {
  try {
    const auth = await verifyAdminAuth()
    if (!auth.authorized) {
      return { success: false, error: auth.error || "Unauthorized" }
    }

    const item = await dbConnect(collections.REPORTS).findOne(
      { postId },
      {
        projection: {
          postId: 1,
          createdAt: 1,
          harassmentType: 1,
          detectedSeverity: 1,
          status: 1,
          university: 1,
          specificLocation: 1,
          narrative: 1,
          "proofUrls.secureUrl": 1,
          "proofUrls.resource_type": 1,
          adminVerification: 1,
          isRaggingIncident: 1,
          rejectionReason: 1,
          "studentDetails.userId": 1
        }
      }
    );
    if (!item) {
      return { success: false, error: "Incident not found." };
    }

    const data: DetailAdminIncident = {
      postId: item.postId || "",
      createdAt: item.createdAt || new Date(),
      harassmentType: item.harassmentType || "General Incident",
      detectedSeverity: item.detectedSeverity || "LOW",
      status: item.status || "PENDING",
      university: item.university || "",
      specificLocation: item.specificLocation || "",
      narrative: item.narrative || "",
      proofUrls: item.proofUrls || [],
      adminVerification: item.adminVerification || null,
      isRaggingIncident: item.isRaggingIncident ?? false,
      rejectionReason: item.rejectionReason || null,
      userId: item.studentDetails?.userId?.split(":")[0] || "",
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error in getAdminIncidentDetails server action:", error);
    return { success: false, error: "Failed to fetch incident details." };
  }
}

export interface GetUsersOptions {
  limit?: number;
  skip?: number;
  searchQuery?: string;
  roleFilter?: string; // "All", "student", "AUTHORITY", "ADMIN"
}

export async function getRegisteredUsers(options: GetUsersOptions = {}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }
    const requesterRole = session.user.role;
    if (requesterRole !== "ADMIN" && requesterRole !== "MASTER_ADMIN") {
      return { success: false, error: "Forbidden. Admin access required." };
    }

    const { limit = 10, skip = 0, searchQuery = "", roleFilter = "All" } = options;

    const query: any = {};

    // Standard admins cannot see MASTER_ADMIN accounts in the registry
    if (requesterRole === "ADMIN") {
      query.role = { $ne: "MASTER_ADMIN" };
    }

    // Apply role filter
    if (roleFilter !== "All") {
      if (roleFilter === "BANNED") {
        query.reportingBanUntil = { $exists: true, $gt: new Date() };
      } else {
        if (roleFilter === "MASTER_ADMIN" && requesterRole === "ADMIN") {
          return { success: true, data: [], total: 0 };
        }
        query.role = roleFilter;
      }
    }

    // Apply search query
    if (searchQuery) {
      if (searchQuery.includes("@")) {
        const emailHash = generateBlindIndex(searchQuery);
        query.$or = [
          { emailSearchHash: emailHash },
          { email: { $regex: searchQuery, $options: "i" } }
        ];
      } else {
        const searchRegex = { $regex: searchQuery, $options: "i" };
        query.$or = [
          { userId: searchRegex },
          { name: searchRegex },
          { email: searchRegex },
          { "authorityDetails.designation": searchRegex },
          { "authorityDetails.university": searchRegex },
          { "authorityDetails.hall": searchRegex }
        ];
      }
    }

    const rawUsers = await dbConnect(collections.USERS)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await dbConnect(collections.USERS).countDocuments(query);

    const data = rawUsers.map((item) => {
      const isStudent = item.role === "student" || !item.role;
      let name = item.name || "";
      let email = item.email || "";
      let studentDetails = item.studentDetails || null;

      if (isStudent) {
        // Redact student details to ensure admin can only see userIds and nothing more
        name = "ANONYMOUS";
        email = "REDACTED";
        studentDetails = null;
      }

      return {
        id: item._id.toString(),
        userId: item.userId || "",
        name,
        email,
        role: item.role || "student",
        createdAt: item.createdAt || new Date(),
        isVerified: item.isVerified || false,
        authorityDetails: item.authorityDetails || null,
        studentDetails,
        reportingBanUntil: item.reportingBanUntil || null,
        reportingBanReason: item.reportingBanReason || null,
        banHistoryCount: item.banHistoryCount || 0
      };
    });

    return { success: true, data, total };
  } catch (error: any) {
    console.error("Error in getRegisteredUsers:", error);
    return { success: false, error: error.message || "Failed to fetch users." };
  }
}

export async function setupAuthorityProfile(
  userId: string,
  data: {
    name: string;
    email: string;
    designation: string;
    university: string;
    hall: string;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "MASTER_ADMIN") {
      return { success: false, error: "Forbidden. Master Admin access required." };
    }

    if (!data.name || !data.email || !data.designation || !data.university || !data.hall) {
      return { success: false, error: "All profile setup fields are required." };
    }

    const result = await dbConnect(collections.USERS).updateOne(
      { userId },
      {
        $set: {
          role: "AUTHORITY",
          name: data.name,
          email: data.email,
          emailSearchHash: generateBlindIndex(data.email),
          authorityDetails: {
            designation: data.designation,
            university: data.university,
            hall: data.hall
          }
        }
      }
    );

    if (result.matchedCount > 0) {
      return { success: true, message: "Authority profile successfully configured." };
    }
    return { success: false, error: "User not found." };
  } catch (error: any) {
    console.error("Error in setupAuthorityProfile:", error);
    return { success: false, error: error.message || "Failed to configure authority profile." };
  }
}

export async function liftReporterSuspension(userId: string): Promise<ModerationActionResponse> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error || "Unauthorized" };
    }

    const result = await dbConnect(collections.USERS).updateOne(
      { userId },
      {
        $set: {
          reportingBanUntil: null,
          reportingBanReason: null
        }
      }
    );

    if (result.matchedCount > 0) {
      return { success: true, message: "User reporting suspension successfully lifted." };
    }
    return { success: false, error: "User account not found." };
  } catch (error: any) {
    console.error("Error in liftReporterSuspension:", error);
    return { success: false, error: error.message || "Failed to lift user suspension." };
  }
}

export async function getBanMetrics(): Promise<{
  success: boolean;
  totalActiveBans: number;
  temporarySuspensions: number;
  permanentBans: number;
  error?: string;
}> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, totalActiveBans: 0, temporarySuspensions: 0, permanentBans: 0, error: auth.error || "Unauthorized" };
    }

    const now = new Date();
    const tenYearsFromNow = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);

    const totalActiveBans = await dbConnect(collections.USERS).countDocuments({
      reportingBanUntil: { $exists: true, $gt: now }
    });

    const temporarySuspensions = await dbConnect(collections.USERS).countDocuments({
      reportingBanUntil: { $exists: true, $gt: now, $lt: tenYearsFromNow }
    });

    const permanentBans = await dbConnect(collections.USERS).countDocuments({
      reportingBanUntil: { $exists: true, $gt: tenYearsFromNow }
    });

    return {
      success: true,
      totalActiveBans,
      temporarySuspensions,
      permanentBans
    };
  } catch (error: any) {
    console.error("Error in getBanMetrics:", error);
    return {
      success: false,
      totalActiveBans: 0,
      temporarySuspensions: 0,
      permanentBans: 0,
      error: error.message || "Failed to fetch ban metrics."
    };
  }
}
