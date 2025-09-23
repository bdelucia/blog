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
import { Node, mergeAttributes } from "@tiptap/core";
import { createLowlight } from "lowlight";
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
} from "lucide-react";

// Custom BlogImage extension for TipTap
const BlogImageExtension = Node.create({
    name: "blogImage",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (element: HTMLElement) =>
                    element.getAttribute("src"),
                renderHTML: (attributes: any) => {
                    if (!attributes.src) {
                        return {};
                    }
                    return {
                        src: attributes.src,
                    };
                },
            },
            alt: {
                default: null,
                parseHTML: (element: HTMLElement) =>
                    element.getAttribute("alt"),
                renderHTML: (attributes: any) => {
                    if (!attributes.alt) {
                        return {};
                    }
                    return {
                        alt: attributes.alt,
                    };
                },
            },
            caption: {
                default: null,
                parseHTML: (element: HTMLElement) =>
                    element.getAttribute("data-caption"),
                renderHTML: (attributes: any) => {
                    if (!attributes.caption) {
                        return {};
                    }
                    return {
                        "data-caption": attributes.caption,
                    };
                },
            },
            variant: {
                default: "default",
                parseHTML: (element: HTMLElement) =>
                    element.getAttribute("data-variant") || "default",
                renderHTML: (attributes: any) => {
                    return {
                        "data-variant": attributes.variant,
                    };
                },
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: "img[src]",
            },
        ];
    },
    renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
        const { src, alt, caption, variant } = HTMLAttributes;
        const isCentered = variant === "center";

        const children: any[] = [
            "img",
            mergeAttributes(HTMLAttributes, {
                src,
                alt,
                class: `${
                    isCentered ? "mx-auto block" : ""
                } w-full h-auto rounded-lg`,
                "data-caption": caption || null,
                "data-variant": variant,
            }),
        ];

        if (caption) {
            children.push([
                "p",
                {
                    class: "text-sm text-gray-600 dark:text-gray-400 text-center mt-2 italic",
                },
                caption,
            ]);
        }

        return [
            "div",
            {
                class: "blog-image-wrapper my-4",
            },
            children,
        ];
    },
});

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
    const [imageVariant, setImageVariant] = useState<"default" | "center">(
        "default"
    );

    // Function to convert MDX content to HTML format for TipTap editor
    const convertMdxToHtml = (mdxContent: string): string => {
        if (!mdxContent || mdxContent.trim() === "") {
            return "<p></p>";
        }

        let html = mdxContent;

        // Convert BlogImage components to display as raw MDX syntax
        html = html.replace(/<BlogImage\s+([^>]*)\s*\/>/g, (match) => {
            return `
                <div class="mdx-component-display my-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <code class="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono block whitespace-pre-wrap">${match}</code>
                </div>
            `;
        });

        // Convert other MDX components to placeholders
        html = html.replace(
            /<([A-Z][a-zA-Z]*[^>]*\/?)>/g,
            (match, component) => {
                return `
                <div class="mdx-component-placeholder my-2 p-2 border border-gray-200 dark:border-gray-700 rounded bg-blue-50 dark:bg-blue-900/20">
                    <span class="text-xs font-mono text-blue-600 dark:text-blue-400">${component}</span>
                </div>
            `;
            }
        );

        // Convert markdown headers to HTML
        html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");
        html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
        html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
        html = html.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
        html = html.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
        html = html.replace(/^###### (.*$)/gm, "<h6>$1</h6>");

        // Convert markdown formatting to HTML
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

        // Convert markdown lists to HTML
        html = html.replace(/^- (.*$)/gm, "<li>$1</li>");
        html = html.replace(/^(\d+)\. (.*$)/gm, "<li>$2</li>");

        // Convert markdown links to HTML
        html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2">$1</a>');

        // Convert markdown blockquotes to HTML
        html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");

        // Convert markdown horizontal rules to HTML
        html = html.replace(/^---$/gm, "<hr>");

        // Convert markdown code blocks to HTML
        html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
        html = html.replace(/`([^`]*)`/g, "<code>$1</code>");

        // Convert newlines to paragraphs
        html = html.replace(/\n\n/g, "</p><p>");
        html = "<p>" + html + "</p>";

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, "");
        html = html.replace(/<p>\s*<\/p>/g, "");

        return html;
    };

    const editor = useEditor({
        immediatelyRender: false,
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
                    class: "text-blue-600 underline cursor-pointer",
                },
            }),
            CodeBlockLowlight.configure({
                lowlight: createLowlight(),
            }),
        ],
        content: convertMdxToHtml(content),
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();

            // Convert HTML to MDX format for storage
            const mdxContent = convertHtmlToMdx(html);
            console.log("Editor HTML:", html);
            console.log("Converted MDX:", mdxContent);
            onChange(mdxContent);
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
            },
        },
    });

    if (!editor) {
        return null;
    }

    // Function to convert HTML content to MDX format for database storage
    const convertHtmlToMdx = (htmlContent: string): string => {
        if (!htmlContent || htmlContent.trim() === "") {
            return "";
        }

        let mdx = htmlContent;

        // Extract BlogImage components from their display wrappers
        mdx = mdx.replace(
            /<div class="mdx-component-display[^>]*>[\s\S]*?<code[^>]*>([^<]*)<\/code>[\s\S]*?<\/div>/g,
            (match, codeContent) => {
                // Extract the BlogImage component from the code block
                return codeContent.trim();
            }
        );

        // First, extract and protect remaining MDX components
        const mdxComponents: string[] = [];
        mdx = mdx.replace(/<([A-Z][a-zA-Z]*[^>]*\/?)>/g, (match) => {
            const index = mdxComponents.length;
            mdxComponents.push(match);
            return `__MDX_COMPONENT_${index}__`;
        });

        // Remove paragraph wrappers from MDX components
        mdx = mdx.replace(/<p[^>]*>__MDX_COMPONENT_\d+__<\/p>/g, (match) =>
            match.replace(/<\/?p[^>]*>/g, "")
        );

        // Convert HTML to markdown for better MDX compatibility
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

        // Convert lists
        mdx = mdx.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match, content) => {
            return (
                content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, "- $1\n") + "\n"
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

        // Convert code blocks
        mdx = mdx.replace(
            /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
            "```\n$1\n```\n"
        );
        mdx = mdx.replace(/<code[^>]*>(.*?)<\/code>/g, "`$1`");

        // Convert paragraphs to newlines
        mdx = mdx.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "\n\n");

        // Convert line breaks
        mdx = mdx.replace(/<br\s*\/?>/g, "\n");

        // Clean up extra whitespace
        mdx = mdx.replace(/\n{3,}/g, "\n\n").trim();

        // Restore MDX components
        mdxComponents.forEach((component, index) => {
            mdx = mdx.replace(`__MDX_COMPONENT_${index}__`, component);
        });

        return mdx;
    };

    const handleImageInsert = () => {
        if (!imageSrc.trim() || !imageAlt.trim()) {
            alert("Please provide both image source and alt text.");
            return;
        }

        // Create the BlogImage component as MDX syntax
        const blogImageMDX = `<BlogImage src="${imageSrc}" alt="${imageAlt}"${
            imageCaption ? ` caption="${imageCaption}"` : ""
        }${imageVariant !== "default" ? ` variant="${imageVariant}"` : ""} />`;

        // Get current MDX content and append the new BlogImage
        const currentMdxContent = convertHtmlToMdx(editor.getHTML());
        const newMdxContent = currentMdxContent + blogImageMDX;

        // Convert the new MDX content to HTML with placeholders for the editor
        const htmlWithPlaceholder = convertMdxToHtml(newMdxContent);

        // Set the new content with the placeholder
        editor.commands.setContent(htmlWithPlaceholder);

        // Manually trigger the onChange since setContent doesn't trigger onUpdate
        console.log("Manual BlogImage insertion - MDX:", newMdxContent);
        console.log("Manual BlogImage insertion - HTML:", htmlWithPlaceholder);
        onChange(newMdxContent);

        // Reset form and close dialog
        setImageSrc("");
        setImageAlt("");
        setImageCaption("");
        setImageVariant("default");
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
                                    title="Insert Blog Image"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Insert Blog Image</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="image-src"
                                            className="text-right"
                                        >
                                            Image URL
                                        </Label>
                                        <Input
                                            id="image-src"
                                            value={imageSrc}
                                            onChange={(e) =>
                                                setImageSrc(e.target.value)
                                            }
                                            className="col-span-3"
                                            placeholder="Enter image URL..."
                                        />
                                    </div>
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
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="image-variant"
                                            className="text-right"
                                        >
                                            Alignment
                                        </Label>
                                        <select
                                            id="image-variant"
                                            value={imageVariant}
                                            onChange={(e) =>
                                                setImageVariant(
                                                    e.target.value as
                                                        | "default"
                                                        | "center"
                                                )
                                            }
                                            className="col-span-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="default">
                                                Default
                                            </option>
                                            <option value="center">
                                                Centered
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsImageDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleImageInsert}
                                        disabled={
                                            !imageSrc.trim() || !imageAlt.trim()
                                        }
                                    >
                                        Insert Image
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Editor Content */}
                <EditorContent editor={editor} className="min-h-[400px]" />
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
