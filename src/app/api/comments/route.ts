import { NextRequest, NextResponse } from "next/server";
import { getCommentsByArticle, createComment } from "@/db/comments/functions";
import { getCurrentUser } from "@/lib/auth";

// GET /api/comments?articleId=123
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const articleId = searchParams.get("articleId");
        const includeReactions =
            searchParams.get("includeReactions") === "true";
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!articleId) {
            return NextResponse.json(
                { error: "Article ID is required" },
                { status: 400 }
            );
        }

        const comments = await getCommentsByArticle(parseInt(articleId), {
            includeReactions,
            limit,
            offset,
        });

        return NextResponse.json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json(
            { error: "Failed to fetch comments" },
            { status: 500 }
        );
    }
}

// POST /api/comments
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { content, articleId, parentId } = body;

        if (!content || !articleId) {
            return NextResponse.json(
                { error: "Content and article ID are required" },
                { status: 400 }
            );
        }

        // Get client IP and user agent for moderation
        const ipAddress =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        const comment = await createComment({
            content,
            articleId: parseInt(articleId),
            userId: user.id,
            parentId: parentId ? parseInt(parentId) : undefined,
            ipAddress,
            userAgent,
        });

        if (!comment) {
            return NextResponse.json(
                { error: "Failed to create comment" },
                { status: 500 }
            );
        }

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 }
        );
    }
}
