"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MDXEditorComponent } from "./MDXEditorComponent";
import { Save, Upload, X, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminCards } from "@/components/admin-cards";
import { AnalyticsChart } from "./analytics-chart";
import { PageViewsChart } from "./page-views-chart";
import { UsersDataTable } from "./UsersDataTable";
import { PostsDataTable } from "./PostsDataTable";
import { type Article } from "@/data/blog-client";
import { useAdminDashboard } from "@/components/providers/admin-dashboard-provider";

interface AdminDashboardClientProps {
    stats: {
        totalUsers: number;
        adminUsers: number;
        regularUsers: number;
        publishedPosts: number;
        totalPosts: number;
        draftPosts: number;
    };
    analytics: {
        uniqueVisitors: number;
        pageViews: number;
        sessions: number;
        bounceRate: number;
        uniqueVisitorsGrowth: number;
    };
    allUsers: any[];
    allPosts: Article[];
}

type ViewType = "overview" | "create-post" | "edit-post";

export function AdminDashboardClient({
    stats,
    analytics,
    allUsers,
    allPosts,
}: AdminDashboardClientProps) {
    const router = useRouter();
    const {
        currentView,
        setCurrentView,
        editingPost,
        setEditingPost,
        openEditPost,
        closeForms,
    } = useAdminDashboard();

    // Effect to populate form when editing a post
    useEffect(() => {
        if (editingPost && currentView === "edit-post") {
            setTitle(editingPost.title || "");
            setSlug(editingPost.slug || "");
            setIsSlugManuallyEdited(true);
            setSummary(editingPost.summary || "");
            setContent(editingPost.content || "");
            setTags(editingPost.tags || []);
            setTagInput("");
            setImage(null);
            setImagePreview(editingPost.image || null);
            setImageUrl(editingPost.image || null);
            setSlugError(null);
        }
    }, [editingPost, currentView]);

    // Form states for create post
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slugError, setSlugError] = useState<string | null>(null);

    // Function to generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
    };

    // Handle title change and auto-generate slug
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        // Only auto-generate slug if it hasn't been manually edited
        if (!isSlugManuallyEdited) {
            setSlug(generateSlug(newTitle));
        }
    };

    // Handle slug change
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSlug = e.target.value;
        setSlug(newSlug);
        setIsSlugManuallyEdited(true);
        setSlugError(null); // Clear any existing error when user types
    };

    // Function to check if slug already exists
    const checkSlugExists = async (slugToCheck: string): Promise<boolean> => {
        try {
            const response = await fetch(
                `/api/admin/check-slug?slug=${encodeURIComponent(slugToCheck)}`
            );
            if (!response.ok) {
                throw new Error("Failed to check slug");
            }
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error("Error checking slug:", error);
            return false; // Assume it doesn't exist if check fails
        }
    };

    // Handle tag input
    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    // Add tag
    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
            setTags([...tags, trimmedTag]);
            setTagInput("");
        }
    };

    // Remove tag
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // Handle tag input key press
    const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        }
    };

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    // Upload image to Supabase
    const uploadImage = async () => {
        if (!image) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", image);

            const response = await fetch("/api/upload-blog-image", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setImageUrl(data.url);
            return data.url;
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image. Please try again.");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // Remove image
    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        setImageUrl(null);
    };

    // Reset form
    const resetForm = () => {
        setTitle("");
        setSlug("");
        setIsSlugManuallyEdited(false);
        setSummary("");
        setContent("");
        setTags([]);
        setTagInput("");
        setImage(null);
        setImagePreview(null);
        setImageUrl(null);
        setSlugError(null);
    };

    // Handle create post submission
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if slug already exists
        if (slug.trim()) {
            const slugExists = await checkSlugExists(slug.trim());
            if (slugExists) {
                setSlugError(
                    "This slug already exists. Please choose a different one."
                );
                return;
            }
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = imageUrl;

            // Upload image if one is selected but not yet uploaded
            if (image && !imageUrl) {
                finalImageUrl = await uploadImage();
                if (!finalImageUrl) {
                    setIsSubmitting(false);
                    return; // Stop if upload failed
                }
            }

            // Create the post
            const response = await fetch("/api/admin/create-post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    slug,
                    summary: summary || null,
                    content: content || null,
                    tags: tags.length > 0 ? tags : null,
                    image: finalImageUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create post");
            }

            toast.success("Post created successfully!");
            resetForm();
            closeForms();

            // Refresh the page to update the posts list
            router.refresh();
        } catch (error) {
            console.error("Error creating post:", error);
            toast.error("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle update post submission
    const handleUpdatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingPost) return;

        // Check if slug already exists (excluding current post)
        if (slug.trim() && slug.trim() !== editingPost.slug) {
            const slugExists = await checkSlugExists(slug.trim());
            if (slugExists) {
                setSlugError(
                    "This slug already exists. Please choose a different one."
                );
                return;
            }
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = imageUrl;

            // Upload image if one is selected but not yet uploaded
            if (image && !imageUrl) {
                finalImageUrl = await uploadImage();
                if (!finalImageUrl) {
                    setIsSubmitting(false);
                    return; // Stop if upload failed
                }
            }

            // Update the post
            const response = await fetch(
                `/api/admin/update-post/${editingPost.slug}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        slug,
                        summary: summary || null,
                        content: content || null,
                        tags: tags.length > 0 ? tags : null,
                        image: finalImageUrl,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update post");
            }

            const data = await response.json();
            if (data.success) {
                toast.success("Post updated successfully!");
                resetForm();
                closeForms();

                // Refresh the page to update the posts list
                router.refresh();
            } else {
                throw new Error(data.error || "Failed to update post");
            }
        } catch (error) {
            console.error("Error updating post:", error);
            toast.error("Failed to update post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderOverview = () => (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        Dashboard Overview
                    </h2>
                </div>
            </div>
            <AdminCards stats={stats} analytics={analytics} />
            <div className="px-4 lg:px-6">
                <AnalyticsChart />
            </div>
            <div className="px-4 lg:px-6">
                <PageViewsChart />
            </div>
            <div className="px-4 lg:px-6">
                <UsersDataTable data={allUsers} />
            </div>
            <div className="px-4 lg:px-6">
                <PostsDataTable data={allPosts} />
            </div>
        </div>
    );

    const renderCreatePostForm = () => (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create New Post
                        </h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Post Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreatePost} className="space-y-6">
                            {/* Title Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="title"
                                    className="text-sm font-medium"
                                >
                                    Title{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Enter post title..."
                                    className="w-full"
                                    required
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    The title will be displayed as the main
                                    heading of your post.
                                </p>
                            </div>

                            {/* Slug Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="slug"
                                    className="text-sm font-medium"
                                >
                                    Slug <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    type="text"
                                    value={slug}
                                    onChange={handleSlugChange}
                                    placeholder="post-url-slug"
                                    className={`w-full ${
                                        slugError
                                            ? "border-red-500 focus:border-red-500"
                                            : ""
                                    }`}
                                    required
                                />
                                {slugError && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {slugError}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    The URL-friendly version of the title. This
                                    will be used in the post URL.
                                </p>
                            </div>

                            {/* Summary Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="summary"
                                    className="text-sm font-medium"
                                >
                                    Summary
                                </Label>
                                <textarea
                                    id="summary"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Enter a brief summary of your post..."
                                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                    maxLength={250}
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                        Optional: Brief description of your post
                                    </span>
                                    <span>{summary.length}/250</span>
                                </div>
                            </div>

                            {/* Tags Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="tags"
                                    className="text-sm font-medium"
                                >
                                    Tags
                                </Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            id="tags"
                                            type="text"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                            onKeyPress={handleTagKeyPress}
                                            placeholder="Enter a tag and press Enter or comma..."
                                            className="flex-1"
                                            disabled={tags.length >= 5}
                                        />
                                        <Button
                                            type="button"
                                            onClick={addTag}
                                            disabled={
                                                !tagInput.trim() ||
                                                tags.includes(
                                                    tagInput.trim()
                                                ) ||
                                                tags.length >= 5
                                            }
                                            variant="outline"
                                            size="sm"
                                            className="hover:cursor-pointer"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeTag(tag)
                                                        }
                                                        className="ml-1 hover:cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Optional: Add up to 5 tags to categorize
                                        your post ({tags.length}/5)
                                    </p>
                                </div>
                            </div>

                            {/* Image Upload Field */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Featured Image
                                </Label>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "image-upload"
                                                    )
                                                    ?.click()
                                            }
                                            className="flex items-center space-x-2 hover:cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span>Choose Image</span>
                                        </Button>
                                    </div>

                                    {/* Image Preview */}
                                    {(imagePreview || imageUrl) && (
                                        <div className="relative">
                                            <div className="relative w-full sm:w-[200px] h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                                <Image
                                                    src={
                                                        imageUrl ||
                                                        imagePreview ||
                                                        ""
                                                    }
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors hover:cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Optional: Upload a featured image for
                                        your post (JPEG, PNG, WebP, max 5MB)
                                    </p>
                                </div>
                            </div>

                            {/* Content Field */}
                            <MDXEditorComponent
                                key="create-post"
                                content={content}
                                onChange={setContent}
                                placeholder="Write your blog post content here..."
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t">
                                <div className="flex space-x-3">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-green-600 hover:bg-green-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSubmitting
                                            ? "Creating..."
                                            : "Create Post"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderEditPostForm = () => (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Post
                        </h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit Post Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePost} className="space-y-6">
                            {/* Title Field */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Title{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Enter post title..."
                                    className="w-full"
                                    required
                                />
                            </div>

                            {/* Slug Field */}
                            <div className="space-y-2">
                                <Label htmlFor="slug">
                                    Slug <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    type="text"
                                    value={slug}
                                    onChange={handleSlugChange}
                                    placeholder="post-url-slug"
                                    className={`w-full ${
                                        slugError
                                            ? "border-red-500 focus:border-red-500"
                                            : ""
                                    }`}
                                    required
                                />
                                {slugError && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {slugError}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    The URL-friendly version of the title. This
                                    will be used in the post URL.
                                </p>
                            </div>

                            {/* Summary Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="summary"
                                    className="text-sm font-medium"
                                >
                                    Summary
                                </Label>
                                <textarea
                                    id="summary"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Enter a brief summary of your post..."
                                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                    maxLength={250}
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                        Optional: Brief description of your post
                                    </span>
                                    <span>{summary.length}/250</span>
                                </div>
                            </div>

                            {/* Tags Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="tags"
                                    className="text-sm font-medium"
                                >
                                    Tags
                                </Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            id="tags"
                                            type="text"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                            onKeyPress={handleTagKeyPress}
                                            placeholder="Enter a tag and press Enter or comma..."
                                            className="flex-1"
                                            disabled={tags.length >= 5}
                                        />
                                        <Button
                                            type="button"
                                            onClick={addTag}
                                            disabled={
                                                !tagInput.trim() ||
                                                tags.includes(
                                                    tagInput.trim()
                                                ) ||
                                                tags.length >= 5
                                            }
                                            variant="outline"
                                            size="sm"
                                            className="hover:cursor-pointer"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeTag(tag)
                                                        }
                                                        className="ml-1 hover:cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Optional: Add up to 5 tags to categorize
                                        your post ({tags.length}/5)
                                    </p>
                                </div>
                            </div>

                            {/* Image Upload Field */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Featured Image
                                </Label>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            id="image-upload-edit"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "image-upload-edit"
                                                    )
                                                    ?.click()
                                            }
                                            className="flex items-center space-x-2 hover:cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span>Choose Image</span>
                                        </Button>
                                    </div>

                                    {/* Image Preview */}
                                    {(imagePreview || imageUrl) && (
                                        <div className="relative">
                                            <div className="relative w-full sm:w-[200px] h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                                <Image
                                                    src={
                                                        imageUrl ||
                                                        imagePreview ||
                                                        ""
                                                    }
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors hover:cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Optional: Upload a featured image for
                                        your post (JPEG, PNG, WebP, max 5MB)
                                    </p>
                                </div>
                            </div>

                            {/* Content Field */}
                            <MDXEditorComponent
                                key={editingPost?.id || "edit-post"}
                                content={content}
                                onChange={setContent}
                                placeholder="Write your blog post content here..."
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Last updated:{" "}
                                    {editingPost &&
                                        new Date(
                                            editingPost.updatedAt ||
                                                editingPost.createdAt
                                        ).toLocaleDateString()}
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            closeForms();
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || isUploading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Save className="w-4 h-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Update Post
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            {currentView === "overview" && renderOverview()}
            {currentView === "create-post" && renderCreatePostForm()}
            {currentView === "edit-post" && renderEditPostForm()}
        </div>
    );
}
