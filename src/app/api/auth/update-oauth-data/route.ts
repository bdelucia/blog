import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { userId, email, fullName, avatarUrl } = await request.json();

        if (!userId || !email) {
            return NextResponse.json(
                { error: "User ID and email are required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Update user record with latest OAuth data
        const { data, error } = await supabase
            .from("users")
            .update({
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("Error updating user OAuth data:", error);
            return NextResponse.json(
                { error: "Failed to update user data" },
                { status: 500 }
            );
        }

        // Map database column names to interface field names
        const user = {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error updating OAuth data:", error);
        return NextResponse.json(
            { error: "Failed to update user data" },
            { status: 500 }
        );
    }
}
