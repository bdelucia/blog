import { getBlogPosts } from "@/data/blog";
import { type Article } from "@/data/blog-client";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { UnauthorizedToast } from "@/components/shared/UnauthorizedToast";
import { ClientSections } from "@/components/home/ClientSections";

export const metadata = {
    title: "Bob with a Blog",
    description: "My thoughts on software development, life, and more.",
};

// Force dynamic rendering to avoid build-time cookie issues
export const dynamic = "force-dynamic";

export default async function BlogPage() {
    let posts: Article[] = [];
    try {
        posts = await getBlogPosts();
    } catch (error) {
        console.error("Error fetching posts:", error);
        posts = [];
    }

    // Get all unique tags for filtering
    const allTags = Array.from(
        new Set(posts.flatMap((post) => post.tags || []))
    ).sort();

    return (
        <div className="flex flex-col h-screen">
            <Header scrollProgress={false} />
            <UnauthorizedToast />

            <ClientSections posts={posts} allTags={allTags} />

            <Footer />
        </div>
    );
}
