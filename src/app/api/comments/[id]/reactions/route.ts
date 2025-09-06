import { NextRequest, NextResponse } from "next/server";
import {
    addCommentReaction,
    removeCommentReaction,
} from "@/db/comments/functions";
import { getCurrentUser } from "@/lib/auth";

// POST /api/comments/[id]/reactions
export async function POST(
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
        const { reactionType } = body;

        if (!reactionType) {
            return NextResponse.json(
                { error: "Reaction type is required" },
                { status: 400 }
            );
        }

        const reaction = await addCommentReaction({
            commentId: parseInt(params.id),
            userId: user.id,
            reactionType,
        });

        if (!reaction) {
            return NextResponse.json(
                { error: "Failed to add reaction" },
                { status: 500 }
            );
        }

        return NextResponse.json({ reaction }, { status: 201 });
    } catch (error) {
        console.error("Error adding reaction:", error);
        return NextResponse.json(
            { error: "Failed to add reaction" },
            { status: 500 }
        );
    }
}

// DELETE /api/comments/[id]/reactions
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

        const success = await removeCommentReaction(
            parseInt(params.id),
            user.id
        );

        if (!success) {
            return NextResponse.json(
                { error: "Failed to remove reaction" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing reaction:", error);
        return NextResponse.json(
            { error: "Failed to remove reaction" },
            { status: 500 }
        );
    }
}
