import { NextRequest, NextResponse } from "next/server";
import { getUsersChartData } from "@/db/users/functions";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");
        const viewType = searchParams.get("viewType") || "cumulative";

        // Validate parameters
        if (days < 1 || days > 365) {
            return NextResponse.json(
                { error: "Days must be between 1 and 365" },
                { status: 400 }
            );
        }

        if (viewType !== "cumulative" && viewType !== "daily") {
            return NextResponse.json(
                { error: "View type must be 'cumulative' or 'daily'" },
                { status: 400 }
            );
        }

        // Fetch users chart data using the function
        const chartData = await getUsersChartData(
            days,
            viewType as "cumulative" | "daily"
        );

        return NextResponse.json({
            success: true,
            data: chartData,
            source: "database",
        });
    } catch (error) {
        console.error("Error fetching users chart data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
