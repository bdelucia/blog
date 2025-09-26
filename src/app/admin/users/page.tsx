import { requireAdmin } from "@/lib/auth";
import { AdminDashboardProvider } from "@/components/providers/admin-dashboard-provider";
import { AdminUsersView } from "@/components/admin/AdminUsersView";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    await requireAdmin();

    return (
        <AdminDashboardProvider>
            <AdminUsersView />
        </AdminDashboardProvider>
    );
}
