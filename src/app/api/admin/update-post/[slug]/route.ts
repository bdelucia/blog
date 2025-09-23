import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

interface UpdatePostParams {
    params: Promise<{
        slug: string;
    }>;
}

export async function PUT(request: NextRequest, { params }: UpdatePostParams) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const body = await request.json();
        const { title, slug: newSlug, summary, content, tags, image } = body;

        if (!title || !newSlug) {
            return NextResponse.json(
                { error: "Title and slug are required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Check if the new slug already exists (excluding the current post)
        if (newSlug !== resolvedParams.slug) {
            const { data: existingPost } = await supabase
                .from("articles")
                .select("id")
                .eq("slug", newSlug)
                .neq("slug", resolvedParams.slug)
                .single();

            if (existingPost) {
                return NextResponse.json(
                    { error: "A post with this slug already exists" },
                    { status: 400 }
                );
            }
        }

        // Update the post
        const { data: updatedPost, error } = await supabase
            .from("articles")
            .update({
                title,
                slug: newSlug,
                summary: summary || null,
                content: content || null,
                image: image || null,
                tags: tags && tags.length > 0 ? tags : null,
                updatedAt: new Date().toISOString(),
            })
            .eq("slug", resolvedParams.slug)
            .select()
            .single();

        if (error) {
            console.error("Error updating post:", error);
            return NextResponse.json(
                { error: "Failed to update post" },
                { status: 500 }
            );
        }

        if (!updatedPost) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            post: updatedPost,
        });
    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
