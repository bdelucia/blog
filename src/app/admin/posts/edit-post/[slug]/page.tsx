import { getPost } from "@/data/blog";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EditPostForm } from "@/components/admin/EditPostForm";

interface EditPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
    const resolvedParams = await params;
    const user = await getCurrentUser();

    // Check if user is authenticated and is admin
    if (!user || user.role !== "admin") {
        redirect("/auth/login");
    }

    // Fetch the post data
    const post = await getPost(resolvedParams.slug);

    if (!post) {
        redirect("/admin/posts");
    }

    return <EditPostForm post={post} />;
}
