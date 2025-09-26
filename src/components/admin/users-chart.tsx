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
import { useUsersChartData } from "@/hooks/useUsersChartData";
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

interface UsersDataPoint {
    date: string;
    users: number;
}

interface UsersChartProps {
    className?: string;
}

const chartConfig = {
    users: {
        label: "Users",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

export function UsersChart({ className }: UsersChartProps) {
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
    } = useUsersChartData(days, viewType);

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
                            ? "Cumulative Users"
                            : "Daily New Users"}
                    </CardTitle>
                    <CardDescription>Loading users data...</CardDescription>
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
                            ? "Cumulative Users"
                            : "Daily New Users"}
                    </CardTitle>
                    <CardDescription className="text-destructive">
                        {error instanceof Error
                            ? error.message
                            : "Failed to load users data"}
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
                            ? "Cumulative Users"
                            : "Daily New Users"}
                    </CardTitle>
                    <CardDescription>
                        No user data available for the selected time period.
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
                        ? "Cumulative Users"
                        : "Daily New Users"}
                </CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        {viewType === "cumulative" ? "Cumulative" : "Daily"}{" "}
                        users for the last{" "}
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
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
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
                                            `${value?.toLocaleString()} total users`,
                                            "Cumulative Users",
                                        ]}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Line
                                dataKey="users"
                                type="monotone"
                                stroke="var(--color-users)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 4,
                                    stroke: "var(--color-users)",
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
                                            `${value?.toLocaleString()} new users`,
                                            "Daily New Users",
                                        ]}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Bar
                                dataKey="users"
                                fill="var(--color-users)"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
