import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const exclude = searchParams.get("exclude"); // For excluding current post when editing

        if (!slug) {
            return NextResponse.json(
                { error: "Slug parameter is required" },
                { status: 400 }
            );
        }

        // Check if slug exists in the articles table
        const supabase = await createClient();
        let query = supabase.from("articles").select("id").eq("slug", slug);

        // Exclude a specific slug if provided (useful for edit forms)
        if (exclude) {
            query = query.neq("slug", exclude);
        }

        const { data, error } = await query.single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 is "not found" error, which is expected if slug doesn't exist
            console.error("Error checking slug:", error);
            return NextResponse.json(
                { error: "Failed to check slug" },
                { status: 500 }
            );
        }

        // If data exists, slug is taken
        const exists = !!data;

        return NextResponse.json({ exists });
    } catch (error) {
        console.error("Error checking slug:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
