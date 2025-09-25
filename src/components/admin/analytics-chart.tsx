"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ChartDataPoint {
    date: string;
    desktop: number;
    mobile: number;
}

interface AnalyticsChartProps {
    className?: string;
}

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export function AnalyticsChart({ className }: AnalyticsChartProps) {
    const isMobile = useIsMobile();
    const [timeRange, setTimeRange] = React.useState("30d");
    const [viewType, setViewType] = React.useState<"cumulative" | "daily">(
        "cumulative"
    );
    const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Convert time range to days
    const getDaysFromRange = (range: string) => {
        switch (range) {
            case "7d":
                return 7;
            case "30d":
                return 30;
            case "90d":
                return 90;
            default:
                return 30;
        }
    };

    // Fetch chart data
    const fetchChartData = React.useCallback(
        async (days: number, viewType: "cumulative" | "daily") => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/admin/analytics-chart?days=${days}&viewType=${viewType}`
                );
                const result = await response.json();

                if (result.success) {
                    setChartData(result.data);
                } else {
                    throw new Error("Failed to fetch analytics data");
                }
            } catch (err) {
                console.error("Error fetching chart data:", err);
                setError("Failed to load analytics data");
                // Set empty data on error
                setChartData([]);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Fetch data when time range or view type changes
    React.useEffect(() => {
        const days = getDaysFromRange(timeRange);
        fetchChartData(days, viewType);
    }, [timeRange, viewType, fetchChartData]);

    // Set default time range for mobile
    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d");
        }
    }, [isMobile]);

    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date);
        const referenceDate = new Date();
        let daysToSubtract = 90;
        if (timeRange === "30d") {
            daysToSubtract = 30;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return date >= startDate;
    });

    if (loading) {
        return (
            <Card className={`@container/card ${className}`}>
                <CardHeader>
                    <CardTitle>
                        {viewType === "cumulative"
                            ? "Cumulative Visitors"
                            : "Daily Visitors"}
                    </CardTitle>
                    <CardDescription>Loading analytics data...</CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
                        <div className="text-muted-foreground">
                            Loading chart...
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`@container/card ${className}`}>
                <CardHeader>
                    <CardTitle>
                        {viewType === "cumulative"
                            ? "Cumulative Visitors"
                            : "Daily Visitors"}
                    </CardTitle>
                    <CardDescription className="text-destructive">
                        {error}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
                        <div className="text-muted-foreground">
                            Unable to load chart data
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card className={`@container/card ${className}`}>
                <CardHeader>
                    <CardTitle>
                        {viewType === "cumulative"
                            ? "Cumulative Visitors"
                            : "Daily Visitors"}
                    </CardTitle>
                    <CardDescription>
                        No analytics data available. Configure Google Analytics
                        to view visitor data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
                        <div className="text-muted-foreground">
                            No data to display
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`@container/card ${className}`}>
            <CardHeader>
                <CardTitle>
                    {viewType === "cumulative"
                        ? "Cumulative Visitors"
                        : "Daily Visitors"}
                </CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        {viewType === "cumulative" ? "Cumulative" : "Daily"}{" "}
                        visitors for the last{" "}
                        {timeRange === "7d"
                            ? "7 days"
                            : timeRange === "30d"
                            ? "30 days"
                            : "3 months"}
                    </span>
                    <span className="@[540px]/card:hidden">
                        Last{" "}
                        {timeRange === "7d"
                            ? "7 days"
                            : timeRange === "30d"
                            ? "30 days"
                            : "3 months"}
                    </span>
                </CardDescription>
                <CardAction>
                    <div className="flex items-center gap-2">
                        <ToggleGroup
                            type="single"
                            value={timeRange}
                            onValueChange={setTimeRange}
                            variant="outline"
                            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                        >
                            <ToggleGroupItem
                                value="90d"
                                className="cursor-pointer"
                            >
                                Last 3 months
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="30d"
                                className="cursor-pointer"
                            >
                                Last 30 days
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="7d"
                                className="cursor-pointer"
                            >
                                Last 7 days
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <div className="hidden @[767px]/card:flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {viewType === "cumulative"
                                    ? "📈 Cumulative"
                                    : "📊 Daily"}
                            </span>
                            <Switch
                                checked={viewType === "cumulative"}
                                onCheckedChange={(checked) =>
                                    setViewType(
                                        checked ? "cumulative" : "daily"
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 @[767px]/card:hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {viewType === "cumulative" ? "📈" : "📊"}
                            </span>
                            <Switch
                                checked={viewType === "cumulative"}
                                onCheckedChange={(checked) =>
                                    setViewType(
                                        checked ? "cumulative" : "daily"
                                    )
                                }
                            />
                        </div>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger
                                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
                                size="sm"
                                aria-label="Select a value"
                            >
                                <SelectValue placeholder="Last 30 days" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem
                                    value="90d"
                                    className="rounded-lg cursor-pointer"
                                >
                                    Last 3 months
                                </SelectItem>
                                <SelectItem
                                    value="30d"
                                    className="rounded-lg cursor-pointer"
                                >
                                    Last 30 days
                                </SelectItem>
                                <SelectItem
                                    value="7d"
                                    className="rounded-lg cursor-pointer"
                                >
                                    Last 7 days
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient
                                id="fillDesktop"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={1.0}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillMobile"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(
                                            value
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="mobile"
                            type="natural"
                            fill="url(#fillMobile)"
                            stroke="var(--color-mobile)"
                            stackId="a"
                        />
                        <Area
                            dataKey="desktop"
                            type="natural"
                            fill="url(#fillDesktop)"
                            stroke="var(--color-desktop)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
