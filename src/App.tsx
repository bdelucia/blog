import ScrollArrow from "./components/home/ScrollArrow";
import { BlurFade } from "./components/magicui/blur-fade";
import { TypingAnimation } from "./components/magicui/typing-animation";
import { BlogHeader } from "./components/shared/BlogHeader";
import Footer from "./components/shared/Footer";
import { Link } from "./components/ui/link";

const BLUR_FADE_DELAY = 0.04;

// Example posts for testing
const posts = [
    {
        id: 1,
        slug: "getting-started-with-vite",
        title: "Getting Started with Vite",
        summary:
            "Learn how to set up a Vite project with React and TypeScript.",
        published_at: "2024-01-15T00:00:00Z",
        image_url: "/api/images/vite-logo.png",
        tags: ["vite", "react", "typescript", "frontend"],
    },
    {
        id: 2,
        slug: "building-a-blog-with-express",
        title: "Building a Blog with Express",
        summary:
            "Create a full-stack blog application using Express and React.",
        published_at: "2024-01-20T00:00:00Z",
        image_url: "/api/images/express-logo.png",
        tags: ["express", "nodejs", "api", "backend"],
    },
    {
        id: 3,
        slug: "my-first-blog-post",
        title: "My First Blog Post",
        summary: "Welcome to my blog! Here's what I'll be writing about.",
        published_at: "2024-01-25T00:00:00Z",
        image_url: "/api/images/blog-logo.png",
        tags: ["introduction", "blog", "personal"],
    },
];

export default function BlogPage() {
    return (
        <div className="flex flex-col h-screen">
            <BlogHeader title="Bob with a Blog" scrollProgress={true} />

            <div className="flex flex-col">
                <section
                    id="hero"
                    className="w-full h-screen px-6 relative overflow-hidden"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/hero-bg.webp" // You can replace this with your image path
                            alt="Blog background"
                            className="object-cover w-full h-full"
                        />
                        {/* Overlay for better readability */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 to-indigo-950/10"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex items-center justify-center">
                        <BlurFade delay={BLUR_FADE_DELAY}>
                            <div className="max-w-4xl mx-auto text-center space-y-6 p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
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
                                new Date(a.published_at) >
                                new Date(b.published_at)
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
                                                {post.image_url ? (
                                                    <img
                                                        src={post.image_url}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
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
                                                {post.published_at}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {post.summary}
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
