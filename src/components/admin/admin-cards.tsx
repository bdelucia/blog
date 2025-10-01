"use client";

import {
    IconTrendingUp,
    IconUsers,
    IconFileText,
    IconEye,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { User } from "@/db/users/functions";
import { BarChart3 } from "lucide-react";

interface AdminCardsProps {
    stats: {
        totalUsers: number;
        adminUsers: number;
        publishedPosts: number;
        draftPosts: number;
        weeklyUsersGained: number;
        weeklyUsers: User[];
    };
    analytics?: {
        uniqueVisitors: number;
        pageViews: number;
        sessions: number;
        bounceRate: number;
        uniqueVisitorsGrowth?: number;
        weeklyVisitorsGained?: number;
        weeklyPageViewsGained?: number;
    };
    onShowChart?: (chartType: "visitors" | "users" | "pageViews") => void;
    activeChart?: "visitors" | "users" | "pageViews" | null;
}

export function AdminCards({
    stats,
    analytics,
    onShowChart,
    activeChart,
}: AdminCardsProps) {
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
                        <sup className="text-sm font-medium text-green-600 dark:text-green-400 ml-1 -mt-2">
                            +{analytics?.weeklyVisitorsGained || 0}
                        </sup>
                    </CardTitle>
                    <CardAction className="flex gap-2">
                        <Badge variant="outline" className="gap-2">
                            <IconTrendingUp />
                            {analytics?.uniqueVisitorsGrowth !== undefined
                                ? `+${analytics.uniqueVisitorsGrowth.toFixed(
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
                        Visitors gained in the past week
                    </div>
                    <div className="text-green-600 dark:text-green-400 text-xs font-medium">
                        +{analytics?.weeklyVisitorsGained || 0} visitors gained
                        this week
                    </div>
                    {onShowChart && activeChart !== "visitors" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShowChart("visitors")}
                            className="mt-2 w-full cursor-pointer"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Show Graph
                        </Button>
                    )}
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
                        <sup className="text-sm font-medium text-green-600 dark:text-green-400 ml-1 -mt-2">
                            +{stats.weeklyUsersGained}
                        </sup>
                    </CardTitle>
                    <CardAction className="flex gap-2">
                        <div className="flex items-center gap-2">
                            <AvatarCircles
                                numPeople={Math.max(
                                    0,
                                    stats.weeklyUsersGained - 3
                                )}
                                avatarUrls={stats.weeklyUsers
                                    .slice(0, 3)
                                    .map((user) => ({
                                        imageUrl:
                                            user.avatarUrl ||
                                            "/images/avatars/default-avatar.png",
                                        profileUrl: "#",
                                    }))}
                            />
                        </div>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Registered users <IconUsers className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Platform user base
                    </div>
                    <div className="text-green-600 dark:text-green-400 text-xs font-medium">
                        +{stats.weeklyUsersGained} users gained this week
                    </div>
                    {onShowChart && activeChart !== "users" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShowChart("users")}
                            className="mt-2 w-full cursor-pointer"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Show Graph
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Page Views Card */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Page Views</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        <NumberTicker
                            value={analytics?.pageViews || 0}
                            className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
                        />
                        <sup className="text-sm font-medium text-green-600 dark:text-green-400 ml-1 -mt-2">
                            +{analytics?.weeklyPageViewsGained || 0}
                        </sup>
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="gap-2">
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
                        Total page views last day
                    </div>
                    <div className="text-green-600 dark:text-green-400 text-xs font-medium">
                        +{analytics?.weeklyPageViewsGained || 0} page views
                        gained this week
                    </div>
                    {onShowChart && activeChart !== "pageViews" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShowChart("pageViews")}
                            className="mt-2 w-full cursor-pointer"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Show Graph
                        </Button>
                    )}
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
                        <Badge variant="outline" className="gap-2">
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
        </div>
    );
}
