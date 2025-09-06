import { NextRequest, NextResponse } from "next/server";
import {
    getComment,
    updateComment,
    deleteComment,
} from "@/db/comments/functions";
import { getCurrentUser } from "@/lib/auth";

// GET /api/comments/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const comment = await getComment(parseInt(params.id));

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
    { params }: { params: { id: string } }
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
        const { content, editReason } = body;

        if (!content) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        // Check if user owns the comment
        const existingComment = await getComment(parseInt(params.id));
        if (!existingComment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        if (existingComment.userId !== user.id) {
            return NextResponse.json(
                { error: "You can only edit your own comments" },
                { status: 403 }
            );
        }

        const comment = await updateComment(parseInt(params.id), {
            content,
            editReason,
        });

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
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Check if user owns the comment or is admin
        const existingComment = await getComment(parseInt(params.id));
        if (!existingComment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        if (existingComment.userId !== user.id && user.role !== "admin") {
            return NextResponse.json(
                { error: "You can only delete your own comments" },
                { status: 403 }
            );
        }

        const success = await deleteComment(parseInt(params.id));

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
