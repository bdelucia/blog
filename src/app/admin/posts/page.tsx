import { requireAdmin } from "@/lib/auth";
import { getAllPosts } from "@/db/articles/functions";
import { AdminPostsList } from "@/components/admin/AdminPostsList";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Force dynamic rendering for admin page
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
    const admin = await requireAdmin();

    // Get all posts (both published and draft)
    const posts = await getAllPosts();

    return <AdminPostsList posts={posts} />;
}
