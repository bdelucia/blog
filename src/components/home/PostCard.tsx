"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { BlurFade } from "../magicui/blur-fade";
import { BLOG_IMGS_URL, BLUR_FADE_DELAY } from "@/data/blog";

interface Article {
    id: number;
    title: string;
    summary: string | null;
    image: string | null;
    datePosted: string | null;
    status: "draft" | "published";
    content: string | null;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export default function PostCard() {
    const [posts, setPosts] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchPosts() {
            try {
                const { data, error } = await supabase
                    .from("articles")
                    .select("*")
                    .eq("status", "published")
                    .order("datePosted", { ascending: false });

                if (error) {
                    console.error("Error fetching posts:", error);
                    return;
                }

                setPosts(data || []);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, [supabase]);

    if (loading) {
        return (
            <section className="flex-1 px-4 py-4 rounded-lg bg-gray-50 dark:bg-gray-50/10 max-w-4xl mx-auto my-24 min-h-screen relative">
                <BlurFade delay={BLUR_FADE_DELAY}>
                    <h1 className="font-medium text-2xl mb-8 tracking-tighter">
                        blog
                    </h1>
                </BlurFade>
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading posts...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="flex-1 px-4 py-4 rounded-lg bg-gray-50 dark:bg-gray-50/10 max-w-4xl mx-auto my-24 min-h-screen relative">
            <BlurFade delay={BLUR_FADE_DELAY}>
                <h1 className="font-medium text-2xl mb-8 tracking-tighter">
                    blog
                </h1>
            </BlurFade>
            {posts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        No published posts yet.
                    </p>
                </div>
            ) : (
                posts.map((post, id) => (
                    <BlurFade
                        delay={BLUR_FADE_DELAY * 2 + id * 0.05}
                        key={post.id}
                    >
                        <Link
                            className="flex flex-col space-y-1 mb-4"
                            href={`/${post.slug}`}
                        >
                            <div className="w-full flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 transform-gpu">
                                        {post.image ? (
                                            <Image
                                                src={
                                                    post.image.startsWith(
                                                        "http"
                                                    )
                                                        ? post.image
                                                        : `${BLOG_IMGS_URL}${post.image}`
                                                }
                                                alt={post.title}
                                                width={192}
                                                height={128}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                quality={95}
                                                priority={false}
                                                sizes="192px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Post content */}
                                <div className="flex-1 min-w-0">
                                    <p className="tracking-tight truncate">
                                        {post.title}
                                    </p>
                                    <p className="h-6 text-xs text-muted-foreground">
                                        {post.datePosted
                                            ? new Date(
                                                  post.datePosted
                                              ).toLocaleDateString()
                                            : "No date"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {post.summary || "No summary available"}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </BlurFade>
                ))
            )}
        </section>
    );
}
