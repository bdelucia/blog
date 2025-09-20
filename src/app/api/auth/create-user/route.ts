import { NextRequest, NextResponse } from "next/server";
import { createUserAfterSignup } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { userId, email, fullName, avatarUrl } = await request.json();

        if (!userId || !email) {
            return NextResponse.json(
                { error: "User ID and email are required" },
                { status: 400 }
            );
        }

        const userData = await createUserAfterSignup(
            userId,
            email,
            fullName,
            avatarUrl
        );

        return NextResponse.json({
            success: true,
            user: userData,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
