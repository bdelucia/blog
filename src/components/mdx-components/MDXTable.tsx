"use client";

interface MDXTableProps {
    children: React.ReactNode;
}

export default function MDXTable({ children }: MDXTableProps) {
    return (
        <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
            </table>
        </div>
    );
}

interface MDXTableHeadProps {
    children: React.ReactNode;
}

export function MDXTableHead({ children }: MDXTableHeadProps) {
    return <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>;
}

interface MDXTableBodyProps {
    children: React.ReactNode;
}

export function MDXTableBody({ children }: MDXTableBodyProps) {
    return (
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {children}
        </tbody>
    );
}

interface MDXTableRowProps {
    children: React.ReactNode;
}

export function MDXTableRow({ children }: MDXTableRowProps) {
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">{children}</tr>
    );
}

interface MDXTableCellProps {
    children: React.ReactNode;
    isHeader?: boolean;
}

export function MDXTableCell({
    children,
    isHeader = false,
}: MDXTableCellProps) {
    const Component = isHeader ? "th" : "td";
    return (
        <Component
            className={`px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 ${
                isHeader
                    ? "bg-gray-100 dark:bg-gray-700 font-medium text-gray-900 dark:text-gray-100"
                    : "text-gray-900 dark:text-gray-100"
            }`}
        >
            {children}
        </Component>
    );
}
