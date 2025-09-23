import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { GoogleAuth } from "google-auth-library";

export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "90"); // Default to 90 days to get more data

        // Google Analytics 4 Data API configuration
        const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
        const GA_SERVICE_ACCOUNT_EMAIL = process.env.GA_SERVICE_ACCOUNT_EMAIL;
        const GA_PRIVATE_KEY = process.env.GA_PRIVATE_KEY;

        if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_EMAIL || !GA_PRIVATE_KEY) {
            // Return empty data if GA is not configured
            return NextResponse.json({
                success: true,
                data: [],
                source: "no_config",
            });
        }

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        // Create Google Auth client
        const auth = new GoogleAuth({
            credentials: {
                client_email: GA_SERVICE_ACCOUNT_EMAIL,
                private_key: GA_PRIVATE_KEY.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
        });

        // Get access token
        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        // Fetch page views data from Google Analytics
        const gaResponse = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dateRanges: [
                        {
                            startDate: startDateStr,
                            endDate: endDateStr,
                        },
                    ],
                    dimensions: [{ name: "date" }],
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
        const chartData = transformGAPageViewsData(
            gaData,
            startDateStr,
            endDateStr
        );

        return NextResponse.json({
            success: true,
            data: chartData,
            source: "google_analytics",
        });
    } catch (error) {
        console.error("Error fetching page views data:", error);

        // Return empty data on error
        return NextResponse.json({
            success: true,
            data: [],
            source: "error",
        });
    }
}

function transformGAPageViewsData(
    gaData: any,
    startDate: string,
    endDate: string
) {
    const dataMap = new Map();

    // Initialize all dates with zero values
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        dataMap.set(dateStr, { date: dateStr, pageViews: 0 });
    }

    // Process GA data
    if (gaData.rows) {
        gaData.rows.forEach((row: any) => {
            const rawDate = row.dimensionValues[0]?.value;
            const views = parseInt(row.metricValues[0]?.value || "0");

            // Convert GA4 date format (YYYYMMDD) to our format (YYYY-MM-DD)
            const date = rawDate
                ? `${rawDate.slice(0, 4)}-${rawDate.slice(
                      4,
                      6
                  )}-${rawDate.slice(6, 8)}`
                : null;

            if (date && dataMap.has(date)) {
                dataMap.set(date, { date, pageViews: views });
            }
        });
    }

    return Array.from(dataMap.values());
}
