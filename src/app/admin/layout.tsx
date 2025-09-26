import { requireAdmin } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminDashboardProvider } from "@/components/providers/admin-dashboard-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Starfield } from "@/components/magicui/starfield";
import { ShineBorder } from "@/components/magicui/shine-border";

// Force dynamic rendering for admin layout
export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const admin = await requireAdmin();

    return (
        <div className="min-h-screen">
            <AdminDashboardProvider>
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
                            <div className="relative min-h-[calc(100vh-2rem)] bg-gray-50 dark:bg-black flex flex-col rounded-lg">
                                <Starfield
                                    starCount={150}
                                    duration={25}
                                    starColor="#ffffff"
                                    starSize={[1, 4]}
                                    className="dark:opacity-100 opacity-0"
                                />
                                {children}
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
            </AdminDashboardProvider>
        </div>
    );
}
