import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            // Check if we have a valid Supabase session but no user in database
            const supabase = await createClient();
            const {
                data: { user: supabaseUser },
            } = await supabase.auth.getUser();

            if (supabaseUser) {
                // User is authenticated but doesn't exist in our database yet
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 404 }
                );
            } else {
                // User is not authenticated
                return NextResponse.json(
                    { error: "Not authenticated" },
                    { status: 401 }
                );
            }
        }

        return NextResponse.json(user, {
            headers: {
                "Cache-Control":
                    "public, max-age=60, stale-while-revalidate=300",
            },
        });
    } catch (error) {
        console.error("Error getting user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
