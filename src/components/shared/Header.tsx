"use client";

import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { ScrollProgress } from "../magicui/scroll-progress";

interface HeaderProps {
    className?: string;
    title?: string;
    scrollProgress?: boolean;
}

export function Header({ className, title, scrollProgress }: HeaderProps) {
    return (
        <header
            className={cn(
                "fixed top-0 z-40 w-full h-16 bg-foreground/90 dark:bg-foreground/90 backdrop-blur-sm border-b border-border",
                className
            )}
            style={{ height: "64px" }}
        >
            <div className="flex items-center justify-between h-full px-6">
                {/* Left section - empty for balance */}
                <div className="w-20"></div>

                {/* Center section - Home button */}
                <Link href="/">
                    <RainbowButton className="text-lg font-semibold">
                        {title ?? "← Back to Home"}
                    </RainbowButton>
                </Link>

                {/* Right section */}
                <div className="w-20 flex justify-end">
                    <ModeToggle />
                </div>

                {scrollProgress && (
                    <div className="absolute bottom-0 left-0 right-0">
                        <ScrollProgress className="top-[63px]" />
                    </div>
                )}
            </div>
        </header>
    );
}
