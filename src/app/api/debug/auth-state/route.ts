import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current session
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        // Get user if session exists
        const user = session?.user || null;

        const debugInfo = {
            timestamp: new Date().toISOString(),
            hasSession: !!session,
            sessionExpiresAt: session?.expires_at
                ? new Date(session.expires_at * 1000).toISOString()
                : null,
            user: user
                ? {
                      id: user.id,
                      email: user.email,
                      emailVerified: user.email_confirmed_at ? true : false,
                      createdAt: user.created_at,
                      lastSignIn: user.last_sign_in_at,
                      metadata: user.user_metadata,
                  }
                : null,
            error: error?.message || null,
        };

        return NextResponse.json({
            success: true,
            debug: debugInfo,
        });
    } catch (error) {
        console.error("Error in auth debug endpoint:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch auth debug info",
            },
            { status: 500 }
        );
    }
}
