import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUser } from "@/db/users/functions";

export async function PUT(request: NextRequest) {
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
        const { fullName, avatarUrl } = body;

        // Validate required fields
        if (
            !fullName ||
            typeof fullName !== "string" ||
            fullName.trim().length === 0
        ) {
            return NextResponse.json(
                { error: "Full name is required and cannot be empty" },
                { status: 400 }
            );
        }

        // Validate avatar URL if provided
        if (
            avatarUrl &&
            typeof avatarUrl === "string" &&
            avatarUrl.trim().length > 0
        ) {
            try {
                new URL(avatarUrl.trim());
            } catch {
                return NextResponse.json(
                    { error: "Avatar URL must be a valid URL" },
                    { status: 400 }
                );
            }
        }

        // Update the user profile
        const updateData: any = {
            fullName: fullName.trim(),
        };

        // Only update avatarUrl if provided
        if (avatarUrl !== undefined) {
            updateData.avatarUrl =
                avatarUrl === null ? null : avatarUrl?.trim() || null;
        }

        const updatedUser = await updateUser(user.id, updateData);

        if (!updatedUser) {
            return NextResponse.json(
                { error: "Failed to update profile" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
