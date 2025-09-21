"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "./Avatar";
import { X, Upload, User, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        fullName: string | null;
        avatarUrl: string | null;
        email: string;
    };
    onUpdate: (data: { fullName: string; avatarUrl?: string | null }) => void;
}

export function ProfileModal({
    isOpen,
    onClose,
    user,
    onUpdate,
}: ProfileModalProps) {
    const [fullName, setFullName] = useState(user.fullName || "");
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Update form when user prop changes
    useEffect(() => {
        setFullName(user.fullName || "");
        setAvatarUrl(user.avatarUrl || "");
        setSelectedFile(null);
        setPreviewUrl(null);
        setHasChanges(false);
    }, [user]);

    // Track changes to form fields
    useEffect(() => {
        const nameChanged = fullName !== (user.fullName || "");
        const avatarChanged = selectedFile !== null || previewUrl !== null;
        setHasChanges(nameChanged || avatarChanged);
    }, [fullName, selectedFile, previewUrl, user.fullName]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
                "image/gif",
                "image/svg+xml",
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    "Please select a valid image file (JPG, PNG, WebP, GIF, or SVG)"
                );
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast.error("File size must be less than 5MB");
                return;
            }

            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate form data
            if (!fullName.trim()) {
                toast.error("Full name is required");
                return;
            }

            let newAvatarUrl = avatarUrl;

            // Upload file if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);

                // Get the current session token for authorization
                const supabase = (
                    await import("@/utils/supabase/client")
                ).createClient();
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    throw new Error("No valid session found");
                }

                const response = await fetch("/api/upload-profile-picture", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error || "Failed to upload image"
                    );
                }

                const uploadData = await response.json();
                newAvatarUrl = uploadData.url;
            }

            await onUpdate({
                fullName: fullName.trim(),
                avatarUrl: newAvatarUrl,
            });
            toast.success("Profile updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isValidUrl = (string: string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleDeleteAvatar = async () => {
        if (!user.avatarUrl) return;

        // Show confirmation dialog
        if (
            !confirm(
                "Are you sure you want to delete your profile picture? This action cannot be undone."
            )
        ) {
            return;
        }

        setIsLoading(true);
        try {
            // Update the user's avatar_url to null in the database
            await onUpdate({
                fullName: fullName.trim(),
                avatarUrl: null,
            });
            // Reset form state after successful deletion
            setSelectedFile(null);
            setPreviewUrl(null);
            setHasChanges(false);
            toast.success("Profile picture deleted successfully!");
            // Don't close the modal - let user continue editing
        } catch (error) {
            console.error("Error deleting profile picture:", error);
            toast.error("Failed to delete profile picture. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal */}
            <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-md my-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold">Edit Profile</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar
                            src={previewUrl || avatarUrl || undefined}
                            alt={fullName || "User avatar"}
                            size="lg"
                            className="w-20 h-20"
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center space-x-3">
                            {/* Change Button */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2 cursor-pointer"
                                onClick={() =>
                                    document
                                        .getElementById("avatarFile")
                                        ?.click()
                                }
                                disabled={isLoading}
                            >
                                <Edit3 className="h-4 w-4" />
                                <span>Change</span>
                            </Button>

                            {/* Delete Button - only show if user has a profile picture */}
                            {user.avatarUrl && !previewUrl && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={handleDeleteAvatar}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                </Button>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                {previewUrl
                                    ? "New profile picture"
                                    : user.avatarUrl
                                    ? "Current profile picture"
                                    : "No profile picture"}
                            </p>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Hidden file input for pencil icon */}
                    <Input
                        id="avatarFile"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={handleFileSelect}
                        disabled={isLoading}
                        className="hidden"
                    />

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isLoading || !fullName.trim() || !hasChanges
                            }
                            className="cursor-pointer"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
