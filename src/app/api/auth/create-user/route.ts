import { NextRequest, NextResponse } from "next/server";
import { createUserAfterSignup } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { userId, email, fullName, avatarUrl } = await request.json();

        console.log("Create user API received:", {
            userId,
            email,
            fullName,
            avatarUrl,
        });

        if (!userId || !email) {
            return NextResponse.json(
                { error: "User ID and email are required" },
                { status: 400 }
            );
        }

        await createUserAfterSignup(userId, email, fullName, avatarUrl);
        console.log("User created successfully with avatar URL:", avatarUrl);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
