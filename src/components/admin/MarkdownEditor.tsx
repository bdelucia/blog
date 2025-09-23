"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import sql from "highlight.js/lib/languages/sql";
import shell from "highlight.js/lib/languages/shell";
import yaml from "highlight.js/lib/languages/yaml";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Code,
    Link as LinkIcon,
    Image as ImageIcon,
    Minus,
    Table as TableIcon,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Type,
    ChevronDown,
} from "lucide-react";

interface MarkdownEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function MarkdownEditor({
    content,
    onChange,
    placeholder = "Write your content here...",
}: MarkdownEditorProps) {
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [imageCaption, setImageCaption] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        editorProps: {
            attributes: {
                className:
                    "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
                style: "line-height: 1.6;",
            },
        },
        extensions: [
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
                codeBlock: false,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Underline,
            BulletList,
            OrderedList,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            HorizontalRule,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    className: "text-blue-600 underline cursor-pointer",
                },
            }),
            Image.configure({
                HTMLAttributes: {},
            }),
            CodeBlockLowlight.configure({
                lowlight: createLowlight({
                    javascript,
                    typescript,
                    python,
                    cpp,
                    java,
                    html,
                    css,
                    json,
                    sql,
                    shell,
                    yaml,
                }),
                HTMLAttributes: {
                    className: "hljs",
                },
                defaultLanguage: "javascript",
            }),
        ],
        content: content || "<p></p>",
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
    });

    if (!editor) {
        return null;
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImageToR2 = async (): Promise<string | null> => {
        if (!imageFile) return null;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", imageFile);

        try {
            const response = await fetch("/api/upload-r2-image", {
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
            return data.url;
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageInsert = async () => {
        if (!imageAlt.trim()) {
            alert("Please provide alt text for the image.");
            return;
        }

        let finalImageSrc = imageSrc;

        // If a file is selected, upload it first
        if (imageFile) {
            const uploadedUrl = await uploadImageToR2();
            if (!uploadedUrl) {
                alert("Failed to upload image. Please try again.");
                return;
            }
            finalImageSrc = uploadedUrl;
        } else if (!imageSrc.trim()) {
            alert(
                "Please provide either an image URL or select a file to upload."
            );
            return;
        }

        // Insert image using TipTap's insertContent with minimal attributes
        editor.commands.insertContent(
            `<img src="${finalImageSrc}" alt="${imageAlt}" />`
        );

        // Add caption if present
        if (imageCaption.trim()) {
            editor.commands.insertContent(
                `<p className="text-center text-sm text-gray-600 dark:text-gray-400 italic mt-2">${imageCaption}</p>`
            );
        }

        // Reset form and close dialog
        setImageSrc("");
        setImageAlt("");
        setImageCaption("");
        setImageFile(null);
        setImagePreview(null);
        setIsImageDialogOpen(false);
    };

    const ToolbarButton = ({
        onClick,
        isActive,
        children,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <Button
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className="h-8 w-8 p-0 hover:cursor-pointer"
            title={title}
        >
            {children}
        </Button>
    );

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">
                Content <span className="text-red-500">*</span>
            </Label>

            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                {/* Toolbar */}
                <div className="border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-800">
                    {/* Text Styles */}
                    <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().setParagraph().run()
                            }
                            isActive={editor.isActive("paragraph")}
                            title="Paragraph"
                        >
                            <Type className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 1 })
                                    .run()
                            }
                            isActive={editor.isActive("heading", { level: 1 })}
                            title="Heading 1"
                        >
                            <Heading1 className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run()
                            }
                            isActive={editor.isActive("heading", { level: 2 })}
                            title="Heading 2"
                        >
                            <Heading2 className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                            isActive={editor.isActive("heading", { level: 3 })}
                            title="Heading 3"
                        >
                            <Heading3 className="w-4 h-4" />
                        </ToolbarButton>
                    </div>

                    {/* Text Formatting */}
                    <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleBold().run()
                            }
                            isActive={editor.isActive("bold")}
                            title="Bold"
                        >
                            <Bold className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleItalic().run()
                            }
                            isActive={editor.isActive("italic")}
                            title="Italic"
                        >
                            <Italic className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleUnderline().run()
                            }
                            isActive={editor.isActive("underline")}
                            title="Underline"
                        >
                            <UnderlineIcon className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleStrike().run()
                            }
                            isActive={editor.isActive("strike")}
                            title="Strikethrough"
                        >
                            <Strikethrough className="w-4 h-4" />
                        </ToolbarButton>
                    </div>

                    {/* Lists */}
                    <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleBulletList().run()
                            }
                            isActive={editor.isActive("bulletList")}
                            title="Bullet List"
                        >
                            <List className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleOrderedList().run()
                            }
                            isActive={editor.isActive("orderedList")}
                            title="Numbered List"
                        >
                            <ListOrdered className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleTaskList().run()
                            }
                            isActive={editor.isActive("taskList")}
                            title="Task List"
                        >
                            <CheckSquare className="w-4 h-4" />
                        </ToolbarButton>
                    </div>

                    {/* Other Elements */}
                    <div className="flex gap-1">
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleBlockquote().run()
                            }
                            isActive={editor.isActive("blockquote")}
                            title="Quote"
                        >
                            <Quote className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().toggleCodeBlock().run()
                            }
                            isActive={editor.isActive("codeBlock")}
                            title="Code Block"
                        >
                            <Code className="w-4 h-4" />
                        </ToolbarButton>

                        {/* Language Selector */}
                        <div className="relative">
                            <select
                                onChange={(e) => {
                                    const language = e.target.value;
                                    if (language) {
                                        if (editor.isActive("codeBlock")) {
                                            // Update existing code block language
                                            editor.commands.updateAttributes(
                                                "codeBlock",
                                                { language }
                                            );
                                        } else {
                                            // Create new code block with language
                                            editor.commands.setCodeBlock({
                                                language,
                                            });
                                        }
                                    }
                                }}
                                className="h-8 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                defaultValue=""
                            >
                                <option value="">Language</option>
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="json">JSON</option>
                                <option value="sql">SQL</option>
                                <option value="shell">Shell</option>
                                <option value="yaml">YAML</option>
                            </select>
                        </div>
                        <ToolbarButton
                            onClick={() =>
                                editor.chain().focus().setHorizontalRule().run()
                            }
                            title="Horizontal Rule"
                        >
                            <Minus className="w-4 h-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            onClick={() => {
                                const url = window.prompt("Enter the URL:");
                                if (url) {
                                    editor
                                        .chain()
                                        .focus()
                                        .setLink({ href: url })
                                        .run();
                                }
                            }}
                            isActive={editor.isActive("link")}
                            title="Link"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </ToolbarButton>
                        <Dialog
                            open={isImageDialogOpen}
                            onOpenChange={setIsImageDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:cursor-pointer"
                                    title="Insert Image"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Insert Image</DialogTitle>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    {/* Image URL/Upload Field */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">
                                            Image
                                        </Label>
                                        <div className="col-span-3 flex gap-2">
                                            <Input
                                                id="image-src"
                                                value={imageSrc}
                                                onChange={(e) =>
                                                    setImageSrc(e.target.value)
                                                }
                                                className="flex-1"
                                                placeholder="Enter image URL..."
                                            />
                                            <span className="flex items-center text-gray-500 dark:text-gray-400">
                                                -- OR --
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            "file-upload"
                                                        )
                                                        ?.click()
                                                }
                                                className="whitespace-nowrap"
                                            >
                                                Browse...
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Image Preview - only show after file is selected */}
                                    {imagePreview && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">
                                                Preview
                                            </Label>
                                            <div className="col-span-3">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="max-w-64 max-h-64 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Alt Text (always required) */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="image-alt"
                                            className="text-right"
                                        >
                                            Alt Text
                                        </Label>
                                        <Input
                                            id="image-alt"
                                            value={imageAlt}
                                            onChange={(e) =>
                                                setImageAlt(e.target.value)
                                            }
                                            className="col-span-3"
                                            placeholder="Describe the image..."
                                        />
                                    </div>

                                    {/* Caption (optional) */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="image-caption"
                                            className="text-right"
                                        >
                                            Caption
                                        </Label>
                                        <Input
                                            id="image-caption"
                                            value={imageCaption}
                                            onChange={(e) =>
                                                setImageCaption(e.target.value)
                                            }
                                            className="col-span-3"
                                            placeholder="Optional caption..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsImageDialogOpen(false);
                                            setImageSrc("");
                                            setImageAlt("");
                                            setImageCaption("");
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleImageInsert}
                                        disabled={
                                            isUploading ||
                                            !imageAlt.trim() ||
                                            (!imageSrc.trim() && !imageFile)
                                        }
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Uploading...
                                            </>
                                        ) : (
                                            "Insert Image"
                                        )}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Editor Content */}
                <EditorContent
                    editor={editor}
                    className="min-h-[400px]"
                    suppressHydrationWarning={true}
                />
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                    Rich text editor with WYSIWYG formatting. Click toolbar
                    buttons to apply formatting as you type.
                </span>
                <span>{content.replace(/<[^>]*>/g, "").length} characters</span>
            </div>
        </div>
    );
}
