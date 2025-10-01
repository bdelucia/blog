"use client";

import * as React from "react";
import {
    Line,
    LineChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import { usePageViewsChartData } from "@/hooks/usePageViewsChartData";
import { TrendingUp, BarChart3 } from "lucide-react";
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
    const [viewType, setViewType] = React.useState<"cumulative" | "daily">(
        "cumulative"
    );

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

    const days = getDaysFromRange(timeRange);
    const {
        data: chartData = [],
        isLoading,
        error,
    } = usePageViewsChartData(days, viewType);

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

    if (isLoading) {
        return (
            <Card className={`@container/card ${className}`}>
                <CardHeader>
                    <CardTitle>
                        {viewType === "cumulative"
                            ? "Cumulative Page Views"
                            : "Daily Page Views"}
                    </CardTitle>
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
                    <CardTitle>
                        {viewType === "cumulative"
                            ? "Cumulative Page Views"
                            : "Daily Page Views"}
                    </CardTitle>
                    <CardDescription className="text-destructive">
                        {error instanceof Error
                            ? error.message
                            : "Failed to load page views data"}
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
                            ? "Cumulative Page Views"
                            : "Daily Page Views"}
                    </CardTitle>
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
                <CardTitle>
                    {viewType === "cumulative"
                        ? "Cumulative Page Views"
                        : "Daily Page Views"}
                </CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        {viewType === "cumulative" ? "Cumulative" : "Daily"}{" "}
                        page views for the last{" "}
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
                    {/* Mobile layout: toggle above, timeline below */}
                    <div className="flex flex-col gap-2 @[505px]/card:hidden">
                        <div className="flex justify-end">
                            <div className="flex items-center gap-2">
                                {viewType === "cumulative" ? (
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                )}
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
                        <div className="flex justify-start">
                            <Select
                                value={timeRange}
                                onValueChange={setTimeRange}
                            >
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
                    </div>

                    {/* Desktop layout: everything in one row */}
                    <div className="hidden @[505px]/card:flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            {viewType === "cumulative" ? (
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Switch
                                checked={viewType === "cumulative"}
                                onCheckedChange={(checked) =>
                                    setViewType(
                                        checked ? "cumulative" : "daily"
                                    )
                                }
                            />
                        </div>
                        <ToggleGroup
                            type="single"
                            value={timeRange}
                            onValueChange={setTimeRange}
                            variant="outline"
                            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[1123px]/card:flex"
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
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger
                                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[1123px]/card:hidden"
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
                    {viewType === "cumulative" ? (
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
                                            `${value?.toLocaleString()} total views`,
                                            "Cumulative Page Views",
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
                    ) : (
                        <BarChart data={filteredData}>
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
                                            "Daily Page Views",
                                        ]}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Bar
                                dataKey="pageViews"
                                fill="var(--color-pageViews)"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
