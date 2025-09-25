import { cn } from "@/lib/utils";

interface SpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    return (
        <div
            className={cn(
                "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
                sizeClasses[size],
                className
            )}
        />
    );
}

interface LoadingSpinnerProps {
    className?: string;
    text?: string;
    size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
    className,
    text = "Loading...",
    size = "md",
}: LoadingSpinnerProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3",
                className
            )}
        >
            <Spinner size={size} />
            {text && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {text}
                </p>
            )}
        </div>
    );
}
