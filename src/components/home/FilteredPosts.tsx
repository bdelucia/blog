"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { ShineBorder } from "@/components/magicui/shine-border";
import { BLOG_IMGS_URL, type Article } from "@/data/blog-client";
import { useTagFilter } from "@/components/providers/tag-filter-provider";
import Link from "next/link";
import Image from "next/image";

interface FilteredPostsProps {
    posts: Article[];
}

const BLUR_FADE_DELAY = 0.04;

export function FilteredPosts({ posts }: FilteredPostsProps) {
    const { selectedTags } = useTagFilter();

    // Filter posts based on selected tags
    const filteredPosts =
        selectedTags.length > 0
            ? posts.filter(
                  (post) =>
                      post.tags &&
                      post.tags.some((tag) => selectedTags.includes(tag))
              )
            : posts;

    // Sort posts by date
    const sortedPosts = filteredPosts.sort((a, b) => {
        if (
            new Date(a.datePosted || a.createdAt) >
            new Date(b.datePosted || b.createdAt)
        ) {
            return -1;
        }
        return 1;
    });

    return (
        <div className="w-full">
            {sortedPosts.map((post, id) => (
                <BlurFade
                    delay={BLUR_FADE_DELAY * 2 + id * 0.05}
                    key={post.slug}
                >
                    <Link className="block mb-4 group" href={`/${post.slug}`}>
                        <div className="relative w-full flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-white/80 dark:bg-background hover:bg-white dark:hover:bg-background/80 transition-colors duration-200 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                            <ShineBorder className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Featured Image - Full width on mobile, fixed width on larger screens */}
                            <div className="w-full sm:w-[200px] h-[160px] sm:h-[160px] flex-shrink-0">
                                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    {post.image ? (
                                        <Image
                                            src={
                                                post.image.startsWith("http")
                                                    ? post.image
                                                    : `${BLOG_IMGS_URL}${post.image}`
                                            }
                                            alt={post.title}
                                            width={200}
                                            height={160}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            quality={95}
                                            priority={false}
                                            sizes="(max-width: 640px) 100vw, 200px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                            <svg
                                                className="w-8 h-8"
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

                            {/* Content - Full width on mobile, flexible on larger screens */}
                            <div className="w-full sm:flex-1 sm:min-w-0 flex flex-col justify-between sm:h-[160px]">
                                {/* Top content: title, date, badges, summary */}
                                <div className="flex flex-col space-y-3">
                                    {/* Article Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>

                                    {/* Date */}
                                    <p className="text-sm text-gray-500 dark:text-gray-500 -mt-1.5">
                                        {post.datePosted
                                            ? new Date(
                                                  post.datePosted
                                              ).toLocaleDateString()
                                            : "No date"}
                                    </p>

                                    {/* Badges/Tags */}
                                    <div className="flex flex-wrap gap-1">
                                        {post.tags && post.tags.length > 0 ? (
                                            <>
                                                {post.tags
                                                    .slice(0, 3)
                                                    .map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                {post.tags.length > 3 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                        +{post.tags.length - 3}{" "}
                                                        more
                                                    </span>
                                                )}
                                            </>
                                        ) : null}
                                    </div>

                                    {/* Summary */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                                        {post.summary || "No summary available"}
                                    </p>
                                </div>

                                {/* Read link - positioned at bottom right */}
                                <div className="flex justify-end mt-auto">
                                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer">
                                        <span>Read</span>
                                        <svg
                                            className="w-4 h-4 ml-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </BlurFade>
            ))}
        </div>
    );
}
