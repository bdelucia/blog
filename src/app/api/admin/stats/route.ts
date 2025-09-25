import { NextResponse } from "next/server";
import { getAllUsers, getUsersByRole } from "@/db/users/functions";
import { getBlogPosts, getAllPosts } from "@/db/articles/functions";

export async function GET() {
    try {
        console.log("Admin stats API: Starting data fetch...");

        const [allUsers, adminUsers, regularUsers, publishedPosts, allPosts] =
            await Promise.all([
                getAllUsers(),
                getUsersByRole("admin"),
                getUsersByRole("user"),
                getBlogPosts(),
                getAllPosts(),
            ]);

        console.log("Admin stats API: Data fetched successfully");
        console.log("Admin stats API: Users count:", allUsers.length);
        console.log("Admin stats API: Posts count:", allPosts.length);

        const stats = {
            totalUsers: allUsers.length,
            adminUsers: adminUsers.length,
            regularUsers: regularUsers.length,
            publishedPosts: publishedPosts.length,
            totalPosts: allPosts.length,
            draftPosts: allPosts.length - publishedPosts.length,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            {
                error: "Failed to fetch admin stats",
                details: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
