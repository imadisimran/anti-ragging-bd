"use server";

import { dbConnect, collections } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { decryptData, encryptData, generateBlindIndex } from "@/lib/encryption";
import { revalidateTag } from "next/cache";

// Helper to verify Master Admin authorization
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

// Decrypt student identity on-demand (audited)
export async function decryptStudentIdentity(userId: string) {
  try {
    const auth = await verifyMasterAdminAuth();

    const user = await dbConnect(collections.USERS).findOne({ userId });
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    let decryptedName = "";
    let decryptedEmail = "";

    try {
      decryptedName = decryptData(user.name);
    } catch {
      decryptedName = user.name || "ANONYMOUS";
    }

    try {
      decryptedEmail = decryptData(user.email);
    } catch {
      decryptedEmail = user.email || "REDACTED";
    }

    // Log the decryption access
    await dbConnect(collections.AUDIT_LOGS).insertOne({
      timestamp: new Date(),
      actorUserId: auth.userId,
      actorName: auth.name,
      actionType: "DECRYPT_IDENTITY",
      targetUserId: userId,
      details: `Decrypted identity of student user: ${userId} (${decryptedName})`
    });

    return { success: true, name: decryptedName, email: decryptedEmail };
  } catch (error: any) {
    console.error("Error in decryptStudentIdentity:", error);
    return { success: false, error: error.message || "Failed to decrypt user details." };
  }
}

// Revoke an Authority mandate (demotes back to student)
export async function revokeAuthorityMandate(userId: string) {
  try {
    const auth = await verifyMasterAdminAuth();

    const user = await dbConnect(collections.USERS).findOne({ userId });
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    // Encrypt name and email back to restore student anonymity
    const encryptedName = encryptData(user.name);
    const encryptedEmail = encryptData(user.email);
    const emailSearchHash = generateBlindIndex(user.email);

    const result = await dbConnect(collections.USERS).updateOne(
      { userId },
      {
        $set: {
          role: "student",
          name: encryptedName,
          email: encryptedEmail,
          emailSearchHash: emailSearchHash,
          authorityDetails: null
        }
      }
    );

    if (result.modifiedCount > 0) {
      // Log the revocation
      await dbConnect(collections.AUDIT_LOGS).insertOne({
        timestamp: new Date(),
        actorUserId: auth.userId,
        actorName: auth.name,
        actionType: "REVOKE_AUTHORITY",
        targetUserId: userId,
        details: `Revoked authority mandate for ${user.name}. Demoted to student role.`
      });

      return { success: true, message: "Authority mandate successfully revoked." };
    }

    return { success: false, error: "Failed to revoke authority mandate." };
  } catch (error: any) {
    console.error("Error in revokeAuthorityMandate:", error);
    return { success: false, error: error.message || "Failed to revoke authority mandate." };
  }
}

// Manage dynamic locations (Universities, Halls, Hostels, Departments)
export async function manageSystemLocations(
  action: "add" | "remove",
  type: "university" | "hall" | "hostel" | "department",
  payload: { university: string; name?: string }
) {
  try {
    const auth = await verifyMasterAdminAuth();

    if (!payload.university) {
      return { success: false, error: "University name is required." };
    }

    const univColl = dbConnect(collections.UNIVERSITIES);

    if (type === "university") {
      if (action === "add") {
        const exists = await univColl.findOne({ university: payload.university });
        if (exists) {
          return { success: false, error: "University already exists." };
        }
        await univColl.insertOne({
          university: payload.university,
          departments: [],
          hall: [],
          hostel: []
        });
      } else {
        await univColl.deleteOne({ university: payload.university });
      }
    } else {
      if (!payload.name) {
        return { success: false, error: "Location/Department name is required." };
      }

      const field = type === "department" ? "departments" : type; // Maps "hall", "hostel", "departments"

      if (action === "add") {
        await univColl.updateOne(
          { university: payload.university },
          { $addToSet: { [field]: payload.name } } as any
        );
      } else {
        await univColl.updateOne(
          { university: payload.university },
          { $pull: { [field]: payload.name } } as any
        );
      }
    }

    // Revalidate tags
    revalidateTag("universities", "max");
    revalidateTag("location-lists", "max");

    // Log the change
    await dbConnect(collections.AUDIT_LOGS).insertOne({
      timestamp: new Date(),
      actorUserId: auth.userId,
      actorName: auth.name,
      actionType: "MANAGE_LOCATIONS",
      details: `${action === "add" ? "Added" : "Removed"} ${type} "${payload.name || payload.university}" under university jurisdiction "${payload.university}"`
    });

    return { success: true, message: `Successfully ${action === "add" ? "added" : "removed"} ${type}.` };
  } catch (error: any) {
    console.error("Error in manageSystemLocations:", error);
    return { success: false, error: error.message || "Failed to update dynamic locations." };
  }
}

// Promote user to standard Admin
export async function promoteToAdmin(userId: string) {
  try {
    const auth = await verifyMasterAdminAuth();

    const user = await dbConnect(collections.USERS).findOne({ userId });
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    const result = await dbConnect(collections.USERS).updateOne(
      { userId },
      {
        $set: {
          role: "ADMIN",
          authorityDetails: null // Clear any authority profile if existed
        }
      }
    );

    if (result.modifiedCount > 0) {
      await dbConnect(collections.AUDIT_LOGS).insertOne({
        timestamp: new Date(),
        actorUserId: auth.userId,
        actorName: auth.name,
        actionType: "PROMOTE_ADMIN",
        targetUserId: userId,
        details: `Promoted user ${userId} to standard Admin role.`
      });

      return { success: true, message: "User successfully promoted to Admin role." };
    }

    return { success: false, error: "User is already an Admin or failed to update." };
  } catch (error: any) {
    console.error("Error in promoteToAdmin:", error);
    return { success: false, error: error.message || "Failed to promote user to Admin." };
  }
}

// Demote user from Admin (lockout protected)
export async function demoteFromAdmin(userId: string) {
  try {
    const auth = await verifyMasterAdminAuth();

    // Lockout Protection: check if demoting self
    if (userId === auth.userId) {
      const activeMasterAdminsCount = await dbConnect(collections.USERS).countDocuments({
        role: "MASTER_ADMIN"
      });
      if (activeMasterAdminsCount <= 1) {
        return {
          success: false,
          error: "Lockout Protection: You cannot demote yourself because you are the only Master Admin in the system."
        };
      }
    }

    const user = await dbConnect(collections.USERS).findOne({ userId });
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    const result = await dbConnect(collections.USERS).updateOne(
      { userId },
      {
        $set: {
          role: "student"
        }
      }
    );

    if (result.modifiedCount > 0) {
      await dbConnect(collections.AUDIT_LOGS).insertOne({
        timestamp: new Date(),
        actorUserId: auth.userId,
        actorName: auth.name,
        actionType: "DEMOTE_ADMIN",
        targetUserId: userId,
        details: `Demoted Admin ${userId} back to student role.`
      });

      return { success: true, message: "User successfully demoted from Admin role." };
    }

    return { success: false, error: "Failed to demote user." };
  } catch (error: any) {
    console.error("Error in demoteFromAdmin:", error);
    return { success: false, error: error.message || "Failed to demote user." };
  }
}

// Override Appeal Verdict
export async function overrideAppealVerdict(
  postId: string,
  action: "APPROVE" | "REJECT",
  note: string
) {
  try {
    const auth = await verifyMasterAdminAuth();

    const report = await dbConnect(collections.REPORTS).findOne({ postId });
    if (!report) {
      return { success: false, error: "Incident report not found." };
    }

    const isRagging = action === "APPROVE";
    const statusVal = action === "APPROVE" ? "SUBMITTED" : "REJECTED";
    const appealStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    const updatedVerification = {
      ...(report.adminVerification || {}),
      status: appealStatus,
      adminNote: note || `Verdict overridden by Master Admin. Stance updated to: ${action}.`,
      resolvedAt: new Date(),
      resolvedBy: auth.userId
    };

    const newUpdateLog = {
      timestamp: new Date(),
      status: statusVal,
      verifiedBy: "Master Admin Override",
      adminId: auth.userId,
      note: note
    };

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
    );

    if (result.modifiedCount > 0) {
      await dbConnect(collections.AUDIT_LOGS).insertOne({
        timestamp: new Date(),
        actorUserId: auth.userId,
        actorName: auth.name,
        actionType: "OVERRIDE_APPEAL",
        details: `Overrode decision on case reference ${postId} to ${action}. Note: ${note}`
      });

      return { success: true, message: "Appeal verdict successfully overridden." };
    }

    return { success: false, error: "Failed to override appeal verdict." };
  } catch (error: any) {
    console.error("Error in overrideAppealVerdict:", error);
    return { success: false, error: error.message || "Failed to override appeal verdict." };
  }
}
