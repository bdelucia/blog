import { NextResponse } from "next/server";
import { getAllUsers, getUsersByRole } from "@/db/users/functions";
import { getBlogPosts, getAllPosts } from "@/db/articles/functions";

export async function GET() {
    try {
        const [allUsers, adminUsers, regularUsers, publishedPosts, allPosts] =
            await Promise.all([
                getAllUsers(),
                getUsersByRole("admin"),
                getUsersByRole("user"),
                getBlogPosts(),
                getAllPosts(),
            ]);

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
        return NextResponse.json(
            { error: "Failed to fetch admin stats" },
            { status: 500 }
        );
    }
}
