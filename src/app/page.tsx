import { getBlogPosts } from "@/data/blog";
import { type Article } from "@/data/blog-client";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { UnauthorizedToast } from "@/components/shared/UnauthorizedToast";
import { ClientSections } from "@/components/home/ClientSections";

export const metadata = {
    title: "Home",
    description:
        "Welcome to Bob with a Blog! Discover insights on software development, programming tips, and personal experiences. Explore the latest posts about technology, coding, and life adventures.",
    keywords: [
        "blog",
        "homepage",
        "technology",
        "programming",
        "software development",
        "coding",
        "web development",
    ],
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Bob with a Blog - Home",
        description:
            "Welcome to Bob with a Blog! Discover insights on software development, programming tips, and personal experiences.",
        url: "/",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Bob with a Blog - Home",
        description:
            "Welcome to Bob with a Blog! Discover insights on software development, programming tips, and personal experiences.",
    },
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
