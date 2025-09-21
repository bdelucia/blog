import { BlurFade } from "@/components/magicui/blur-fade";
import { getBlogPosts, BLOG_IMGS_URL, type Article } from "@/data/blog";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import Image from "next/image";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { ShineBorder } from "@/components/magicui/shine-border";
import { Starfield } from "@/components/magicui/starfield";
import { UnauthorizedToast } from "@/components/shared/UnauthorizedToast";
import { Search } from "lucide-react";
import { TagFilterModal } from "@/components/home/TagFilterModal";

export const metadata = {
    title: "Bob with a Blog",
    description: "My thoughts on software development, life, and more.",
};

const BLUR_FADE_DELAY = 0.04;

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

                            {/* Summary Row */}
                            <BlurFade delay={BLUR_FADE_DELAY * 3}>
                                <div className="max-w-4xl">
                                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Hey there! I&apos;m Bob, and this is
                                        where I share my thoughts on software
                                        development, cooking adventures, and
                                        life in general. From coding tutorials
                                        to recipe experiments, you&apos;ll find
                                        a mix of technical insights and personal
                                        projects here.
                                    </p>
                                </div>
                            </BlurFade>
                        </div>

                        {/* Recent Posts Grid - Pushed to Bottom */}
                        <BlurFade delay={BLUR_FADE_DELAY * 4}>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Recent Posts
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
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
                                                <Link
                                                    href={`/${post.slug}`}
                                                    className="group"
                                                >
                                                    <article className="relative bg-white dark:bg-background rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300">
                                                        <ShineBorder className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                                                        {/* Post Image */}
                                                        <div className="aspect-[3/2] sm:aspect-video lg:aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                                            {post.image ? (
                                                                <Image
                                                                    src={
                                                                        post.image.startsWith(
                                                                            "http"
                                                                        )
                                                                            ? post.image
                                                                            : `${BLOG_IMGS_URL}${post.image}`
                                                                    }
                                                                    alt={
                                                                        post.title
                                                                    }
                                                                    fill
                                                                    className="object-cover"
                                                                    loading="lazy"
                                                                    quality={95}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                                                    <svg
                                                                        className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12"
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
                                                        <div className="p-2 sm:p-3 lg:p-4">
                                                            {/* Title */}
                                                            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1 sm:mb-2">
                                                                {post.title}
                                                            </h3>

                                                            {/* Date */}
                                                            <div className="text-xs text-gray-500 dark:text-gray-500 mb-1 sm:mb-2">
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

                                                            {/* Summary */}
                                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 mb-2">
                                                                {post.summary ||
                                                                    "No summary available"}
                                                            </p>

                                                            {/* Tags and Read button */}
                                                            <div className="flex items-center justify-between min-h-[20px]">
                                                                {/* Tags */}
                                                                <div className="flex flex-wrap gap-1">
                                                                    {post.tags &&
                                                                    post.tags
                                                                        .length >
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
                                                                            {post
                                                                                .tags
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

                                                                {/* Read button */}
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
                                                    </article>
                                                </Link>
                                            </BlurFade>
                                        ))}
                                </div>
                            </div>
                        </BlurFade>
                    </div>
                </section>

                {/* Blog Posts Section */}
                <section className="flex-1 px-2 sm:px-4 py-4 rounded-lg bg-gray-50 dark:bg-gray-50/10 max-w-4xl mx-auto my-20 sm:my-24 min-h-screen relative">
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
                    {posts
                        .sort((a, b) => {
                            if (
                                new Date(a.datePosted || a.createdAt) >
                                new Date(b.datePosted || b.createdAt)
                            ) {
                                return -1;
                            }
                            return 1;
                        })
                        .map((post, id) => (
                            <BlurFade
                                delay={BLUR_FADE_DELAY * 2 + id * 0.05}
                                key={post.slug}
                            >
                                <Link
                                    className="flex flex-col space-y-1 mb-4 group"
                                    href={`/${post.slug}`}
                                >
                                    <div className="relative w-full flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-lg bg-white/80 dark:bg-background hover:bg-white dark:hover:bg-background/80 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
                                        <ShineBorder className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="flex-shrink-0 w-full sm:w-48">
                                            <div className="w-full sm:w-48 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 transform-gpu">
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
                                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                                            <div className="flex-1">
                                                <p className="tracking-tight truncate text-sm sm:text-base font-medium">
                                                    {post.title}
                                                </p>
                                                <p className="h-6 text-xs sm:text-sm text-muted-foreground">
                                                    {post.datePosted
                                                        ? new Date(
                                                              post.datePosted
                                                          ).toLocaleDateString()
                                                        : "No date"}
                                                </p>
                                                <p className="text-xs sm:text-sm text-muted-foreground mb-2 min-h-[3rem]">
                                                    {post.summary ||
                                                        "No summary available"}
                                                </p>
                                            </div>

                                            {/* Tags and Read button on same line - pushed to bottom */}
                                            <div className="flex items-center justify-between mb-2">
                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1">
                                                    {post.tags &&
                                                    post.tags.length > 0 ? (
                                                        <>
                                                            {post.tags
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        tag,
                                                                        index
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            {post.tags.length >
                                                                3 && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                                    +
                                                                    {post.tags
                                                                        .length -
                                                                        3}{" "}
                                                                    more
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-0"></div>
                                                    )}
                                                </div>

                                                {/* Read more link */}
                                                <div className="flex items-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mr-8 cursor-pointer">
                                                    <span>Read</span>
                                                    <svg
                                                        className="w-3 h-3 ml-1"
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
                </section>
            </div>

            <Footer />
        </div>
    );
}
