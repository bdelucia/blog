import { cn } from "../../lib/utils";
import { buttonVariants } from "../ui/button";
import { ModeToggle } from "./mode-toggle";
import { ScrollProgress } from "../magicui/scroll-progress";
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
                <div className="w-20"></div>

                {/* Center section - Back to Blog button */}
                <Link
                    href="/blog"
                    className={cn(
                        buttonVariants({ variant: "outline", size: "default" }),
                        "text-lg font-medium dark:bg-background"
                    )}
                >
                    {title}
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
