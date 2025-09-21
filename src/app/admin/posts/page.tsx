import { requireAdmin } from "@/lib/auth";
import { getAllPosts } from "@/db/articles/functions";
import { AdminPostsPageClient } from "@/components/admin/AdminPostsPageClient";

// Force dynamic rendering for admin page
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
    const admin = await requireAdmin();

    // Get all posts (both published and draft)
    const posts = await getAllPosts();

    return <AdminPostsPageClient initialPosts={posts} />;
}
