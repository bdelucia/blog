import { NextResponse } from "next/server";
import { getAllUsers } from "@/db/users/functions";

export async function GET() {
    try {
        const allUsers = await getAllUsers();
        return NextResponse.json(allUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            {
                error: "Failed to fetch users",
                details: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
