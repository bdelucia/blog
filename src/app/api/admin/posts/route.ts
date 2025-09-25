import { NextResponse } from "next/server";
import { getAllPosts } from "@/db/articles/functions";

export async function GET() {
    try {
        const allPosts = await getAllPosts();
        return NextResponse.json(allPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        );
    }
}
