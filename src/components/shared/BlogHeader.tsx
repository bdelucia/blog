import { ArrowLeftIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { ModeToggle } from "./mode-toggle";
import { ScrollProgress } from "../magicui/scroll-progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Link } from "../ui/link";

interface BlogHeaderProps {
    className?: string;
    title?: string;
    scrollProgress?: boolean;
}

export function BlogHeader({
    className,
    title,
    scrollProgress,
}: BlogHeaderProps) {
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
                <div className="w-20">
                    <BackToPortfolioButton />
                </div>

                {/* Center section - Back to Blog button */}
                <Link
                    href="/blog"
                    className={cn(
                        buttonVariants({ variant: "outline", size: "default" }),
                        "text-lg font-medium"
                    )}
                >
                    {title ?? "← Back to Blog"}
                </Link>

                {/* Right section - ModeToggle */}
                <div className="w-20 flex justify-end">
                    <ModeToggle />
                </div>
            </div>

            {scrollProgress && (
                <div className="absolute bottom-0 left-0 right-0">
                    <ScrollProgress className="top-[63px]" />
                </div>
            )}
        </header>
    );
}

function BackToPortfolioButton() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link href="/">
                    <Button className="bg-background group w-12 h-full">
                        <ArrowLeftIcon className="h-4 w-4 text-foreground group-hover:text-background" />
                    </Button>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>Back to Portfolio</p>
            </TooltipContent>
        </Tooltip>
    );
}
