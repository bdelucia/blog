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
        const currentStartDate = new Date();
        currentStartDate.setDate(currentStartDate.getDate() - 30);

        const previousEndDate = new Date(currentStartDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        const previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - 30);

        const currentStartDateStr = currentStartDate
            .toISOString()
            .split("T")[0];
        const currentEndDateStr = endDate.toISOString().split("T")[0];
        const previousStartDateStr = previousStartDate
            .toISOString()
            .split("T")[0];
        const previousEndDateStr = previousEndDate.toISOString().split("T")[0];

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

        // Fetch current period data
        const currentResponse = await fetch(
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
                            startDate: currentStartDateStr,
                            endDate: currentEndDateStr,
                        },
                    ],
                    metrics: [
                        { name: "totalUsers" }, // Unique visitors
                        { name: "screenPageViews" }, // Page views
                        { name: "sessions" }, // Sessions
                        { name: "bounceRate" }, // Bounce rate
                    ],
                }),
            }
        );

        // Fetch previous period data for growth calculation
        const previousResponse = await fetch(
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
                            startDate: previousStartDateStr,
                            endDate: previousEndDateStr,
                        },
                    ],
                    metrics: [
                        { name: "totalUsers" }, // Unique visitors
                    ],
                }),
            }
        );

        if (!currentResponse.ok || !previousResponse.ok) {
            throw new Error(`GA API error: ${currentResponse.statusText}`);
        }

        const currentData = await currentResponse.json();
        const previousData = await previousResponse.json();

        // Extract current period data
        let uniqueVisitors = 0;
        let pageViews = 0;
        let sessions = 0;
        let bounceRate = 0;
        let uniqueVisitorsGrowth = 0;

        if (currentData.rows && currentData.rows.length > 0) {
            const row = currentData.rows[0];
            uniqueVisitors = parseInt(row.metricValues[0]?.value || "0");
            pageViews = parseInt(row.metricValues[1]?.value || "0");
            sessions = parseInt(row.metricValues[2]?.value || "0");
            bounceRate = parseFloat(row.metricValues[3]?.value || "0") * 100;
        }

        // Calculate growth percentage
        if (previousData.rows && previousData.rows.length > 0) {
            const previousUniqueVisitors = parseInt(
                previousData.rows[0].metricValues[0]?.value || "0"
            );
            if (previousUniqueVisitors > 0) {
                uniqueVisitorsGrowth =
                    ((uniqueVisitors - previousUniqueVisitors) /
                        previousUniqueVisitors) *
                    100;
            }
        }

        return NextResponse.json({
            uniqueVisitors,
            pageViews,
            sessions,
            bounceRate,
            uniqueVisitorsGrowth,
        });
    } catch (error) {
        console.error("Error fetching analytics summary:", error);
        return NextResponse.json({
            uniqueVisitors: 0,
            pageViews: 0,
            sessions: 0,
            bounceRate: 0,
            uniqueVisitorsGrowth: 0,
        });
    }
}
