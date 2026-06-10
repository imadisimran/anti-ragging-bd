"use server";

import { dbConnect, collections } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export interface UpvoteResponse {
  success: boolean;
  action?: "added" | "removed";
  upVotesCount?: number;
  hasUpvoted?: boolean;
  error?: string;
}

export async function toggleUpvoteReport(postId: string): Promise<UpvoteResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.userId) {
      return { success: false, error: "Unauthorized. Please log in to upvote." };
    }

    const userId = session.user.userId;

    // Check if the report exists first
    const report = await dbConnect(collections.REPORTS).findOne({ postId });
    if (!report) {
      return { success: false, error: "Report not found." };
    }

    // Try to add the upvote atomically (if the user hasn't upvoted yet)
    let updateResult = await dbConnect(collections.REPORTS).updateOne(
      { postId, upVotesBy: { $ne: userId } },
      {
        $addToSet: { upVotesBy: userId },
        $inc: { upVotesCount: 1 }
      } as any
    );

    if (updateResult.modifiedCount > 0) {
      // Successfully added upvote
      const updated = await dbConnect(collections.REPORTS).findOne(
        { postId },
        { projection: { upVotesCount: 1 } }
      );
      return {
        success: true,
        action: "added",
        upVotesCount: updated?.upVotesCount ?? 0,
        hasUpvoted: true
      };
    }

    // If no document was modified, the user has already upvoted. Let's toggle it off (remove upvote)
    updateResult = await dbConnect(collections.REPORTS).updateOne(
      { postId, upVotesBy: userId },
      {
        $pull: { upVotesBy: userId },
        $inc: { upVotesCount: -1 }
      } as any
    );

    if (updateResult.modifiedCount > 0) {
      // Successfully removed upvote
      const updated = await dbConnect(collections.REPORTS).findOne(
        { postId },
        { projection: { upVotesCount: 1 } }
      );
      return {
        success: true,
        action: "removed",
        upVotesCount: updated?.upVotesCount ?? 0,
        hasUpvoted: false
      };
    }

    return { success: false, error: "Unable to update upvote. Please try again." };
  } catch (error) {
    console.error("Error in toggleUpvoteReport server action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred."
    };
  }
}
