import { NextRequest, NextResponse } from "next/server";
import {
    getCommentById,
    updateComment,
    deleteComment,
} from "@/db/comments/functions";
import { getCurrentUser } from "@/lib/auth";

// GET /api/comments/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const comment = await getCommentById(parseInt(resolvedParams.id));

        if (!comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ comment });
    } catch (error) {
        console.error("Error fetching comment:", error);
        return NextResponse.json(
            { error: "Failed to fetch comment" },
            { status: 500 }
        );
    }
}

// PUT /api/comments/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        const resolvedParams = await params;
        const comment = await updateComment(
            parseInt(resolvedParams.id),
            { content },
            user.id
        );

        if (!comment) {
            return NextResponse.json(
                { error: "Failed to update comment" },
                { status: 500 }
            );
        }

        return NextResponse.json({ comment });
    } catch (error) {
        console.error("Error updating comment:", error);
        return NextResponse.json(
            { error: "Failed to update comment" },
            { status: 500 }
        );
    }
}

// DELETE /api/comments/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const success = await deleteComment(
            parseInt(resolvedParams.id),
            user.id
        );

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete comment" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json(
            { error: "Failed to delete comment" },
            { status: 500 }
        );
    }
}
