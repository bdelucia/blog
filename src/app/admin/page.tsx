import { requireAdmin } from "@/lib/auth";
import { getAllUsers, getUsersByRole } from "@/db/users/functions";
import { getBlogPosts, getAllPosts } from "@/db/articles/functions";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminCards } from "@/components/admin-cards";
import { AnalyticsChart } from "@/components/admin/analytics-chart";
import { PageViewsChart } from "@/components/admin/page-views-chart";
import { UsersDataTable } from "@/components/admin/UsersDataTable";
import { PostsDataTable } from "@/components/admin/PostsDataTable";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Starfield } from "@/components/magicui/starfield";
import { ShineBorder } from "@/components/magicui/shine-border";
import data from "./data.json";

// Force dynamic rendering for admin page
export const dynamic = "force-dynamic";

async function fetchAnalyticsSummary() {
    try {
        // Google Analytics 4 Data API configuration
        const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
        const GA_SERVICE_ACCOUNT_EMAIL = process.env.GA_SERVICE_ACCOUNT_EMAIL;
        const GA_PRIVATE_KEY = process.env.GA_PRIVATE_KEY;

        if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_EMAIL || !GA_PRIVATE_KEY) {
            return {
                uniqueVisitors: 0,
                pageViews: 0,
                sessions: 0,
                bounceRate: 0,
                uniqueVisitorsGrowth: 0,
            };
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

        return {
            uniqueVisitors,
            pageViews,
            sessions,
            bounceRate,
            uniqueVisitorsGrowth,
        };
    } catch (error) {
        console.error("Error fetching analytics summary:", error);
        return {
            uniqueVisitors: 0,
            pageViews: 0,
            sessions: 0,
            bounceRate: 0,
            uniqueVisitorsGrowth: 0,
        };
    }
}

export default async function AdminDashboard() {
    const admin = await requireAdmin();

    // Get statistics
    const [
        allUsers,
        adminUsers,
        regularUsers,
        publishedPosts,
        allPosts,
        analyticsSummary,
    ] = await Promise.all([
        getAllUsers(),
        getUsersByRole("admin"),
        getUsersByRole("user"),
        getBlogPosts(),
        getAllPosts(),
        fetchAnalyticsSummary(),
    ]);

    const stats = {
        totalUsers: allUsers.length,
        adminUsers: adminUsers.length,
        regularUsers: regularUsers.length,
        publishedPosts: publishedPosts.length,
        totalPosts: allPosts.length,
        draftPosts: allPosts.length - publishedPosts.length,
    };

    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <AppSidebar
                    user={{
                        name: admin.fullName || "Admin",
                        email: admin.email,
                        avatar: admin.avatarUrl || undefined,
                    }}
                />
                <SidebarInset>
                    <div className="relative mx-4 my-4">
                        <div className="relative min-h-[calc(100vh-2rem)] bg-gray-50 dark:bg-black flex flex-col rounded-lg">
                            <Starfield
                                starCount={150}
                                duration={25}
                                starColor="#ffffff"
                                starSize={[1, 4]}
                                className="dark:opacity-100 opacity-0"
                            />
                            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 relative z-10">
                                <div className="flex items-center gap-2 px-4">
                                    <SidebarTrigger className="-ml-1" />
                                    <Separator
                                        orientation="vertical"
                                        className="mr-2 data-[orientation=vertical]:h-4"
                                    />
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem className="hidden md:block">
                                                <BreadcrumbLink href="/admin">
                                                    Admin Dashboard
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator className="hidden md:block" />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>
                                                    Overview
                                                </BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>
                            </header>
                            <div className="flex flex-1 flex-col relative z-10">
                                <div className="@container/main flex flex-1 flex-col gap-2">
                                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                        <AdminCards
                                            stats={stats}
                                            analytics={analyticsSummary}
                                        />
                                        <div className="px-4 lg:px-6">
                                            <AnalyticsChart />
                                        </div>
                                        <div className="px-4 lg:px-6">
                                            <PageViewsChart />
                                        </div>
                                        <div className="px-4 lg:px-6">
                                            <UsersDataTable data={allUsers} />
                                        </div>
                                        <div className="px-4 lg:px-6">
                                            <PostsDataTable data={allPosts} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ShineBorder
                            shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                            duration={12}
                            borderWidth={2}
                            className="rounded-lg"
                        />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
