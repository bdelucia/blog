import { NextResponse } from "next/server";
import { getAllUsers } from "@/db/users/functions";

export async function GET() {
    try {
        const allUsers = await getAllUsers();
        console.log("API: Fetched users count:", allUsers.length);
        console.log("API: Users data:", allUsers);
        return NextResponse.json(allUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
