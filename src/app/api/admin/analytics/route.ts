import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Google Analytics 4 Data API configuration
        const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
        const GA_SERVICE_ACCOUNT_EMAIL = process.env.GA_SERVICE_ACCOUNT_EMAIL;
        const GA_PRIVATE_KEY = process.env.GA_PRIVATE_KEY;

        if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_EMAIL || !GA_PRIVATE_KEY) {
            return NextResponse.json({
                uniqueVisitors: 0,
                pageViews: 0,
                sessions: 0,
                bounceRate: 0,
                uniqueVisitorsGrowth: 0,
            });
        }

        // Calculate date ranges for current and previous periods
        const endDate = new Date();
        const lastWeekStartDate = new Date();
        lastWeekStartDate.setDate(lastWeekStartDate.getDate() - 7); // Last 7 days

        // For total visitors, we'll use a longer period (last 30 days as a proxy for "recent total")
        const totalVisitorsStartDate = new Date();
        totalVisitorsStartDate.setDate(totalVisitorsStartDate.getDate() - 30);

        // For all-time comparison, we'll use a much longer period (last 365 days as proxy for all-time)
        const allTimeStartDate = new Date();
        allTimeStartDate.setDate(allTimeStartDate.getDate() - 365);

        const lastWeekStartDateStr = lastWeekStartDate
            .toISOString()
            .split("T")[0];
        const currentEndDateStr = endDate.toISOString().split("T")[0];
        const totalVisitorsStartDateStr = totalVisitorsStartDate
            .toISOString()
            .split("T")[0];
        const allTimeStartDateStr = allTimeStartDate
            .toISOString()
            .split("T")[0];

        // Create Google Auth client
        const { GoogleAuth } = await import("google-auth-library");
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

        // Fetch current period data (last 7 days)
        const lastWeekResponse = await fetch(
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
                            startDate: lastWeekStartDateStr,
                            endDate: currentEndDateStr,
                        },
                    ],
                    metrics: [
                        { name: "totalUsers" }, // Unique visitors from last week
                        { name: "screenPageViews" }, // Page views
                        { name: "sessions" }, // Sessions
                        { name: "bounceRate" }, // Bounce rate
                    ],
                }),
            }
        );

        // Fetch all-time data (last 365 days as proxy)
        const allTimeResponse = await fetch(
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
                            startDate: allTimeStartDateStr,
                            endDate: currentEndDateStr,
                        },
                    ],
                    metrics: [
                        { name: "totalUsers" }, // All-time unique visitors
                    ],
                }),
            }
        );

        // Fetch total visitors data (last 30 days as proxy for total)
        const totalVisitorsResponse = await fetch(
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
                            startDate: totalVisitorsStartDateStr,
                            endDate: currentEndDateStr,
                        },
                    ],
                    metrics: [
                        { name: "totalUsers" }, // Total unique visitors
                        { name: "screenPageViews" }, // Total page views
                    ],
                }),
            }
        );

        if (
            !lastWeekResponse.ok ||
            !allTimeResponse.ok ||
            !totalVisitorsResponse.ok
        ) {
            throw new Error(`GA API error: ${lastWeekResponse.statusText}`);
        }

        const lastWeekData = await lastWeekResponse.json();
        const allTimeData = await allTimeResponse.json();
        const totalVisitorsData = await totalVisitorsResponse.json();

        // Extract data
        let lastWeekVisitors = 0;
        let pageViews = 0;
        let sessions = 0;
        let bounceRate = 0;
        let totalVisitors = 0;
        let allTimeVisitors = 0;
        let allTimeGrowthPercentage = 0;
        let weeklyPageViews = 0;

        if (lastWeekData.rows && lastWeekData.rows.length > 0) {
            const row = lastWeekData.rows[0];
            lastWeekVisitors = parseInt(row.metricValues[0]?.value || "0");
            weeklyPageViews = parseInt(row.metricValues[1]?.value || "0");
            sessions = parseInt(row.metricValues[2]?.value || "0");
            bounceRate = parseFloat(row.metricValues[3]?.value || "0") * 100;
        }

        // Extract total visitors data
        if (totalVisitorsData.rows && totalVisitorsData.rows.length > 0) {
            totalVisitors = parseInt(
                totalVisitorsData.rows[0].metricValues[0]?.value || "0"
            );
            pageViews = parseInt(
                totalVisitorsData.rows[0].metricValues[1]?.value || "0"
            );
        }

        // Extract all-time visitors data
        if (allTimeData.rows && allTimeData.rows.length > 0) {
            allTimeVisitors = parseInt(
                allTimeData.rows[0].metricValues[0]?.value || "0"
            );
        }

        // Calculate growth percentage (last week vs all-time)
        if (allTimeVisitors > 0) {
            allTimeGrowthPercentage =
                (lastWeekVisitors / allTimeVisitors) * 100;
        }

        return NextResponse.json({
            uniqueVisitors: totalVisitors, // Return total visitors as the main number
            pageViews,
            sessions,
            bounceRate,
            uniqueVisitorsGrowth: allTimeGrowthPercentage, // Last week vs all-time percentage
            weeklyVisitorsGained: lastWeekVisitors, // Last week visitors count
            weeklyPageViewsGained: weeklyPageViews, // Last week page views count
        });
    } catch (error) {
        console.error("Error fetching analytics summary:", error);
        return NextResponse.json({
            uniqueVisitors: 0,
            pageViews: 0,
            sessions: 0,
            bounceRate: 0,
            uniqueVisitorsGrowth: 0,
            weeklyVisitorsGained: 0,
            weeklyPageViewsGained: 0,
        });
    }
}
