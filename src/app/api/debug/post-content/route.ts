import { NextRequest, NextResponse } from "next/server";
import { getPost } from "@/data/blog";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return NextResponse.json(
                { error: "Slug parameter is required" },
                { status: 400 }
            );
        }

        const post = await getPost(slug);

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            slug: post.slug,
            title: post.title,
            content: post.content,
            contentLength: post.content?.length || 0,
            contentPreview: post.content?.substring(0, 200) + "...",
            isMarkdown: /^#\s|^\*\*|^\*[^*]|^-\s|^\d+\.\s|^```|^>/.test(
                post.content?.trim() || ""
            ),
            hasHtmlTags: /<[^>]+>/.test(post.content || ""),
        });
    } catch (error) {
        console.error("Error fetching post content:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
