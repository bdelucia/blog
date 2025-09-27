"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    const pathname = usePathname();

    // Generate breadcrumb items from pathname if not provided
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        if (items) return items;

        const segments = pathname.split("/").filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

        let currentPath = "";
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            // Capitalize and format segment labels
            const label = segment
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

            // Don't make the last segment a link (current page)
            const href =
                index === segments.length - 1 ? undefined : currentPath;

            breadcrumbs.push({ label, href });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}
        >
            <ol
                className="flex items-center space-x-2"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                {breadcrumbs.map((item, index) => (
                    <li
                        key={index}
                        className="flex items-center"
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        {index === 0 ? (
                            <Home className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4 mx-1" />
                        )}

                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                itemProp="item"
                            >
                                <span itemProp="name">{item.label}</span>
                            </Link>
                        ) : (
                            <span
                                className="text-gray-900 dark:text-gray-100 font-medium"
                                itemProp="name"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        )}

                        <meta
                            itemProp="position"
                            content={(index + 1).toString()}
                        />
                    </li>
                ))}
            </ol>
        </nav>
    );
}

