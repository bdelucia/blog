import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPost } from "@/db/articles/functions";

export async function POST(request: NextRequest) {
    try {
        // Get the current user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse the request body
        const body = await request.json();
        const { title, slug, summary, content, tags, image } = body;

        // Validate required fields
        if (!title || !slug) {
            return NextResponse.json(
                { error: "Title and slug are required" },
                { status: 400 }
            );
        }

        // Create the post
        const postData = {
            title,
            slug,
            summary: summary || null,
            content: content || null,
            image: image || null,
            tags: tags && tags.length > 0 ? tags : null,
            status: "draft" as const,
        };

        const newPost = await createPost(postData);

        if (!newPost) {
            return NextResponse.json(
                { error: "Failed to create post" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            post: newPost,
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
