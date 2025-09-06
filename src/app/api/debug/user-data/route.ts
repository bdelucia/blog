import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "No authenticated user" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            message: "User data retrieved successfully",
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error getting user data:", error);
        return NextResponse.json(
            { error: "Failed to get user data" },
            { status: 500 }
        );
    }
}
