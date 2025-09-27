"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function AdminDashboardHeader() {
    const pathname = usePathname();

    const getBreadcrumbs = () => {
        const breadcrumbs = [
            {
                label: "Admin Dashboard",
                href: "/admin",
                isLink: true,
            },
        ];

        if (pathname === "/admin") {
            breadcrumbs.push({
                label: "Overview",
                href: "/admin",
                isLink: false,
            });
        } else if (pathname === "/admin/posts") {
            breadcrumbs.push({
                label: "Posts",
                href: "/admin/posts",
                isLink: false,
            });
        } else if (pathname === "/admin/users") {
            breadcrumbs.push({
                label: "Users",
                href: "/admin/users",
                isLink: false,
            });
        } else if (pathname === "/admin/posts/create-post") {
            breadcrumbs.push(
                {
                    label: "Posts",
                    href: "/admin/posts",
                    isLink: true,
                },
                {
                    label: "Create Post",
                    href: "/admin/posts/create-post",
                    isLink: false,
                }
            );
        } else if (pathname.startsWith("/admin/posts/edit-post/")) {
            const slug = pathname.replace("/admin/posts/edit-post/", "");
            breadcrumbs.push(
                {
                    label: "Posts",
                    href: "/admin/posts",
                    isLink: true,
                },
                {
                    label: "Edit Post",
                    href: "/admin/posts/edit-post",
                    isLink: false,
                },
                {
                    label: slug,
                    href: pathname,
                    isLink: false,
                }
            );
        }

        return breadcrumbs;
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 relative z-10">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        {getBreadcrumbs().map((breadcrumb, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && (
                                    <BreadcrumbSeparator className="hidden md:block" />
                                )}
                                <BreadcrumbItem className="hidden md:block ml-2">
                                    {breadcrumb.isLink ? (
                                        <BreadcrumbLink href={breadcrumb.href}>
                                            {breadcrumb.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage
                                            className={
                                                // Edit Post gets muted color, all other non-clickable items get white styling
                                                breadcrumb.label === "Edit Post"
                                                    ? "text-muted-foreground" // Same as clickable links
                                                    : "" // Original white styling
                                            }
                                        >
                                            {breadcrumb.label}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    );
}
