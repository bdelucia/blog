import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");

        // Google Analytics 4 Data API configuration
        const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
        const GA_API_KEY = process.env.GA_API_KEY;

        if (!GA_PROPERTY_ID || !GA_API_KEY) {
            // Return mock data if GA is not configured
            return NextResponse.json({
                success: true,
                data: generateMockData(days),
                source: "mock",
            });
        }

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        // Fetch data from Google Analytics
        const gaResponse = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${GA_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dateRanges: [
                        {
                            startDate: startDateStr,
                            endDate: endDateStr,
                        },
                    ],
                    dimensions: [{ name: "date" }, { name: "deviceCategory" }],
                    metrics: [{ name: "screenPageViews" }],
                    orderBys: [{ dimension: { dimensionName: "date" } }],
                }),
            }
        );

        if (!gaResponse.ok) {
            throw new Error(`GA API error: ${gaResponse.statusText}`);
        }

        const gaData = await gaResponse.json();

        // Transform GA data to chart format
        const chartData = transformGAData(gaData, startDateStr, endDateStr);

        return NextResponse.json({
            success: true,
            data: chartData,
            source: "google_analytics",
        });
    } catch (error) {
        console.error("Error fetching analytics data:", error);

        // Return mock data on error
        const days = parseInt(
            new URL(request.url).searchParams.get("days") || "30"
        );
        return NextResponse.json({
            success: true,
            data: generateMockData(days),
            source: "mock_fallback",
        });
    }
}

function transformGAData(gaData: any, startDate: string, endDate: string) {
    const dataMap = new Map();

    // Initialize all dates with zero values
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        dataMap.set(dateStr, { date: dateStr, desktop: 0, mobile: 0 });
    }

    // Process GA data
    if (gaData.rows) {
        gaData.rows.forEach((row: any) => {
            const date = row.dimensionValues[0].value;
            const device = row.dimensionValues[1].value;
            const views = parseInt(row.metricValues[0].value);

            if (dataMap.has(date)) {
                const existing = dataMap.get(date);
                if (device === "desktop") {
                    existing.desktop += views;
                } else if (device === "mobile") {
                    existing.mobile += views;
                }
            }
        });
    }

    return Array.from(dataMap.values());
}

function generateMockData(days: number) {
    const data = [];
    const endDate = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // Generate realistic mock data with some randomness
        const baseDesktop = 200 + Math.random() * 300;
        const baseMobile = 150 + Math.random() * 250;

        data.push({
            date: dateStr,
            desktop: Math.round(baseDesktop),
            mobile: Math.round(baseMobile),
        });
    }

    return data;
}
