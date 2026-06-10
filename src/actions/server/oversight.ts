"use server";

import { dbConnect, collections } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import crypto from "crypto";

// Helper to verify standard Admin or Master Admin authorization
async function verifyAdminOrMasterAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized. Please log in.");
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "MASTER_ADMIN") {
    throw new Error("Forbidden. Admin access required.");
  }
  return { userId: session.user.userId, name: session.user.name || "Administrator" };
}

// Helper to verify Master Admin strictly
async function verifyMasterAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized. Please log in.");
  }
  if (session.user.role !== "MASTER_ADMIN") {
    throw new Error("Forbidden. Master Admin access required.");
  }
  return { userId: session.user.userId, name: session.user.name || "Master Admin" };
}

// Create internal oversight report against another Admin/Authority
export async function createOversightReport(targetUserId: string, reason: string) {
  try {
    const auth = await verifyAdminOrMasterAuth();

    if (!reason || !reason.trim()) {
      return { success: false, error: "Reason/Explanation is required." };
    }

    const targetUser = await dbConnect(collections.USERS).findOne({ userId: targetUserId });
    if (!targetUser) {
      return { success: false, error: "Target user account not found." };
    }

    const targetRole = targetUser.role;
    if (targetRole !== "ADMIN" && targetRole !== "AUTHORITY") {
      return { success: false, error: "Oversight reports can only be filed against Admins or Authorities." };
    }

    const reportId = `oversight-${crypto.randomBytes(4).toString("hex")}`;

    const newReport = {
      reportId,
      timestamp: new Date(),
      reporterUserId: auth.userId,
      reporterName: auth.name,
      targetUserId,
      targetName: targetUser.name || "Unknown Target",
      targetRole,
      reason: reason.trim(),
      status: "PENDING"
    };

    await dbConnect(collections.OVERSIGHT_REPORTS).insertOne(newReport);

    return { success: true, message: "Oversight report successfully submitted to Master Admin queue." };
  } catch (error: any) {
    console.error("Error in createOversightReport:", error);
    return { success: false, error: error.message || "Failed to submit oversight report." };
  }
}

// Retrieve scrollable oversight reports queue (Master Admin only)
export async function getOversightReports() {
  try {
    await verifyMasterAdminAuth();

    const reports = await dbConnect(collections.OVERSIGHT_REPORTS)
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    return { success: true, data: reports };
  } catch (error: any) {
    console.error("Error in getOversightReports:", error);
    return { success: false, error: error.message || "Failed to retrieve oversight reports." };
  }
}

// Resolve oversight report (Master Admin only)
export async function resolveOversightReport(
  reportId: string,
  action: "RESOLVE" | "DISMISS",
  note: string
) {
  try {
    const auth = await verifyMasterAdminAuth();

    const status = action === "RESOLVE" ? "ACTION_TAKEN" : "DISMISSED";

    const result = await dbConnect(collections.OVERSIGHT_REPORTS).updateOne(
      { reportId },
      {
        $set: {
          status,
          resolutionNote: note,
          resolvedAt: new Date()
        }
      }
    );

    if (result.modifiedCount > 0) {
      // Log resolve action in audit log
      await dbConnect(collections.AUDIT_LOGS).insertOne({
        timestamp: new Date(),
        actorUserId: auth.userId,
        actorName: auth.name,
        actionType: "OVERRIDE_APPEAL", // Generic administration category
        details: `Resolved oversight report reference ${reportId} with stance: ${status}. Note: ${note}`
      });

      return { success: true, message: `Report successfully resolved with stance: ${status}.` };
    }

    return { success: false, error: "Report not found or already resolved." };
  } catch (error: any) {
    console.error("Error in resolveOversightReport:", error);
    return { success: false, error: error.message || "Failed to resolve report." };
  }
}

export interface GetAuditLogsOptions {
  limit?: number;
  skip?: number;
  actionTypeFilter?: string; // "All" or actionType
}

// Retrieve system audit logs (Master Admin only)
export async function getAuditLogs(options: GetAuditLogsOptions = {}) {
  try {
    await verifyMasterAdminAuth();

    const { limit = 15, skip = 0, actionTypeFilter = "All" } = options;

    const query: any = {};
    if (actionTypeFilter !== "All") {
      query.actionType = actionTypeFilter;
    }

    const data = await dbConnect(collections.AUDIT_LOGS)
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await dbConnect(collections.AUDIT_LOGS).countDocuments(query);

    return { success: true, data, total };
  } catch (error: any) {
    console.error("Error in getAuditLogs:", error);
    return { success: false, error: error.message || "Failed to retrieve audit logs." };
  }
}
