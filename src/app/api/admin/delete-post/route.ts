import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deletePostWithImage } from "@/db/articles/functions";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(request: NextRequest) {
    try {
        // Get the current user and verify admin access
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (user.role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        // Parse the request body
        const body = await request.json();
        const { postId, imagePath } = body;

        console.log(
            "Delete request - Post ID:",
            postId,
            "Image Path:",
            imagePath
        );

        // Validate required fields
        if (!postId || typeof postId !== "number") {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }

        // Delete the post and its associated image
        const success = await deletePostWithImage(postId, imagePath);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete post" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Post deleted successfully",
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
