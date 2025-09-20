import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        const healthChecks = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: {
                database: "unknown",
                supabase: "unknown",
            },
        };

        // Check Supabase connectivity
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from("users")
                .select("count")
                .limit(1);

            if (error) {
                healthChecks.checks.supabase = "error";
                healthChecks.checks.database = "error";
                console.error("Supabase health check failed:", error);
            } else {
                healthChecks.checks.supabase = "healthy";
                healthChecks.checks.database = "healthy";
            }
        } catch (dbError) {
            healthChecks.checks.supabase = "error";
            healthChecks.checks.database = "error";
            console.error("Database health check failed:", dbError);
        }

        // If any critical check fails, return unhealthy
        if (healthChecks.checks.database === "error") {
            return NextResponse.json(
                {
                    ...healthChecks,
                    status: "unhealthy",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(healthChecks, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {
                status: "unhealthy",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
