import { cn } from "@/lib/utils";

interface HeaderWithIdProps {
    id?: string;
    className?: string;
    children: React.ReactNode;
}

// Helper function to generate ID from text content
function generateId(children: React.ReactNode): string {
    const text =
        typeof children === "string"
            ? children
            : Array.isArray(children)
            ? children.join("")
            : String(children);

    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function H1({ id, className, children }: HeaderWithIdProps) {
    const headerId = id || generateId(children);

    return (
        <h1
            id={headerId}
            className={cn("text-3xl font-bold mb-4 mt-8 first:mt-0", className)}
        >
            {children}
        </h1>
    );
}

export function H2({ id, className, children }: HeaderWithIdProps) {
    const headerId = id || generateId(children);

    return (
        <h2
            id={headerId}
            className={cn("text-2xl font-semibold mb-3 mt-6", className)}
        >
            {children}
        </h2>
    );
}

export function H3({ id, className, children }: HeaderWithIdProps) {
    const headerId = id || generateId(children);

    return (
        <h3
            id={headerId}
            className={cn("text-xl font-semibold mb-2 mt-4", className)}
        >
            {children}
        </h3>
    );
}

export function H4({ id, className, children }: HeaderWithIdProps) {
    const headerId = id || generateId(children);

    return (
        <h4
            id={headerId}
            className={cn("text-lg font-semibold mb-2 mt-3", className)}
        >
            {children}
        </h4>
    );
}

export function H5({ id, className, children }: HeaderWithIdProps) {
    const headerId = id || generateId(children);

    return (
        <h5
            id={headerId}
            className={cn("text-base font-semibold mb-1 mt-2", className)}
        >
            {children}
        </h5>
    );
}

export function H6({ id, className, children }: HeaderWithIdProps) {
    const headerId = id || generateId(children);

    return (
        <h6
            id={headerId}
            className={cn("text-sm font-semibold mb-1 mt-2", className)}
        >
            {children}
        </h6>
    );
}
