"use server";

import { dbConnect, collections } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { nanoid } from "nanoid";
import { AuthorityReview, ReportComment } from "@/types/DashboardTypes";

export interface GetAuthorityIncidentsOptions {
  limit?: number;
  skip?: number;
  searchQuery?: string;
  priorityFilter?: string; // "All", "High", "Medium", "Low"
  statusFilter?: string;   // "All", "Awaiting My Review", "INVESTIGATING", "FAKE", "RESOLVED"
}

export interface BriefAuthorityIncident {
  postId: string;
  createdAt: Date;
  harassmentType: string;
  detectedSeverity: string;
  specificLocation: string;
  university: string;
  authorityReviews: AuthorityReview[];
}

export interface DetailedAuthorityIncident {
  postId: string;
  createdAt: Date;
  dateTime: Date;
  harassmentType: string;
  locationCategory: string;
  specificLocation: string;
  university: string;
  narrative: string;
  proofUrls: any[];
  detectedSeverity: string;
  authorityReviews: AuthorityReview[];
  comments: ReportComment[];
}

// Check if user is authenticated as an authority
async function verifyAuthorityAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized. Please log in.");
  }
  const role = session.user.role;
  if (role !== "AUTHORITY") {
    throw new Error("Forbidden. Authority access required.");
  }
  
  // Fetch full plaintext user details from the database
  const user = await dbConnect(collections.USERS).findOne({ userId: session.user.userId });
  if (!user || user.role !== "AUTHORITY" || !user.authorityDetails) {
    throw new Error("Authority details not set up yet. Please contact the administrator.");
  }

  return {
    userId: user.userId as string,
    name: user.name as string,
    email: user.email as string,
    details: user.authorityDetails as {
      designation: string;
      university: string;
      hall: string;
    }
  };
}

/**
 * Fetch preview list of incidents within the authority's jurisdiction (infinite scroll)
 */
export async function getAuthorityIncidents(options: GetAuthorityIncidentsOptions = {}) {
  try {
    const auth = await verifyAuthorityAuth();
    const { limit = 5, skip = 0, searchQuery = "", priorityFilter = "All", statusFilter = "All" } = options;

    // Build scoped query: must match authority's university
    const query: any = {
      university: auth.details.university
    };

    // If authority is restricted to a specific hall/hostel
    if (auth.details.hall && auth.details.hall !== "All") {
      query.specificLocation = auth.details.hall;
    }

    // Apply priority filter
    if (priorityFilter !== "All") {
      query.detectedSeverity = priorityFilter.toUpperCase();
    }

    // Apply status filter based on Option C member reviews
    if (statusFilter !== "All") {
      if (statusFilter === "Awaiting My Review") {
        // Find reports where this authority has NOT submitted a review yet
        query["authorityReviews.userId"] = { $ne: auth.userId };
      } else if (statusFilter === "My Reviewed Cases") {
        // Find reports where this authority HAS submitted a review
        query["authorityReviews.userId"] = auth.userId;
      } else {
        // Find reports where at least one review has the specified status
        query["authorityReviews.status"] = statusFilter;
      }
    }

    // Apply search query
    if (searchQuery) {
      const searchRegex = { $regex: searchQuery, $options: "i" };
      query.$or = [
        { postId: searchRegex },
        { harassmentType: searchRegex },
        { specificLocation: searchRegex },
        { narrative: searchRegex }
      ];
    }

    // Perform database query with narrow projection for performance
    const rawReports = await dbConnect(collections.REPORTS)
      .find(query)
      .project({
        postId: 1,
        createdAt: 1,
        harassmentType: 1,
        detectedSeverity: 1,
        specificLocation: 1,
        university: 1,
        authorityReviews: 1
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await dbConnect(collections.REPORTS).countDocuments(query);

    const data: BriefAuthorityIncident[] = rawReports.map((item) => ({
      postId: item.postId || "",
      createdAt: item.createdAt || new Date(),
      harassmentType: item.harassmentType || "General Incident",
      detectedSeverity: item.detectedSeverity || "LOW",
      specificLocation: item.specificLocation || "",
      university: item.university || "",
      authorityReviews: item.authorityReviews || []
    }));

    return { success: true, data, total };
  } catch (error: any) {
    console.error("Error in getAuthorityIncidents:", error);
    return { success: false, error: error.message || "Failed to load incidents." };
  }
}

/**
 * Fetch full details of an incident including narrative, proofs, and comment threads
 */
export async function getAuthorityIncidentDetails(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized. Please log in.");
    }

    // Read full report
    const item = await dbConnect(collections.REPORTS).findOne({ postId });
    if (!item) {
      throw new Error("Incident report not found.");
    }

    // Enforce scoping check: If user is an authority, verify university & hall jurisdiction
    if (session.user.role === "AUTHORITY") {
      const auth = await verifyAuthorityAuth();
      if (item.university !== auth.details.university) {
        throw new Error("Unauthorized access. Different university jurisdiction.");
      }
      if (auth.details.hall && auth.details.hall !== "All" && item.specificLocation !== auth.details.hall) {
        throw new Error("Unauthorized access. Different residential hall jurisdiction.");
      }
    } else if (session.user.role === "student") {
      // If student, check if they are the original reporter
      const matchesReporter = item.studentDetails?.userId?.split(":")[0] === session.user.userId;
      // Also allow reading if it is marked as a verified ragging incident (publicly visible)
      const isPublic = item.isRaggingIncident === true;
      if (!matchesReporter && !isPublic) {
        throw new Error("Unauthorized access to private report.");
      }
    }

    const data: DetailedAuthorityIncident = {
      postId: item.postId || "",
      createdAt: item.createdAt || new Date(),
      dateTime: item.dateTime || new Date(),
      harassmentType: item.harassmentType || "General Incident",
      locationCategory: item.locationCategory || "",
      specificLocation: item.specificLocation || "",
      university: item.university || "",
      narrative: item.narrative || "",
      proofUrls: item.proofUrls || [],
      detectedSeverity: item.detectedSeverity || "LOW",
      authorityReviews: item.authorityReviews || [],
      comments: item.comments || []
    };

    return { success: true, data };
  } catch (error: any) {
    console.error("Error in getAuthorityIncidentDetails:", error);
    return { success: false, error: error.message || "Failed to load incident details." };
  }
}

/**
 * Submit or update a member's designation review (Option C collaborative consensus)
 */
export async function submitAuthorityReview(
  postId: string,
  status: "INVESTIGATING" | "FAKE" | "RESOLVED",
  comment: string
) {
  try {
    const auth = await verifyAuthorityAuth();

    // Verify mandatory description/comment for FAKE or RESOLVED
    if ((status === "FAKE" || status === "RESOLVED") && (!comment || !comment.trim())) {
      throw new Error(`A detailed explanation comment is mandatory when marking a report as ${status}.`);
    }

    const report = await dbConnect(collections.REPORTS).findOne({ postId });
    if (!report) {
      throw new Error("Report not found.");
    }

    // Verify report matches authority's university and hall jurisdiction
    if (report.university !== auth.details.university) {
      throw new Error("Unauthorized. Report is outside your university.");
    }
    if (auth.details.hall && auth.details.hall !== "All" && report.specificLocation !== auth.details.hall) {
      throw new Error("Unauthorized. Report is outside your residential hall jurisdiction.");
    }

    const newReview: AuthorityReview = {
      userId: auth.userId,
      name: auth.name,
      designation: auth.details.designation,
      status,
      comment: comment || `Marked status as ${status.toLowerCase()}`,
      timestamp: new Date()
    };

    // Filter out previous review from this same user if it exists, and append the new one
    const existingReviews: AuthorityReview[] = report.authorityReviews || [];
    const updatedReviews = existingReviews.filter((r) => r.userId !== auth.userId);
    updatedReviews.push(newReview);

    // Create system comment documenting this decision
    const systemCommentId = nanoid(12);
    const systemComment: ReportComment = {
      commentId: systemCommentId,
      authorId: auth.userId,
      authorName: auth.name,
      authorRole: auth.details.designation,
      isAuthority: true,
      content: `📢 Status update by ${auth.details.designation} (${auth.name}): Marked as ${status}.\n\nReason: "${comment || 'No explanation provided.'}"`,
      timestamp: new Date()
    };

    // Update overall status rule if the reviewer is a Provost or Warden:
    // If Provost/Warden reviews, we also set overall/isRaggingIncident status if necessary, or just keep individual statuses.
    const updates: any = {
      authorityReviews: updatedReviews
    };

    // If Provost or Warden resolves or marks fake, propagate that to primary flags for admin dashboard
    if (auth.details.designation === "Provost" || auth.details.designation === "Warden") {
      if (status === "RESOLVED") {
        updates.status = "RESOLVED";
        updates.isRaggingIncident = true; // Confirmed incident resolved
      } else if (status === "FAKE") {
        updates.status = "REJECTED";
        updates.isRaggingIncident = false;
        updates.rejectionReason = comment;
      } else if (status === "INVESTIGATING") {
        updates.status = "INVESTIGATING";
        updates.isRaggingIncident = true;
      }
    } else {
      // If lower ranking authority starts investigating, and report is QUEUED or PENDING, change report status to INVESTIGATING
      if (status === "INVESTIGATING" && (!report.status || report.status === "QUEUED" || report.status === "PENDING")) {
        updates.status = "INVESTIGATING";
        updates.isRaggingIncident = true;
      }
    }

    const result = await dbConnect(collections.REPORTS).updateOne(
      { postId },
      {
        $set: updates,
        $push: {
          comments: systemComment,
          updatedAt: {
            timestamp: new Date(),
            status: status as any,
            verifiedBy: auth.details.designation,
            adminId: auth.userId,
            note: comment
          }
        }
      } as any
    );

    if (result.modifiedCount > 0) {
      return { success: true, message: "Review assessment recorded successfully." };
    }
    throw new Error("Failed to record review assessment.");
  } catch (error: any) {
    console.error("Error in submitAuthorityReview:", error);
    return { success: false, error: error.message || "Failed to submit review." };
  }
}

/**
 * Post a public comment/reply to the report's discussion feed
 */
export async function postReportComment(postId: string, content: string, parentId?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized. Please log in.");
    }

    if (!content || !content.trim()) {
      throw new Error("Comment content cannot be empty.");
    }

    const report = await dbConnect(collections.REPORTS).findOne({ postId });
    if (!report) {
      throw new Error("Report not found.");
    }

    const role = session.user.role;
    let authorName = "Reporter";
    let authorRole = "student";
    let isAuthority = false;

    if (role === "AUTHORITY") {
      // Fetch plaintext authority details
      const authUser = await dbConnect(collections.USERS).findOne({ userId: session.user.userId });
      if (!authUser || !authUser.authorityDetails) {
        throw new Error("Authority profile not found.");
      }

      // Check hall scope
      if (report.university !== authUser.authorityDetails.university) {
        throw new Error("Unauthorized. Report is from a different university.");
      }
      if (authUser.authorityDetails.hall && authUser.authorityDetails.hall !== "All" && report.specificLocation !== authUser.authorityDetails.hall) {
        throw new Error("Unauthorized. Report is from a different residential hall.");
      }

      authorName = authUser.name;
      authorRole = authUser.authorityDetails.designation;
      isAuthority = true;
    } else if (role === "student") {
      // Check if student is the actual author of this report
      const matchesReporter = report.studentDetails?.userId?.split(":")[0] === session.user.userId;
      if (!matchesReporter) {
        throw new Error("Unauthorized. Only the original reporter is allowed to comment/reply.");
      }
      authorName = "Reporter";
      authorRole = "student";
      isAuthority = false;
    } else if (role === "ADMIN") {
      authorName = "System Administrator";
      authorRole = "Admin";
      isAuthority = true;
    } else {
      throw new Error("Unauthorized role.");
    }

    const newComment: ReportComment = {
      commentId: nanoid(12),
      authorId: session.user.userId || "",
      authorName,
      authorRole,
      isAuthority,
      content,
      timestamp: new Date(),
      parentId
    };

    const result = await dbConnect(collections.REPORTS).updateOne(
      { postId },
      {
        $push: {
          comments: newComment
        }
      } as any
    );

    if (result.modifiedCount > 0) {
      return { success: true, comment: newComment };
    }
    throw new Error("Failed to post comment.");
  } catch (error: any) {
    console.error("Error in postReportComment:", error);
    return { success: false, error: error.message || "Failed to submit comment." };
  }
}

export async function getAuthorityProfile() {
  try {
    const auth = await verifyAuthorityAuth();
    return { success: true, data: auth };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch profile." };
  }
}
