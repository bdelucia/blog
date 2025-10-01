import { NextRequest, NextResponse } from "next/server";
import { likeComment, unlikeComment } from "@/db/comments/functions";
import { getCurrentUser } from "@/lib/auth";

// POST /api/comments/[id]/likes
export async function POST(
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
        const like = await likeComment({
            commentId: parseInt(resolvedParams.id),
            userId: user.id,
        });

        return NextResponse.json({ like }, { status: 201 });
    } catch (error) {
        console.error("Error liking comment:", error);
        return NextResponse.json(
            { error: "Failed to like comment" },
            { status: 500 }
        );
    }
}

// DELETE /api/comments/[id]/likes
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
        const success = await unlikeComment(
            parseInt(resolvedParams.id),
            user.id
        );

        return NextResponse.json({ success });
    } catch (error) {
        console.error("Error unliking comment:", error);
        return NextResponse.json(
            { error: "Failed to unlike comment" },
            { status: 500 }
        );
    }
}
