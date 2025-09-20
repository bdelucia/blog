import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        // Get the current user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get the authorization header from the request
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { error: "No authorization header" },
                { status: 401 }
            );
        }

        // Forward the request to Supabase Edge Function
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const functionUrl = `${supabaseUrl}/functions/v1/upload-profile-picture`;

        const formData = await request.formData();

        const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                // Don't set Content-Type - let the browser set it with boundary
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || "Upload failed" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
