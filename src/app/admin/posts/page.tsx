import { requireAdmin } from "@/lib/auth";
import { AdminDashboardProvider } from "@/components/providers/admin-dashboard-provider";
import { AdminPostsView } from "@/components/admin/AdminPostsView";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
    await requireAdmin();

    return (
        <AdminDashboardProvider>
            <AdminPostsView />
        </AdminDashboardProvider>
    );
}
