import { NewPostForm } from "@/components/admin/NewPostForm";
import { requireAdmin } from "@/lib/auth";

// Force dynamic rendering for admin page
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
    await requireAdmin();

    return <NewPostForm />;
}
