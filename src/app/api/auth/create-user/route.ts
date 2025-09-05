import { NextRequest, NextResponse } from "next/server";
import { createUserAfterSignup } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { userId, email, fullName } = await request.json();

        if (!userId || !email) {
            return NextResponse.json(
                { error: "User ID and email are required" },
                { status: 400 }
            );
        }

        await createUserAfterSignup(userId, email, fullName);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
