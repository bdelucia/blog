import { BlurFade } from "@/components/magicui/blur-fade";
import { getBlogPosts, BLOG_IMGS_URL } from "@/data/blog";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import Image from "next/image";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import ScrollArrow from "@/components/home/ScrollArrow";
import { ShineBorder } from "@/components/magicui/shine-border";

export const metadata = {
    title: "Blog",
    description: "My thoughts on software development, life, and more.",
};

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
    const posts = await getBlogPosts();

    return (
        <div className="flex flex-col h-screen">
            <Header title="Bob with a Blog" scrollProgress={true} />

            <div className="flex flex-col">
                <section
                    id="hero"
                    className="w-full h-screen px-6 pt-24 relative overflow-hidden"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/backgrounds/hero-bg.webp"
                            alt="Blog background"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay for better readability */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 to-indigo-950/10"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex items-center justify-center">
                        <BlurFade delay={BLUR_FADE_DELAY}>
                            <div className="max-w-4xl mx-auto text-center space-y-6 p-8 rounded-2xl bg-white/80 dark:bg-gray-900 backdrop-blur-sm border border-0 border-white/20 dark:border-gray-700/20">
                                <ShineBorder
                                    shineColor={[
                                        "#A07CFE",
                                        "#FE8FB5",
                                        "#FFBE7B",
                                    ]}
                                />
                                <h1 className="flex flex-col sm:flex-row justify-center gap-2 items-center text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-100">
                                    <span>Welcome</span>
                                    <TypingAnimation delay={0.75}>
                                        to Bob with a Blog!
                                    </TypingAnimation>
                                </h1>
                                <p className="text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed">
                                    Hey there! I&apos;m Bob (who else huh), and
                                    this is where I share my thoughts on
                                    software development, cooking adventures,
                                    and life in general. From coding tutorials
                                    to recipe experiments, you&apos;ll find a
                                    mix of technical insights and personal
                                    projects here.
                                </p>
                                <div className="flex justify-center space-x-8 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        {posts.length} posts published
                                    </span>
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                        Updated regularly
                                    </span>
                                </div>
                            </div>
                        </BlurFade>
                    </div>
                </section>

                {/* Blog Posts Section */}
                <section className="flex-1 px-4 py-4 rounded-lg bg-gray-50 dark:bg-gray-50/10 max-w-4xl mx-auto my-24 min-h-screen relative">
                    <BlurFade delay={BLUR_FADE_DELAY}>
                        <h1 className="font-medium text-2xl mb-8 tracking-tighter">
                            blog
                        </h1>
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
                                    className="flex flex-col space-y-1 mb-4"
                                    href={`/blog/${post.slug}`}
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
                                                {post.summary ||
                                                    "No summary available"}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </BlurFade>
                        ))}
                </section>
            </div>
            <ScrollArrow />

            <Footer />
        </div>
    );
}
