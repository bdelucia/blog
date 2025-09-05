import { getBlogPosts, getPost } from "@/data/blog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BLOG_IMGS_URL } from "@/lib/constants";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BlogCarousel from "@/components/mdx-components/BlogCarousel";
import Table from "@/components/mdx-components/Table";
import BlogImage from "@/components/mdx-components/BlogImage";
import { MDXRemote } from "next-mdx-remote/rsc";

const DATA = {
    name: "Bob with a Blog",
    url: "http://localhost:3000", // Replace with your actual URL
};

// Force dynamic rendering to avoid build-time cookie issues
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
    try {
        const posts = await getBlogPosts();
        return posts.map((post) => ({ slug: post.slug }));
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

export async function generateMetadata({
    params,
}: {
    params: {
        slug: string;
    };
}): Promise<Metadata | undefined> {
    try {
        let post = await getPost(params.slug);

        if (!post) {
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
    params: {
        slug: string;
    };
}) {
    let post;
    try {
        post = await getPost(params.slug);
    } catch (error) {
        console.error("Error fetching post:", error);
        notFound();
    }

    if (!post) {
        notFound();
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
                    <article className="prose dark:prose-invert max-w-[650px] mx-auto">
                        <MDXRemote
                            source={post.content || ""}
                            components={components}
                        />
                    </article>
                </section>
            </div>

            <Footer />
        </div>
    );
}
