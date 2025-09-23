import { requireAdmin } from "@/lib/auth";
import { getAllUsers, getUsersByRole } from "@/db/users/functions";
import { getBlogPosts, getAllPosts } from "@/db/articles/functions";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminCards } from "@/components/admin-cards";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Starfield } from "@/components/magicui/starfield";
import { ShineBorder } from "@/components/magicui/shine-border";
import data from "./data.json";

// Force dynamic rendering for admin page
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const admin = await requireAdmin();

    // Get statistics
    const [allUsers, adminUsers, regularUsers, publishedPosts, allPosts] =
        await Promise.all([
            getAllUsers(),
            getUsersByRole("admin"),
            getUsersByRole("user"),
            getBlogPosts(),
            getAllPosts(),
        ]);

    const stats = {
        totalUsers: allUsers.length,
        adminUsers: adminUsers.length,
        regularUsers: regularUsers.length,
        publishedPosts: publishedPosts.length,
        totalPosts: allPosts.length,
        draftPosts: allPosts.length - publishedPosts.length,
    };

    return (
        <div className="h-screen overflow-hidden">
            <SidebarProvider>
                <AppSidebar
                    user={{
                        name: admin.fullName || "Admin",
                        email: admin.email,
                        avatar: admin.avatarUrl || undefined,
                    }}
                />
                <SidebarInset>
                    <div className="relative mx-4 my-4">
                        <div className="relative h-full bg-gray-50 dark:bg-black overflow-hidden flex flex-col rounded-lg">
                            <Starfield
                                starCount={150}
                                duration={25}
                                starColor="#ffffff"
                                starSize={[1, 4]}
                                className="dark:opacity-100 opacity-0"
                            />
                            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 relative z-10">
                                <div className="flex items-center gap-2 px-4">
                                    <SidebarTrigger className="-ml-1" />
                                    <Separator
                                        orientation="vertical"
                                        className="mr-2 data-[orientation=vertical]:h-4"
                                    />
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem className="hidden md:block">
                                                <BreadcrumbLink href="/admin">
                                                    Admin Dashboard
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator className="hidden md:block" />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>
                                                    Overview
                                                </BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>
                            </header>
                            <div className="flex flex-1 flex-col relative z-10 overflow-hidden">
                                <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto">
                                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                        <AdminCards
                                            stats={stats}
                                            analytics={{
                                                uniqueVisitors: 1247,
                                                pageViews: 3842,
                                                sessions: 1563,
                                                bounceRate: 42.3,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ShineBorder
                            shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                            duration={12}
                            borderWidth={2}
                            className="rounded-lg"
                        />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
