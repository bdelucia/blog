"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/db/articles/functions";
import { BLOG_IMGS_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Eye,
    Edit,
    Trash2,
    Calendar,
    Clock,
    Globe,
    Lock,
    MoreVertical,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Header } from "../shared/Header";
import { ArrowLeft, Plus } from "lucide-react";

interface AdminPostsListProps {
    posts: Article[];
}

export function AdminPostsList({ posts }: AdminPostsListProps) {
    const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

    const filteredPosts = posts.filter((post) => {
        if (filter === "all") return true;
        return post.status === filter;
    });

    const publishedCount = posts.filter((p) => p.status === "published").length;
    const draftCount = posts.filter((p) => p.status === "draft").length;

    return (
        <div className="flex flex-col h-screen">
            <Header scrollProgress={false} showSignIn={false} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        {/* Page Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Link href="/admin">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="hover:cursor-pointer"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Dashboard
                                        </Button>
                                    </Link>
                                </div>
                                <Link href="/admin/posts/new-post">
                                    <Button className="bg-green-600 hover:bg-green-700 hover:cursor-pointer">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Post
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Filter Tabs */}
                            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                                        filter === "all"
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                >
                                    All ({posts.length})
                                </button>
                                <button
                                    onClick={() => setFilter("published")}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                                        filter === "published"
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                >
                                    Published ({publishedCount})
                                </button>
                                <button
                                    onClick={() => setFilter("draft")}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                                        filter === "draft"
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                >
                                    Drafts ({draftCount})
                                </button>
                            </div>

                            {/* Posts Grid */}
                            {filteredPosts.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <Globe className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No posts found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {filter === "all"
                                            ? "Get started by creating your first post."
                                            : `No ${filter} posts found.`}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {filteredPosts.map((post) => (
                                        <Card
                                            key={post.id}
                                            className="overflow-hidden"
                                        >
                                            <CardContent className="p-0">
                                                <div className="post-container">
                                                    {/* Post Image */}
                                                    <div className="image-container w-full h-32 relative">
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
                                                                fill
                                                                className="object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                                <Globe className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Post Content */}
                                                    <div className="flex-1 p-4 sm:p-6">
                                                        <div className="action-container">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                                        {
                                                                            post.title
                                                                        }
                                                                    </h3>
                                                                    <Badge
                                                                        variant={
                                                                            post.status ===
                                                                            "published"
                                                                                ? "default"
                                                                                : "secondary"
                                                                        }
                                                                        className="flex-shrink-0"
                                                                    >
                                                                        {post.status ===
                                                                        "published" ? (
                                                                            <>
                                                                                <Globe className="w-3 h-3 mr-1" />
                                                                                Published
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Lock className="w-3 h-3 mr-1" />
                                                                                Draft
                                                                            </>
                                                                        )}
                                                                    </Badge>
                                                                </div>

                                                                {/* Tags */}
                                                                {post.tags &&
                                                                    post.tags
                                                                        .length >
                                                                        0 && (
                                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                                            {post.tags.map(
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
                                                                        </div>
                                                                    )}

                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                                    {post.summary ||
                                                                        "No summary available"}
                                                                </p>

                                                                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                                    <div className="flex items-center">
                                                                        <Calendar className="w-3 h-3 mr-1" />
                                                                        Date
                                                                        Posted:{" "}
                                                                        {post.datePosted
                                                                            ? new Date(
                                                                                  post.datePosted
                                                                              ).toLocaleDateString()
                                                                            : "Not published"}
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        Created
                                                                        at:{" "}
                                                                        {new Date(
                                                                            post.createdAt
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        Updated
                                                                        at:{" "}
                                                                        {new Date(
                                                                            post.updatedAt
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                    <div className="text-gray-300 dark:text-gray-600">
                                                                        •
                                                                    </div>
                                                                    <div>
                                                                        Slug:{" "}
                                                                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                                                            {
                                                                                post.slug
                                                                            }
                                                                        </code>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="actions-wrapper">
                                                                <Link
                                                                    href={`/${post.slug}`}
                                                                    target="_blank"
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="hover:cursor-pointer"
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-1" />
                                                                        View
                                                                    </Button>
                                                                </Link>

                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="hover:cursor-pointer"
                                                                        >
                                                                            <MoreVertical className="w-4 h-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem className="hover:cursor-pointer">
                                                                            <Edit className="w-4 h-4 mr-2" />
                                                                            Edit
                                                                            Post
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600 hover:cursor-pointer">
                                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                                            Delete
                                                                            Post
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
