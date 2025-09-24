import { getBlogPosts, getPost } from "@/data/blog";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React, { Suspense } from "react";
import { BLOG_IMGS_URL } from "@/lib/constants";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BlogCarousel from "@/components/mdx-components/BlogCarousel";
import Table from "@/components/mdx-components/Table";
import BlogImage from "@/components/mdx-components/BlogImage";
import SandpackRenderer from "@/components/mdx-components/SandpackRenderer";
import DebugContent from "@/components/mdx-components/DebugContent";
import Highlight from "@/components/mdx-components/Highlight";
import Checkbox from "@/components/mdx-components/Checkbox";
import Admonition from "@/components/mdx-components/Admonition";
import MDXTable, {
    MDXTableHead,
    MDXTableBody,
    MDXTableRow,
    MDXTableCell,
} from "@/components/mdx-components/MDXTable";
import { MDXRemote } from "next-mdx-remote/rsc";
import { UnauthorizedToast } from "@/components/shared/UnauthorizedToast";
import { BlogPostTracker } from "@/components/analytics/BlogPostTracker";
import { getCurrentUser } from "@/lib/auth";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import "@mdxeditor/editor/style.css";

// Function to prepare content for MDX rendering
function prepareContentForMdx(content: string): string {
    if (!content || content.trim() === "") {
        return "";
    }

    // Check if content is already Markdown
    // If it contains HTML tags, it's HTML; otherwise it's Markdown
    const hasHtmlTags = /<[^>]+>/.test(content);
    const isMarkdown = !hasHtmlTags;

    if (isMarkdown) {
        // Content is already Markdown, but we still need to process directives
        let processedContent = content;

        // Convert directive syntax to JSX components
        processedContent = processedContent.replace(
            /:::(\w+)\s*\n([\s\S]*?)\n:::/g,
            (match, type, content) => {
                const trimmedContent = content.trim();
                return `<Admonition type="${type}">${trimmedContent}</Admonition>`;
            }
        );

        // Also try single-line pattern
        processedContent = processedContent.replace(
            /:::(\w+)\s+([^:]+):::/g,
            (match, type, content) => {
                const trimmedContent = content.trim();
                return `<Admonition type="${type}">${trimmedContent}</Admonition>`;
            }
        );

        return processedContent;
    }

    // Content is HTML, convert to Markdown
    let mdx = content;

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

    // Convert highlighting - handle both HTML and markdown syntax
    mdx = mdx.replace(/<mark[^>]*>(.*?)<\/mark>/g, "<mark>$1</mark>");
    // Convert markdown highlighting syntax ==text== to <mark>text</mark>
    mdx = mdx.replace(/==([^=]+)==/g, "<mark>$1</mark>");

    // Convert lists
    mdx = mdx.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match, content) => {
        return (
            content.replace(
                /<li[^>]*>([\s\S]*?)<\/li>/g,
                (liMatch: string, liContent: string) => {
                    // Check if this is a checkbox list item
                    const checkboxMatch = liContent.match(
                        /<input[^>]*type="checkbox"[^>]*checked[^>]*\/?>/
                    );
                    if (checkboxMatch) {
                        const textContent = liContent
                            .replace(/<input[^>]*type="checkbox"[^>]*\/?>/g, "")
                            .trim();
                        return `- [x] ${textContent}\n`;
                    }
                    const uncheckedMatch = liContent.match(
                        /<input[^>]*type="checkbox"[^>]*\/?>/
                    );
                    if (uncheckedMatch) {
                        const textContent = liContent
                            .replace(/<input[^>]*type="checkbox"[^>]*\/?>/g, "")
                            .trim();
                        return `- [ ] ${textContent}\n`;
                    }
                    return `- ${liContent}\n`;
                }
            ) + "\n"
        );
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

    // Convert tables - handle both HTML and markdown tables
    mdx = mdx.replace(/<table[^>]*>([\s\S]*?)<\/table>/g, (match, content) => {
        // Convert HTML table to markdown table
        const rows = content.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
        if (!rows) return match;

        let markdownTable = "\n";
        let isHeader = true;

        rows.forEach((row: string, index: number) => {
            const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g);
            if (!cells) return;

            const cellContents = cells.map((cell: string) =>
                cell.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g, "$1").trim()
            );

            markdownTable += "| " + cellContents.join(" | ") + " |\n";

            if (isHeader && index === 0) {
                markdownTable +=
                    "| " + cellContents.map(() => "---").join(" | ") + " |\n";
                isHeader = false;
            }
        });

        return markdownTable + "\n";
    });

    // Convert sandpack blocks first (before regular code blocks)
    // Try multiple patterns to catch different sandpack formats

    // Pattern 1: Standard sandpack div wrapper
    mdx = mdx.replace(
        /<div[^>]*class="[^"]*sandpack[^"]*"[^>]*><pre[^>]*class="[^"]*hljs[^"]*"[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre><\/div>/g,
        (match, content) => {
            console.log("Found sandpack block (div wrapper):", match);
            // Extract language from class attribute if present
            const langMatch = match.match(/class="[^"]*language-(\w+)[^"]*"/);
            const language = langMatch ? langMatch[1] : "react";

            // Decode HTML entities in code content
            const decodedContent = content
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'");

            return `<Sandpack template="${language}">\n${decodedContent}\n</Sandpack>\n`;
        }
    );

    // Pattern 2: Direct sandpack pre tag
    mdx = mdx.replace(
        /<pre[^>]*class="[^"]*sandpack[^"]*"[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
        (match, content) => {
            console.log("Found sandpack block (direct pre):", match);
            // Extract language from class attribute if present
            const langMatch = match.match(/class="[^"]*language-(\w+)[^"]*"/);
            const language = langMatch ? langMatch[1] : "react";

            // Decode HTML entities in code content
            const decodedContent = content
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'");

            return `<Sandpack template="${language}">\n${decodedContent}\n</Sandpack>\n`;
        }
    );

    // Pattern 3: Markdown-style sandpack blocks (```jsx live react)
    mdx = mdx.replace(
        /```(\w+)\s+live\s+(\w+)\n([\s\S]*?)```/g,
        (match, language, template, content) => {
            console.log("Found sandpack block (markdown):", match);
            // Use base64 encoding to avoid escaping issues
            const encodedContent = Buffer.from(content.trim()).toString(
                "base64"
            );
            return `<SandpackRenderer template="${template}" data-code="${encodedContent}" />`;
        }
    );

    // Pattern 3b: More flexible markdown sandpack pattern
    mdx = mdx.replace(
        /```jsx\s+live\s+react\n([\s\S]*?)```/g,
        (match, content) => {
            console.log("Found sandpack block (jsx live react):", match);
            // Use base64 encoding to avoid escaping issues
            const encodedContent = Buffer.from(content.trim()).toString(
                "base64"
            );
            return `<SandpackRenderer template="react" data-code="${encodedContent}" />`;
        }
    );

    // Pattern 3c: Even more flexible - handle any spacing
    mdx = mdx.replace(
        /```jsx\s+live\s+react\s*\n([\s\S]*?)```/g,
        (match, content) => {
            console.log("Found sandpack block (flexible):", match);
            // Use base64 encoding to avoid escaping issues
            const encodedContent = Buffer.from(content.trim()).toString(
                "base64"
            );
            return `<SandpackRenderer template="react" data-code="${encodedContent}" />`;
        }
    );

    // Debug: Check if we have any sandpack patterns left
    if (mdx.includes("```jsx live react")) {
        console.log(
            "Still contains sandpack pattern after conversion attempts"
        );
    }

    // Pattern 4: Fallback - any code block that looks like React/JSX
    mdx = mdx.replace(
        /```(jsx?|react)\n([\s\S]*?)```/g,
        (match, language, content) => {
            // Check if it looks like a React component
            if (
                content.includes("export default") ||
                content.includes("function") ||
                content.includes("return (")
            ) {
                console.log(
                    "Found React-like code block, converting to sandpack:",
                    match
                );
                return `<Sandpack template="react">\n${content.trim()}\n</Sandpack>\n`;
            }
            return match; // Keep as regular code block if not React-like
        }
    );

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

    // Convert directive syntax to JSX components
    mdx = mdx.replace(
        /:::(\w+)\s*\n([\s\S]*?)\n:::/g,
        (match, type, content) => {
            const trimmedContent = content.trim();
            return `<Admonition type="${type}">${trimmedContent}</Admonition>`;
        }
    );

    // Also try single-line pattern
    mdx = mdx.replace(/:::(\w+)\s+([^:]+):::/g, (match, type, content) => {
        const trimmedContent = content.trim();
        return `<Admonition type="${type}">${trimmedContent}</Admonition>`;
    });

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
        Sandpack: (props: any) => <SandpackRenderer {...props} />,
        SandpackRenderer: (props: any) => <SandpackRenderer {...props} />,
        DebugContent: (props: any) => <DebugContent {...props} />,
        mark: (props: any) => <Highlight {...props} />,
        // Admonition components
        Admonition: (props: any) => <Admonition {...props} />,
        admonition: (props: any) => <Admonition {...props} />,
        admonitionNote: (props: any) => <Admonition {...props} type="note" />,
        admonitionTip: (props: any) => <Admonition {...props} type="tip" />,
        admonitionWarning: (props: any) => (
            <Admonition {...props} type="warning" />
        ),
        admonitionDanger: (props: any) => (
            <Admonition {...props} type="danger" />
        ),
        admonitionInfo: (props: any) => <Admonition {...props} type="info" />,
        admonitionCaution: (props: any) => (
            <Admonition {...props} type="caution" />
        ),
        // Directive components for ::: syntax
        directive: (props: any) => {
            const { name, children } = props;
            if (
                name === "note" ||
                name === "tip" ||
                name === "warning" ||
                name === "danger" ||
                name === "info" ||
                name === "caution"
            ) {
                return <Admonition type={name}>{children}</Admonition>;
            }
            return <div className="directive">{children}</div>;
        },
        input: (props: any) => {
            if (props.type === "checkbox") {
                return <Checkbox checked={props.checked} {...props} />;
            }
            return <input {...props} />;
        },
        // MDX Table components
        table: (props: any) => <MDXTable {...props} />,
        thead: (props: any) => <MDXTableHead {...props} />,
        tbody: (props: any) => <MDXTableBody {...props} />,
        tr: (props: any) => <MDXTableRow {...props} />,
        th: (props: any) => <MDXTableCell {...props} isHeader={true} />,
        td: (props: any) => <MDXTableCell {...props} isHeader={false} />,
        // Handle markdown checkbox syntax
        li: (props: any) => {
            const children = props.children;

            // Handle string children (markdown checkbox syntax)
            if (typeof children === "string") {
                // Check for markdown checkbox syntax: - [x] or - [ ]
                const checkboxMatch = children.match(
                    /^(\s*)\[([ x])\]\s*(.*)$/
                );
                if (checkboxMatch) {
                    const [, indent, checked, text] = checkboxMatch;
                    return (
                        <li className="flex items-start space-x-1 my-1">
                            <input
                                type="checkbox"
                                checked={checked === "x"}
                                readOnly
                                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-900 dark:text-gray-100">
                                {text}
                            </span>
                        </li>
                    );
                }
            }

            // Handle React element children (HTML checkbox input)
            if (React.isValidElement(children)) {
                const childProps = children.props as any;
                if (childProps?.type === "checkbox") {
                    return (
                        <li className="flex items-start space-x-1 my-1">
                            <input
                                type="checkbox"
                                checked={childProps.checked}
                                readOnly
                                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-900 dark:text-gray-100">
                                {childProps.children || ""}
                            </span>
                        </li>
                    );
                }
            }

            // Handle array of children (mixed content)
            if (Array.isArray(children)) {
                // Check if any child is a checkbox input
                const checkboxChild = children.find(
                    (child) =>
                        React.isValidElement(child) &&
                        (child.props as any)?.type === "checkbox"
                );

                if (checkboxChild) {
                    const textChildren = children
                        .filter(
                            (child) => typeof child === "string" && child.trim()
                        )
                        .join(" ");

                    return (
                        <li className="flex items-start space-x-1 my-1">
                            <input
                                type="checkbox"
                                checked={(checkboxChild.props as any).checked}
                                readOnly
                                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-900 dark:text-gray-100">
                                {textChildren}
                            </span>
                        </li>
                    );
                }
            }

            // Default list item rendering
            return <li {...props} />;
        },
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
                    <article className="prose max-w-[650px] mx-auto [&_.contains-task-list]:pl-0 [&_.contains-task-list]:list-none [&_.contains-task-list_li]:list-none">
                        <DebugContent content={post.content || ""} />
                        <MDXRemote
                            source={prepareContentForMdx(post.content || "")}
                            components={components}
                            options={{
                                mdxOptions: {
                                    remarkPlugins: [remarkGfm, remarkDirective],
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
