import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Bob with a Blog",
        template: "%s | Bob with a Blog",
    },
    description:
        "A modern blog about technology, coding, and life adventures. Discover insights on software development, programming tips, and personal experiences.",
    keywords: [
        "blog",
        "technology",
        "programming",
        "software development",
        "coding",
        "web development",
        "React",
        "Next.js",
        "JavaScript",
    ],
    authors: [{ name: "Bob", url: "https://github.com/yourusername" }],
    creator: "Bob",
    publisher: "Bob with a Blog",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    alternates: {
        canonical: "/",
        types: {
            "application/rss+xml": "/feed.xml",
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        title: "Bob with a Blog",
        description:
            "A modern blog about technology, coding, and life adventures. Discover insights on software development, programming tips, and personal experiences.",
        siteName: "Bob with a Blog",
        images: [
            {
                url: "/images/og-default.jpg",
                width: 1200,
                height: 630,
                alt: "Bob with a Blog",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Bob with a Blog",
        description:
            "A modern blog about technology, coding, and life adventures. Discover insights on software development, programming tips, and personal experiences.",
        creator: "@yourusername",
        images: ["/images/og-default.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    verification: {
        google: process.env.GOOGLE_VERIFICATION_ID,
        yandex: process.env.YANDEX_VERIFICATION_ID,
        yahoo: process.env.YAHOO_VERIFICATION_ID,
    },
    icons: {
        icon: [
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon.ico", sizes: "any" },
        ],
        apple: [
            {
                url: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
        other: [
            {
                rel: "android-chrome-192x192",
                url: "/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                rel: "android-chrome-512x512",
                url: "/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/site.webmanifest" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const theme = localStorage.getItem('theme');
                                    if (theme === 'dark') {
                                        document.documentElement.classList.add('dark');
                                    } else if (theme === 'light') {
                                        document.documentElement.classList.remove('dark');
                                    } else {
                                        // Default to system preference for first-time visitors
                                        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                            document.documentElement.classList.add('dark');
                                        } else {
                                            document.documentElement.classList.remove('dark');
                                        }
                                    }
                                } catch (e) {
                                    // Fallback to system preference if localStorage fails
                                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                }
                                
                                // Prevent hydration mismatch by adding a data attribute
                                document.documentElement.setAttribute('data-theme-initialized', 'true');
                            })();
                        `,
                    }}
                />
                {process.env.NEXT_PUBLIC_GA_ID && (
                    <>
                        <script
                            async
                            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                        />
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
                                    window.dataLayer = window.dataLayer || [];
                                    function gtag(){dataLayer.push(arguments);}
                                    gtag('js', new Date());
                                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                                `,
                            }}
                        />
                    </>
                )}
                <script
                    type="application/ld+json"
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "Bob with a Blog",
                            description:
                                "A modern blog about technology, coding, and life adventures. Discover insights on software development, programming tips, and personal experiences.",
                            url:
                                process.env.NEXT_PUBLIC_SITE_URL ||
                                "http://localhost:3000",
                            author: {
                                "@type": "Person",
                                name: "Bob",
                                url:
                                    process.env.NEXT_PUBLIC_SITE_URL ||
                                    "http://localhost:3000",
                            },
                            publisher: {
                                "@type": "Organization",
                                name: "Bob with a Blog",
                                url:
                                    process.env.NEXT_PUBLIC_SITE_URL ||
                                    "http://localhost:3000",
                                logo: {
                                    "@type": "ImageObject",
                                    url: `${
                                        process.env.NEXT_PUBLIC_SITE_URL ||
                                        "http://localhost:3000"
                                    }/android-chrome-512x512.png`,
                                    width: 512,
                                    height: 512,
                                },
                            },
                            inLanguage: "en-US",
                            copyrightYear: new Date().getFullYear(),
                            potentialAction: {
                                "@type": "SearchAction",
                                target: {
                                    "@type": "EntryPoint",
                                    urlTemplate: `${
                                        process.env.NEXT_PUBLIC_SITE_URL ||
                                        "http://localhost:3000"
                                    }/search?q={search_term_string}`,
                                },
                                "query-input":
                                    "required name=search_term_string",
                            },
                        }),
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <QueryProvider>
                    <SessionProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            expand={true}
                            richColors
                            closeButton
                        />
                    </SessionProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
