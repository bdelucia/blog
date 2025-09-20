import { NextResponse } from "next/server";

export async function GET() {
    // Simple health check for ALB - just return 200 OK
    return NextResponse.json(
        { status: "ok", timestamp: new Date().toISOString() },
        { status: 200 }
    );
}
