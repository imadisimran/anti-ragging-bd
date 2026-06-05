"use server";

import { dbConnect, collections } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { encryptData, decryptData, generateBlindIndex } from "@/lib/encryption";
import bcrypt from "bcryptjs";
import { unstable_cache } from "next/cache";

import { StudentProfileData, ProfileActionResponse, UpdateProfileData, GetUniversity, GetStudyAreas } from "@/types/profile.type";


/**
 * Fetch the profile of the currently logged-in student
 */
export async function getStudentProfile(): Promise<ProfileActionResponse<StudentProfileData>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    const emailSearchHash = generateBlindIndex(session.user.email);
    const user = await dbConnect(collections.USERS).findOne({ emailSearchHash });

    if (!user) {
      return { success: false, message: "User profile not found." };
    }

    // Decrypt name and email, handle exceptions in case they are stored in plaintext
    let decryptedName = "";
    try {
      decryptedName = decryptData(user.name);
    } catch (e) {
      decryptedName = user.name || "";
    }

    let decryptedEmail = "";
    try {
      decryptedEmail = decryptData(user.email);
    } catch (e) {
      decryptedEmail = user.email || session.user.email;
    }

    return {
      success: true,
      message: "Profile loaded successfully",
      data: {
        name: decryptedName,
        email: decryptedEmail,
        provider: user?.provider || "credentials",
        department: user?.department || "",
        academicSession: user?.academicSession || "",
        residentialHall: user?.residentialHall || "",
        university: user?.university || "",
        isVerified: user?.isVerified || false,
        updatedAt: user?.updatedAt || new Date(),
      }
    };
  } catch (error) {
    console.error("Error in getStudentProfile server action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load student profile."
    };
  }
}

/**
 * Update the profile information (excluding email/provider/password)
 */
export async function updateStudentProfile(data: UpdateProfileData): Promise<ProfileActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    const { name, department, academicSession, residentialHall, university } = data;
    if (!name || !name.trim()) {
      return { success: false, message: "Name is required." };
    }

    const emailSearchHash = generateBlindIndex(session.user.email);
    const encryptedName = encryptData(name);

    const result = await dbConnect(collections.USERS).updateOne(
      { emailSearchHash },
      {
        $set: {
          name: encryptedName,
          department: department || "",
          academicSession: academicSession || "",
          residentialHall: residentialHall || "",
          university: university || ""
        }
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "Profile update failed. User not found." };
    }

    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Error in updateStudentProfile server action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update student profile."
    };
  }
}

/**
 * Update credentials-based password after verifying current password
 */
export async function updateStudentPassword(data: {
  currentPassword?: string;
  newPassword?: string;
}): Promise<ProfileActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) {
      return { success: false, message: "Current password and new password are required." };
    }

    if (newPassword.length < 8) {
      return { success: false, message: "New password must be at least 8 characters long." };
    }

    const emailSearchHash = generateBlindIndex(session.user.email);
    const user = await dbConnect(collections.USERS).findOne({ emailSearchHash });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.provider !== "credentials") {
      return { success: false, message: "Password update is only available for email/password credentials login." };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password || "");
    if (!isPasswordValid) {
      return { success: false, message: "Invalid current password." };
    }

    // Hash and update the password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const result = await dbConnect(collections.USERS).updateOne(
      { emailSearchHash },
      { $set: { password: hashedNewPassword } }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "Failed to update password." };
    }

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Error in updateStudentPassword server action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update password."
    };
  }
}


const fetchUniversities = unstable_cache(
  async (): Promise<GetUniversity[]> => {
    const rawUniversities = await dbConnect(collections.UNIVERSITIES).find({}).project({ university: 1, _id: 0 }).toArray()
    return rawUniversities.map((university) => {
      return {
        university: university?.university
      }
    })
  },
  ["universities-list"],
  {
    tags: ["universities"],
    revalidate: 86400 // Cache for 1 day
  }
)

export const getUniversitites = async (): Promise<ProfileActionResponse<GetUniversity[]>> => {
  try {
    const universities = await fetchUniversities()
    const data = {
      success: true,
      message: "Universities loaded successfully",
      data: universities
    }
    return data
  } catch (error) {
    console.error("Error in getUniversitites server action:", error);
    const errorResponse = {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load universities."
    }
    return errorResponse;
  }
}


const fetchStudyAreas = unstable_cache(
  async ({ university, locationType }: { university: string, locationType: string }): Promise<GetStudyAreas | null> => {
    if (!university || !locationType) {
      return null
    }
    const rawData = await dbConnect(collections.UNIVERSITIES).findOne({ university: university }, { projection: { [locationType]: 1, _id: 0 } }) as GetStudyAreas
    return rawData
  },
  ["location-lists"],
  {
    tags: ["location-lists"],
    revalidate: 3600 // 1 hour
  }
)

export const getStudyAreas = async ({ university, locationType }: { university: string, locationType: string }): Promise<ProfileActionResponse<GetStudyAreas | null>> => {
  try {
    const rawData = await fetchStudyAreas({ university, locationType })
    const data = {
      success: true,
      message: "Study areas loaded successfully",
      data: rawData
    }
    return data
  } catch (error) {
    const errorResponse = {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load study areas."
    }
    return errorResponse;
  }
}
