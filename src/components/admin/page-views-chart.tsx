"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PageViewsDataPoint {
    date: string;
    pageViews: number;
}

interface PageViewsChartProps {
    className?: string;
}

const chartConfig = {
    pageViews: {
        label: "Page Views",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

export function PageViewsChart({ className }: PageViewsChartProps) {
    const isMobile = useIsMobile();
    const [timeRange, setTimeRange] = React.useState("30d");
    const [chartData, setChartData] = React.useState<PageViewsDataPoint[]>([]);
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
    const fetchChartData = React.useCallback(async (days: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/page-views?days=${days}`);
            const result = await response.json();

            if (result.success) {
                setChartData(result.data);
            } else {
                throw new Error("Failed to fetch page views data");
            }
        } catch (err) {
            console.error("Error fetching page views data:", err);
            setError("Failed to load page views data");
            // Set empty data on error
            setChartData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data when time range changes
    React.useEffect(() => {
        const days = getDaysFromRange(timeRange);
        fetchChartData(days);
    }, [timeRange, fetchChartData]);

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
                    <CardTitle>Page Views</CardTitle>
                    <CardDescription>
                        Loading page views data...
                    </CardDescription>
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
                    <CardTitle>Page Views</CardTitle>
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
                    <CardTitle>Page Views</CardTitle>
                    <CardDescription>
                        No analytics data available. Configure Google Analytics
                        to view page views data.
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
                <CardTitle>Page Views</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        Total page views for the last{" "}
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
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">
                            Last 3 months
                        </ToggleGroupItem>
                        <ToggleGroupItem value="30d">
                            Last 30 days
                        </ToggleGroupItem>
                        <ToggleGroupItem value="7d">
                            Last 7 days
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Last 30 days" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <LineChart data={filteredData}>
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
                            tickFormatter={(value) => {
                                if (value >= 1000) {
                                    return `${(value / 1000).toFixed(1)}k`;
                                }
                                return value.toString();
                            }}
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
                                    formatter={(value) => [
                                        `${value?.toLocaleString()} views`,
                                        "Page Views",
                                    ]}
                                    indicator="dot"
                                />
                            }
                        />
                        <Line
                            dataKey="pageViews"
                            type="monotone"
                            stroke="var(--color-pageViews)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4,
                                stroke: "var(--color-pageViews)",
                                strokeWidth: 2,
                                fill: "hsl(var(--background))",
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
