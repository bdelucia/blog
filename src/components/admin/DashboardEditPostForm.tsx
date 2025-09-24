"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { MDXEditorComponent } from "./MDXEditorComponent";
import { Article } from "@/db/articles/functions";

interface DashboardEditPostFormProps {
    post: Article;
}

export function DashboardEditPostForm({ post }: DashboardEditPostFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(post.title || "");
    const [slug, setSlug] = useState(post.slug || "");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(true); // Start as true since we're editing
    const [summary, setSummary] = useState(post.summary || "");
    const [content, setContent] = useState(post.content || "");
    const [tags, setTags] = useState<string[]>(post.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        post.image || null
    );
    const [imageUrl, setImageUrl] = useState<string | null>(post.image || null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slugError, setSlugError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const slugInputRef = useRef<HTMLInputElement>(null);

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

    // Function to check if slug already exists (excluding current post)
    const checkSlugExists = async (slugToCheck: string): Promise<boolean> => {
        try {
            const response = await fetch(
                `/api/admin/check-slug?slug=${encodeURIComponent(
                    slugToCheck
                )}&exclude=${post.slug}`
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

    // Handle tag input key press
    const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        }
    };

    // Add tag
    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setTagInput("");
        }
    };

    // Remove tag
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // Handle image upload
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload image function
    const uploadImage = async (): Promise<string | null> => {
        if (!image) return null;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", image);

        try {
            const response = await fetch("/api/upload-blog-image", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ error: "Unknown error" }));
                console.error("Upload failed:", errorData);
                throw new Error(
                    errorData.error ||
                        `Upload failed with status ${response.status}`
                );
            }

            const data = await response.json();
            setImageUrl(data.url);
            return data.url;
        } catch (error) {
            console.error("Error uploading image:", error);
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if slug already exists (excluding current post)
        if (slug.trim() && slug.trim() !== post.slug) {
            const slugExists = await checkSlugExists(slug.trim());
            if (slugExists) {
                setSlugError(
                    "This slug already exists. Please choose a different one."
                );
                slugInputRef.current?.focus();
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
                `/api/admin/update-post/${post.slug}`,
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
                router.push("/admin");
            } else {
                throw new Error(data.error || "Failed to update post");
            }
        } catch (error) {
            console.error("Error updating post:", error);
            alert("Failed to update post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/admin")}
                        className="hover:cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
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
                                ref={slugInputRef}
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
                                The URL-friendly version of the title. This will
                                be used in the post URL.
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
                                className="w-full min-h-[100px] px-3 py-1 border border-input rounded-md bg-transparent dark:bg-input/30 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-vertical"
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
                                            tags.includes(tagInput.trim()) ||
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
                                {/* File Input */}
                                <div className="flex items-center space-x-4">
                                    <input
                                        ref={fileInputRef}
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
                                            fileInputRef.current?.click()
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
                                            <img
                                                src={
                                                    imageUrl ||
                                                    imagePreview ||
                                                    ""
                                                }
                                                alt="Preview"
                                                className="w-full h-full object-cover"
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
                                    Optional: Upload a featured image for your
                                    post (JPEG, PNG, WebP, max 5MB)
                                </p>
                            </div>
                        </div>

                        {/* Content Field */}
                        <MDXEditorComponent
                            content={content}
                            onChange={setContent}
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Last updated:{" "}
                                {new Date(
                                    post.updatedAt || post.createdAt
                                ).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/admin")}
                                    className="cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isUploading}
                                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
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
    );
}
