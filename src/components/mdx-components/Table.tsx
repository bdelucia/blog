import * as React from "react";

interface TableProps {
    headers: string[];
    rows: (string | React.ReactNode)[][];
    className?: string;
}

export default function Table({ headers, rows, className = "" }: TableProps) {
    return (
        <div className={`overflow-x-auto my-6 ${className}`}>
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-400">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className={`px-2 sm:px-6 py-3 text-xs font-medium text-foreground dark:text-background uppercase tracking-wider border border-gray-300 dark:border-gray-600 ${
                                    [
                                        "title",
                                        "prep time",
                                        "cook time",
                                        "total time",
                                        "difficulty",
                                        "servings",
                                    ].includes(header.toLowerCase())
                                        ? "text-center"
                                        : "text-left"
                                }`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className={`px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 ${
                                        [
                                            "title",
                                            "prep time",
                                            "cook time",
                                            "total time",
                                            "difficulty",
                                            "servings",
                                        ].includes(
                                            headers[cellIndex]?.toLowerCase()
                                        )
                                            ? "text-center"
                                            : "text-left"
                                    }`}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
