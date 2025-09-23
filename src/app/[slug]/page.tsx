import { getBlogPosts, getPost } from "@/data/blog";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BLOG_IMGS_URL } from "@/lib/constants";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BlogCarousel from "@/components/mdx-components/BlogCarousel";
import Table from "@/components/mdx-components/Table";
import BlogImage from "@/components/mdx-components/BlogImage";
import { MDXRemote } from "next-mdx-remote/rsc";
import { UnauthorizedToast } from "@/components/shared/UnauthorizedToast";
import { BlogPostTracker } from "@/components/analytics/BlogPostTracker";
import { getCurrentUser } from "@/lib/auth";
import rehypeHighlight from "rehype-highlight";

// Function to convert HTML content to MDX-compatible format
function convertHtmlToMdx(htmlContent: string): string {
    if (!htmlContent || htmlContent.trim() === "") {
        return "";
    }

    let mdx = htmlContent;

    // Convert img tags to proper MDX format (self-closing with space before />)
    mdx = mdx.replace(/<img([^>]*?)\s*\/?>/g, (match, attributes) => {
        // Ensure there's a space before the closing />
        return `<img${attributes} />`;
    });

    // Convert other HTML tags to MDX-compatible format
    // Convert headers
    mdx = mdx.replace(/<h1[^>]*>(.*?)<\/h1>/g, "\n# $1\n");
    mdx = mdx.replace(/<h2[^>]*>(.*?)<\/h2>/g, "\n## $1\n");
    mdx = mdx.replace(/<h3[^>]*>(.*?)<\/h3>/g, "\n### $1\n");
    mdx = mdx.replace(/<h4[^>]*>(.*?)<\/h4>/g, "\n#### $1\n");
    mdx = mdx.replace(/<h5[^>]*>(.*?)<\/h5>/g, "\n##### $1\n");
    mdx = mdx.replace(/<h6[^>]*>(.*?)<\/h6>/g, "\n###### $1\n");

    // Convert text formatting
    mdx = mdx.replace(/<strong[^>]*>(.*?)<\/strong>/g, "**$1**");
    mdx = mdx.replace(/<b[^>]*>(.*?)<\/b>/g, "**$1**");
    mdx = mdx.replace(/<em[^>]*>(.*?)<\/em>/g, "*$1*");
    mdx = mdx.replace(/<i[^>]*>(.*?)<\/i>/g, "*$1*");

    // Convert lists
    mdx = mdx.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match, content) => {
        return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, "- $1\n") + "\n";
    });
    mdx = mdx.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (match, content) => {
        let counter = 1;
        return (
            content.replace(
                /<li[^>]*>([\s\S]*?)<\/li>/g,
                () => `${counter++}. $1\n`
            ) + "\n"
        );
    });

    // Convert links
    mdx = mdx.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, "[$2]($1)");

    // Convert blockquotes
    mdx = mdx.replace(
        /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g,
        (match, content) => {
            return content.replace(/^/gm, "> ") + "\n";
        }
    );

    // Convert horizontal rules
    mdx = mdx.replace(/<hr[^>]*\/?>/g, "\n---\n");

    // Convert code blocks with language support
    mdx = mdx.replace(
        /<pre[^>]*class="[^"]*hljs[^"]*"[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
        (match, content) => {
            // Extract language from class attribute if present
            const langMatch = match.match(/class="[^"]*language-(\w+)[^"]*"/);
            const language = langMatch ? langMatch[1] : "";

            // Decode HTML entities in code content
            const decodedContent = content
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'");

            return language
                ? `\`\`\`${language}\n${decodedContent}\n\`\`\`\n`
                : `\`\`\`\n${decodedContent}\n\`\`\`\n`;
        }
    );

    // Convert inline code
    mdx = mdx.replace(/<code[^>]*>(.*?)<\/code>/g, (match, content) => {
        const decodedContent = content
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'");
        return `\`${decodedContent}\``;
    });

    // Convert paragraphs to newlines
    mdx = mdx.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "\n\n");

    // Convert line breaks
    mdx = mdx.replace(/<br\s*\/?>/g, "\n");

    // Clean up extra whitespace
    mdx = mdx.replace(/\n{3,}/g, "\n\n").trim();

    return mdx;
}

const DATA = {
    name: "Bob with a Blog",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

// Force dynamic rendering to avoid build-time cookie issues
export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{
        slug: string;
    }>;
}): Promise<Metadata | undefined> {
    try {
        const resolvedParams = await params;
        let post = await getPost(resolvedParams.slug);

        if (!post) {
            return undefined;
        }

        // Don't generate metadata for draft posts (except for admins)
        const currentUser = await getCurrentUser();
        const isAdmin = currentUser?.role === "admin";
        if (post.status === "draft" && !isAdmin) {
            return undefined;
        }

        let {
            title,
            datePosted: publishedTime,
            summary: description,
            image,
        } = post;
        let ogImage = image
            ? image.startsWith("http")
                ? image
                : `${DATA.url}${image}`
            : `${DATA.url}/og?title=${title}`;

        return {
            title: title || "Untitled",
            description: description || undefined,
            openGraph: {
                title: title || "Untitled",
                description: description || undefined,
                type: "article",
                publishedTime: publishedTime || undefined,
                url: `${DATA.url}/${post.slug}`,
                images: [
                    {
                        url: ogImage,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                title: title || "Untitled",
                description: description || undefined,
                images: [ogImage],
            },
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return undefined;
    }
}

export default async function Blog({
    params,
}: {
    params: Promise<{
        slug: string;
    }>;
}) {
    let post;
    try {
        const resolvedParams = await params;
        post = await getPost(resolvedParams.slug);
    } catch (error) {
        console.error("Error fetching post:", error);
        notFound();
    }

    if (!post) {
        notFound();
    }

    // Get current user to check admin status
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === "admin";
    const isDraft = post.status === "draft";

    // Server-side redirect for non-admin users trying to access draft posts
    if (isDraft && !isAdmin) {
        redirect("/?draft_access_denied=true");
    }

    // Define MDX components directly
    const components = {
        BlogCarousel: (props: any) => <BlogCarousel {...props} />,
        Table: (props: any) => <Table {...props} />,
        BlogImage: (props: any) => (
            <BlogImage {...props} baseUrl={BLOG_IMGS_URL} />
        ),
    };

    return (
        <div className="flex flex-col h-screen">
            <Header title="Bob with a Blog" />
            <UnauthorizedToast />
            <BlogPostTracker postTitle={post.title} postSlug={post.slug} />

            <div className="flex-1">
                <section
                    id="blog"
                    className="px-4 py-4 rounded-lg bg-gray-50 dark:bg-gray-50/10 max-w-4xl mx-auto my-24"
                >
                    <script
                        type="application/ld+json"
                        suppressHydrationWarning
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "BlogPosting",
                                headline: post.title,
                                datePublished:
                                    post.datePosted || post.createdAt,
                                dateModified: post.updatedAt,
                                description: post.summary,
                                image: post.image
                                    ? post.image.startsWith("http")
                                        ? post.image
                                        : `${DATA.url}${post.image}`
                                    : `${DATA.url}/og?title=${post.title}`,
                                url: `${DATA.url}/${post.slug}`,
                                author: {
                                    "@type": "Person",
                                    name: DATA.name,
                                },
                            }),
                        }}
                    />
                    <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
                        {post.title}
                    </h1>
                    <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
                        <Suspense fallback={<p className="h-5" />}>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {post.datePosted
                                    ? new Date(
                                          post.datePosted
                                      ).toLocaleDateString()
                                    : "No date"}
                            </p>
                        </Suspense>
                    </div>
                    <article className="prose max-w-[650px] mx-auto">
                        <MDXRemote
                            source={convertHtmlToMdx(post.content || "")}
                            components={components}
                            options={{
                                mdxOptions: {
                                    remarkPlugins: [],
                                    rehypePlugins: [rehypeHighlight],
                                },
                            }}
                        />
                    </article>
                </section>
            </div>

            <Footer />
        </div>
    );
}
