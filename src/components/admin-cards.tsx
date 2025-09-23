"use client";

import {
    IconTrendingUp,
    IconUsers,
    IconFileText,
    IconEye,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";

interface AdminCardsProps {
    stats: {
        totalUsers: number;
        adminUsers: number;
        publishedPosts: number;
        draftPosts: number;
    };
    analytics?: {
        uniqueVisitors: number;
        pageViews: number;
        sessions: number;
        bounceRate: number;
        uniqueVisitorsGrowth?: number;
    };
}

export function AdminCards({ stats, analytics }: AdminCardsProps) {
    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {/* Unique Visitors Card */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Unique Visitors</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        <NumberTicker
                            value={analytics?.uniqueVisitors || 1247}
                            className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
                        />
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconTrendingUp />
                            {analytics?.uniqueVisitorsGrowth !== undefined
                                ? `${
                                      analytics.uniqueVisitorsGrowth >= 0
                                          ? "+"
                                          : ""
                                  }${analytics.uniqueVisitorsGrowth.toFixed(
                                      1
                                  )}%`
                                : "+12.5%"}
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Growing audience <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Last 30 days from Google Analytics
                    </div>
                </CardFooter>
            </Card>

            {/* Total Users Card */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Total Users</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        <NumberTicker
                            value={stats.totalUsers}
                            className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
                        />
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconUsers />
                            {stats.adminUsers} admins
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Registered users <IconUsers className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Platform user base
                    </div>
                </CardFooter>
            </Card>

            {/* Published Posts Card */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Published Posts</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        <NumberTicker
                            value={stats.publishedPosts}
                            className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
                        />
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconFileText />
                            {stats.draftPosts} drafts
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Live content <IconFileText className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Publicly available posts
                    </div>
                </CardFooter>
            </Card>

            {/* Page Views Card */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Page Views</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        <NumberTicker
                            value={analytics?.pageViews || 3842}
                            className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
                        />
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconEye />
                            {analytics?.bounceRate?.toFixed(1) || "42.3"}%
                            bounce
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Content engagement <IconEye className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Total page views last 30 days
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
