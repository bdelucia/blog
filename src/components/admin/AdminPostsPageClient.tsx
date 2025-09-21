"use client";

import { useState, useEffect } from "react";
import { AdminPostsList } from "./AdminPostsList";
import { Article } from "@/db/articles/functions";

interface AdminPostsPageClientProps {
    initialPosts: Article[];
}

export function AdminPostsPageClient({
    initialPosts,
}: AdminPostsPageClientProps) {
    const [posts, setPosts] = useState<Article[]>(initialPosts);

    const handlePostDeleted = (deletedPostId: number) => {
        // Remove the deleted post from the local state
        setPosts((prevPosts) =>
            prevPosts.filter((post) => post.id !== deletedPostId)
        );
    };

    const handlePostUpdated = (updatedPost: Article) => {
        // Update the post in the local state
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === updatedPost.id ? updatedPost : post
            )
        );
    };

    return (
        <AdminPostsList
            posts={posts}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
        />
    );
}
