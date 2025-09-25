import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { GoogleAuth } from "google-auth-library";

export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "90"); // Default to 90 days to get more data
        const viewType = searchParams.get("viewType") || "cumulative"; // Default to cumulative

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

        // Calculate date range - go back from today
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

        // Fetch data from Google Analytics
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
        const chartData = transformGAData(
            gaData,
            startDateStr,
            endDateStr,
            viewType
        );

        return NextResponse.json({
            success: true,
            data: chartData,
            source: "google_analytics",
        });
    } catch (error) {
        console.error("Error fetching analytics data:", error);

        // Return empty data on error
        return NextResponse.json({
            success: true,
            data: [],
            source: "error",
        });
    }
}

function transformGAData(
    gaData: any,
    startDate: string,
    endDate: string,
    viewType: string
) {
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
            const rawDate = row.dimensionValues[0]?.value;
            const device = row.dimensionValues[1]?.value;
            const views = parseInt(row.metricValues[0]?.value || "0");

            // Convert GA4 date format (YYYYMMDD) to our format (YYYY-MM-DD)
            const date = rawDate
                ? `${rawDate.slice(0, 4)}-${rawDate.slice(
                      4,
                      6
                  )}-${rawDate.slice(6, 8)}`
                : null;

            if (date && dataMap.has(date)) {
                const existing = dataMap.get(date);
                if (device === "desktop") {
                    existing.desktop += views;
                } else if (device === "mobile") {
                    existing.mobile += views;
                }
            }
        });
    }

    // Convert to cumulative data
    const sortedData = Array.from(dataMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Return daily data if viewType is "daily"
    if (viewType === "daily") {
        return sortedData;
    }

    // Convert to cumulative data for "cumulative" view
    let cumulativeDesktop = 0;
    let cumulativeMobile = 0;

    return sortedData.map((item) => {
        cumulativeDesktop += item.desktop;
        cumulativeMobile += item.mobile;
        return {
            date: item.date,
            desktop: cumulativeDesktop,
            mobile: cumulativeMobile,
        };
    });
}
