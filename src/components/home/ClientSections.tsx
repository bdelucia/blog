"use client";

import { TagFilterProvider } from "@/components/providers/tag-filter-provider";
import { HeroTagFilter } from "@/components/home/HeroTagFilter";
import { FilteredPosts } from "@/components/home/FilteredPosts";
import { TagFilterModal } from "@/components/home/TagFilterModal";
import { BlurFade } from "@/components/magicui/blur-fade";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { Starfield } from "@/components/magicui/starfield";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Search } from "lucide-react";
import { type Article } from "@/data/blog-client";

interface ClientSectionsProps {
    posts: Article[];
    allTags: string[];
}

const BLUR_FADE_DELAY = 0.04;

export function ClientSections({ posts, allTags }: ClientSectionsProps) {
    return (
        <TagFilterProvider>
            <div className="flex flex-col">
                <section
                    id="hero"
                    className="relative w-full min-h-screen bg-gray-50 dark:bg-black px-4 sm:px-6 lg:px-8 pt-24 pb-12"
                >
                    <Starfield
                        starCount={150}
                        duration={25}
                        starColor="#ffffff"
                        starSize={[1, 4]}
                        className="dark:opacity-100 opacity-0"
                    />
                    {/* Grid Layout */}
                    <div className="max-w-7xl mx-auto min-h-full flex flex-col gap-8 justify-between">
                        {/* Top Content Group */}
                        <div className="flex flex-col gap-8">
                            {/* Top Row: Title (left) and Search/Filter (right) */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                {/* Title */}
                                <BlurFade delay={BLUR_FADE_DELAY}>
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                        <span className="block">
                                            Welcome to
                                        </span>
                                        <TypingAnimation delay={0.75}>
                                            Bob with a Blog!
                                        </TypingAnimation>
                                    </h1>
                                </BlurFade>
                            </div>

                            {/* Tag Filter Row */}
                            <HeroTagFilter allTags={allTags} />

                            {/* Browse All Posts Button */}
                            <BlurFade delay={BLUR_FADE_DELAY * 3}>
                                <div className="flex justify-start">
                                    <InteractiveHoverButton
                                        onClick={() => {
                                            setTimeout(() => {
                                                const blogSection =
                                                    document.getElementById(
                                                        "blog-posts"
                                                    );
                                                if (blogSection) {
                                                    const elementPosition =
                                                        blogSection.getBoundingClientRect()
                                                            .top;
                                                    const offsetPosition =
                                                        elementPosition +
                                                        window.pageYOffset -
                                                        100; // 100px offset from top

                                                    window.scrollTo({
                                                        top: offsetPosition,
                                                        behavior: "smooth",
                                                    });
                                                }
                                            }, 200);
                                        }}
                                        className="[&>svg]:w-2 [&>svg]:h-2 [&>svg]:translate-x-2 [&_.hover-text]:translate-x-2 bg-[#00FFFF] text-black [&>span:first-child]:opacity-0 [&>span:first-child]:text-transparent [&>div>div:first-child]:bg-black [&>div:last-child>span]:text-white [&>div:last-child>svg]:text-white"
                                    >
                                        Browse all posts
                                    </InteractiveHoverButton>
                                </div>
                            </BlurFade>
                        </div>

                        {/* Recent Posts Grid - Pushed to Bottom */}
                        <BlurFade delay={BLUR_FADE_DELAY * 4}>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Recent Posts
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3 lg:gap-4">
                                    {posts
                                        .sort((a, b) => {
                                            if (
                                                new Date(
                                                    a.datePosted || a.createdAt
                                                ) >
                                                new Date(
                                                    b.datePosted || b.createdAt
                                                )
                                            ) {
                                                return -1;
                                            }
                                            return 1;
                                        })
                                        .slice(0, 3)
                                        .map((post, id) => (
                                            <BlurFade
                                                delay={
                                                    BLUR_FADE_DELAY * 5 +
                                                    id * 0.1
                                                }
                                                key={post.slug}
                                            >
                                                <div className="relative bg-white dark:bg-background rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300">
                                                    {/* Post Image */}
                                                    <div className="aspect-[3/2] sm:aspect-[2/1] lg:aspect-[5/2] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                                        {post.image ? (
                                                            <img
                                                                src={
                                                                    post.image.startsWith(
                                                                        "http"
                                                                    )
                                                                        ? post.image
                                                                        : `/images/${post.image}`
                                                                }
                                                                alt={post.title}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                                                <svg
                                                                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Post Content */}
                                                    <div className="p-6 sm:p-5 lg:p-3">
                                                        {/* Title and Date Row */}
                                                        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-1.5">
                                                            <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                                                                {post.title}
                                                            </h3>
                                                            <div className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                                                                {post.datePosted
                                                                    ? (() => {
                                                                          const postDate =
                                                                              new Date(
                                                                                  post.datePosted
                                                                              );
                                                                          const now =
                                                                              new Date();
                                                                          const diffTime =
                                                                              Math.abs(
                                                                                  now.getTime() -
                                                                                      postDate.getTime()
                                                                              );
                                                                          const diffDays =
                                                                              Math.ceil(
                                                                                  diffTime /
                                                                                      (1000 *
                                                                                          60 *
                                                                                          60 *
                                                                                          24)
                                                                              );
                                                                          return diffDays ===
                                                                              1
                                                                              ? "1 day ago"
                                                                              : `${diffDays} days ago`;
                                                                      })()
                                                                    : "No date"}
                                                            </div>
                                                        </div>

                                                        {/* Tags */}
                                                        <div className="flex flex-wrap gap-1 mb-1 sm:mb-2 min-h-[20px]">
                                                            {post.tags &&
                                                            post.tags.length >
                                                                0 ? (
                                                                <>
                                                                    {post.tags
                                                                        .slice(
                                                                            0,
                                                                            2
                                                                        )
                                                                        .map(
                                                                            (
                                                                                tag,
                                                                                index
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                                                                >
                                                                                    {
                                                                                        tag
                                                                                    }
                                                                                </span>
                                                                            )
                                                                        )}
                                                                    {post.tags
                                                                        .length >
                                                                        2 && (
                                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                                            +
                                                                            {post
                                                                                .tags
                                                                                .length -
                                                                                2}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div className="w-0"></div>
                                                            )}
                                                        </div>

                                                        {/* Summary */}
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 mb-2 min-h-[3rem] sm:min-h-[4rem]">
                                                            {post.summary ||
                                                                "No summary available"}
                                                        </p>

                                                        {/* Read button */}
                                                        <div className="flex justify-end min-h-[20px]">
                                                            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer">
                                                                <span>
                                                                    Read
                                                                </span>
                                                                <svg
                                                                    className="w-3 h-3 ml-1"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M9 5l7 7-7 7"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </BlurFade>
                                        ))}
                                </div>
                            </div>
                        </BlurFade>
                    </div>
                </section>

                {/* Blog Posts Section */}
                <section
                    id="blog-posts"
                    className="flex-1 px-2 sm:px-4 py-4 rounded-lg bg-gray-50 dark:bg-gray-50/10 w-full max-w-4xl mx-auto my-20 sm:my-24 min-h-screen relative"
                >
                    <BlurFade delay={BLUR_FADE_DELAY}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                            <h1 className="font-medium text-xl sm:text-2xl tracking-tighter">
                                blog
                            </h1>

                            {/* Search and Filter */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search posts..."
                                        className="w-full sm:w-48 pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Tag Filter Modal */}
                                <TagFilterModal allTags={allTags} />
                            </div>
                        </div>
                    </BlurFade>
                    <div className="w-full max-w-4xl mx-auto">
                        <FilteredPosts posts={posts} />
                    </div>
                </section>
            </div>
        </TagFilterProvider>
    );
}
