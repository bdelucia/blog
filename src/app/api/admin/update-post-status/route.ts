import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { publishPost, unpublishPost } from "@/db/articles/functions";

export async function PATCH(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdmin();

        const body = await request.json();
        const { postId, action } = body;

        // Validate input
        if (!postId || typeof postId !== "number") {
            return NextResponse.json(
                { error: "Invalid post ID" },
                { status: 400 }
            );
        }

        if (!action || !["publish", "delist"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action. Must be 'publish' or 'delist'" },
                { status: 400 }
            );
        }

        let updatedPost;

        if (action === "publish") {
            updatedPost = await publishPost(postId);
        } else if (action === "delist") {
            updatedPost = await unpublishPost(postId);
        }

        if (!updatedPost) {
            return NextResponse.json(
                { error: "Failed to update post status" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            post: updatedPost,
            message: `Post ${
                action === "publish" ? "published" : "delisted"
            } successfully`,
        });
    } catch (error) {
        console.error("Error updating post status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
