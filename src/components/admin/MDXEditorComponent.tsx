"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon } from "lucide-react";
import { validateImageFileClient } from "@/lib/image-validation";
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    linkPlugin,
    linkDialogPlugin,
    imagePlugin,
    tablePlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
    toolbarPlugin,
    sandpackPlugin,
    directivesPlugin,
    // frontmatterPlugin, // Removed - we use database fields instead
    UndoRedo,
    BoldItalicUnderlineToggles,
    CodeToggle,
    CreateLink,
    InsertTable,
    InsertThematicBreak,
    ListsToggle,
    Separator,
    BlockTypeSelect,
    CodeMirrorEditor,
    InsertAdmonition,
    AdmonitionDirectiveDescriptor,
    HighlightToggle,
    InsertCodeBlock,
    InsertSandpack,
    ConditionalContents,
    ChangeCodeMirrorLanguage,
    ShowSandpackInfo,
    KitchenSinkToolbar,
    // InsertFrontmatter, // Removed - we use database fields instead
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import BlogImage from "../mdx-components/BlogImage";
import Table from "../mdx-components/Table";
import BlogCarousel from "../mdx-components/BlogCarousel";

interface MDXEditorComponentProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

// Function to preprocess content for MDXEditor
function preprocessContentForEditor(content: string): string {
    if (!content) return "";

    // Convert JSX elements to readable markdown format
    let processedContent = content;

    // Convert BlogImage components to readable format
    processedContent = processedContent.replace(
        /<BlogImage\s+([^>]*?)\s*\/?>/g,
        (match, attributes) => {
            // Extract src and alt from attributes
            const srcMatch = attributes.match(/src="([^"]*)"/);
            const altMatch = attributes.match(/alt="([^"]*)"/);
            const captionMatch = attributes.match(/caption="([^"]*)"/);
            const variantMatch = attributes.match(/variant="([^"]*)"/);

            const src = srcMatch ? srcMatch[1] : "";
            const alt = altMatch ? altMatch[1] : "";
            const caption = captionMatch ? captionMatch[1] : "";
            const variant = variantMatch ? variantMatch[1] : "default";

            let result = `\n---\n**BlogImage Component**\n`;
            result += `- **Image Source:** ${src}\n`;
            result += `- **Alt Text:** ${alt}\n`;
            if (caption) result += `- **Caption:** ${caption}\n`;
            if (variant !== "default") result += `- **Variant:** ${variant}\n`;
            result += `---\n`;

            return result;
        }
    );

    // Convert Table components to readable format
    processedContent = processedContent.replace(
        /<Table\s+([^>]*?)\s*\/?>/g,
        (match, attributes) => {
            // Extract headers and rows from attributes
            const headersMatch = attributes.match(/headers="([^"]*)"/);
            const rowsMatch = attributes.match(/rows="([^"]*)"/);

            const headers = headersMatch ? headersMatch[1] : "";
            const rows = rowsMatch ? rowsMatch[1] : "";

            let result = `\n---\n**Table Component**\n`;
            result += `- **Headers:** ${headers}\n`;
            result += `- **Rows:** ${rows}\n`;
            result += `---\n`;

            return result;
        }
    );

    // Convert BlogCarousel components to readable format
    processedContent = processedContent.replace(
        /<BlogCarousel\s+([^>]*?)\s*\/?>/g,
        (match, attributes) => {
            // Extract images from attributes
            const imagesMatch = attributes.match(/images="([^"]*)"/);
            const images = imagesMatch ? imagesMatch[1] : "";

            let result = `\n---\n**BlogCarousel Component**\n`;
            result += `- **Images:** ${images}\n`;
            result += `---\n`;

            return result;
        }
    );

    return processedContent;
}

// Function to postprocess content from MDXEditor
function postprocessContentFromEditor(content: string): string {
    if (!content) return "";

    // Convert readable format back to JSX elements
    let processedContent = content;

    // Convert BlogImage readable format back to JSX
    processedContent = processedContent.replace(
        /---\s*\*\*BlogImage Component\*\*\s*- \*\*Image Source:\*\* ([^\n]*)\s*- \*\*Alt Text:\*\* ([^\n]*)(?:\s*- \*\*Caption:\*\* ([^\n]*))?(?:\s*- \*\*Variant:\*\* ([^\n]*))?\s*---/g,
        (match, src, alt, caption, variant) => {
            let jsx = `<BlogImage src="${src}" alt="${alt}"`;
            if (caption) jsx += ` caption="${caption}"`;
            if (variant && variant !== "default")
                jsx += ` variant="${variant}"`;
            jsx += ` />`;
            return jsx;
        }
    );

    // Convert Table readable format back to JSX
    processedContent = processedContent.replace(
        /---\s*\*\*Table Component\*\*\s*- \*\*Headers:\*\* ([^\n]*)\s*- \*\*Rows:\*\* ([^\n]*)\s*---/g,
        (match, headers, rows) => {
            return `<Table headers="${headers}" rows="${rows}" />`;
        }
    );

    // Convert BlogCarousel readable format back to JSX
    processedContent = processedContent.replace(
        /---\s*\*\*BlogCarousel Component\*\*\s*- \*\*Images:\*\* ([^\n]*)\s*---/g,
        (match, images) => {
            return `<BlogCarousel images="${images}" />`;
        }
    );

    return processedContent;
}

// Custom Image Upload Component that works with imageUploadHandler
function CustomImageUpload({ editorRef }: { editorRef: any }) {
    const [imageUrl, setImageUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const handleImageUpload = async (file: File) => {
        if (!file) return;

        // Client-side validation first
        const clientValidation = validateImageFileClient(file);
        if (!clientValidation.isValid) {
            alert(clientValidation.error);
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload-blog-image", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const data = await response.json();

            // Insert the image markdown into the editor
            if (editorRef) {
                const imageMarkdown = `![${file.name}](${data.url})`;
                console.log("Inserting image:", imageMarkdown);

                // Get current markdown and insert image
                const currentMarkdown = editorRef.getMarkdown();
                const newMarkdown = currentMarkdown + `\n${imageMarkdown}\n`;
                editorRef.setMarkdown(newMarkdown);

                console.log("Image inserted successfully");
            }

            setShowDialog(false);
        } catch (error) {
            console.error("Error uploading image:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            alert(`Failed to upload image: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

    const insertImageFromUrl = () => {
        if (!imageUrl.trim()) return;

        if (editorRef) {
            const imageMarkdown = `![Image](${imageUrl})`;
            console.log("Inserting URL image:", imageMarkdown);

            const currentMarkdown = editorRef.getMarkdown();
            const newMarkdown = currentMarkdown + `\n${imageMarkdown}\n`;
            editorRef.setMarkdown(newMarkdown);

            console.log("URL image inserted successfully");
        }

        setImageUrl("");
        setShowDialog(false);
    };

    return (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Insert Image"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="image-url">Image URL</Label>
                        <Input
                            id="image-url"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={insertImageFromUrl}
                            disabled={!imageUrl.trim()}
                        >
                            Insert from URL
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                document.getElementById("file-input")?.click()
                            }
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Upload File"}
                        </Button>
                    </div>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function MDXEditorComponent({
    content,
    onChange,
    placeholder = "Write your blog post content here...",
}: MDXEditorComponentProps) {
    const [markdown, setMarkdown] = useState(
        preprocessContentForEditor(content || "")
    );
    const [editorRef, setEditorRef] = useState<any>(null);

    // Update markdown when content prop changes (only when switching posts)
    useEffect(() => {
        const processedContent = preprocessContentForEditor(content || "");
        if (processedContent !== markdown) {
            setMarkdown(processedContent);

            // Also update the editor directly if it exists
            if (editorRef && processedContent) {
                editorRef.setMarkdown(processedContent);
            }
        }
    }, [content, markdown, editorRef]);

    // Handle markdown changes from the editor
    const handleMarkdownChange = (newMarkdown: string) => {
        const processedMarkdown = preprocessContentForEditor(newMarkdown);
        setMarkdown(processedMarkdown);
        const finalContent = postprocessContentFromEditor(processedMarkdown);
        onChange(finalContent);
    };

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">
                Content <span className="text-red-500">*</span>
            </Label>

            <style jsx global>{`
                /* Fix MDXEditor dropdown visibility */
                .mdxeditor-toolbar {
                    z-index: 50 !important;
                }

                .mdxeditor-toolbar .mdxeditor-dropdown {
                    z-index: 60 !important;
                }

                .mdxeditor-toolbar .mdxeditor-dropdown-content {
                    z-index: 70 !important;
                    position: absolute !important;
                    background: white !important;
                    border: 1px solid #e5e7eb !important;
                    border-radius: 6px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                        0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    padding: 4px !important;
                    min-width: 120px !important;
                }

                .dark .mdxeditor-toolbar .mdxeditor-dropdown-content {
                    background: #1f2937 !important;
                    border-color: #374151 !important;
                }

                .mdxeditor-toolbar .mdxeditor-dropdown-item {
                    padding: 8px 12px !important;
                    cursor: pointer !important;
                    border-radius: 4px !important;
                    color: #374151 !important;
                }

                .mdxeditor-toolbar .mdxeditor-dropdown-item:hover {
                    background: #f3f4f6 !important;
                }

                .dark .mdxeditor-toolbar .mdxeditor-dropdown-item {
                    color: #d1d5db !important;
                }

                .dark .mdxeditor-toolbar .mdxeditor-dropdown-item:hover {
                    background: #374151 !important;
                }

                /* Ensure images are visible in the editor */
                .mdxeditor-root-contenteditable img {
                    max-width: 100% !important;
                    height: auto !important;
                    display: block !important;
                    margin: 8px 0 !important;
                    border-radius: 4px !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                }

                .dark .mdxeditor-root-contenteditable img {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                }

                /* Custom highlight styling - keep original background, change text to black */
                .mdxeditor-root-contenteditable mark {
                    color: #000000 !important; /* Black text for better readability */
                }

                .dark .mdxeditor-root-contenteditable mark {
                    color: #000000 !important; /* Black text in dark mode too */
                }

                /* Fix black text for highlighted bold text */
                .mdxeditor-root-contenteditable mark strong,
                .mdxeditor-root-contenteditable mark b {
                    color: #000000 !important;
                }

                .dark .mdxeditor-root-contenteditable mark strong,
                .dark .mdxeditor-root-contenteditable mark b {
                    color: #000000 !important;
                }

                /* Fix black text for highlighted italic text */
                .mdxeditor-root-contenteditable mark em,
                .mdxeditor-root-contenteditable mark i {
                    color: #000000 !important;
                }

                .dark .mdxeditor-root-contenteditable mark em,
                .dark .mdxeditor-root-contenteditable mark i {
                    color: #000000 !important;
                }

                /* Fix black text for highlighted bold AND italic text */
                .mdxeditor-root-contenteditable mark strong em,
                .mdxeditor-root-contenteditable mark strong i,
                .mdxeditor-root-contenteditable mark b em,
                .mdxeditor-root-contenteditable mark b i,
                .mdxeditor-root-contenteditable mark em strong,
                .mdxeditor-root-contenteditable mark em b,
                .mdxeditor-root-contenteditable mark i strong,
                .mdxeditor-root-contenteditable mark i b {
                    color: #000000 !important;
                }

                .dark .mdxeditor-root-contenteditable mark strong em,
                .dark .mdxeditor-root-contenteditable mark strong i,
                .dark .mdxeditor-root-contenteditable mark b em,
                .dark .mdxeditor-root-contenteditable mark b i,
                .dark .mdxeditor-root-contenteditable mark em strong,
                .dark .mdxeditor-root-contenteditable mark em b,
                .dark .mdxeditor-root-contenteditable mark i strong,
                .dark .mdxeditor-root-contenteditable mark i b {
                    color: #000000 !important;
                }

                /* Ensure highlighted text remains black on hover */
                .mdxeditor-root-contenteditable mark:hover {
                    color: #000000 !important;
                }

                .dark .mdxeditor-root-contenteditable mark:hover {
                    color: #000000 !important;
                }

                /* Fix MDXEditor dropdown visibility - official solution from GitHub issue #276 */
                .mdxeditor-popup-container {
                    z-index: 1101 !important;
                }

                /* Fix Block Type dropdown positioning to drop down instead of up */
                .mdxeditor-popup-container [data-radix-select-content] {
                    position: absolute !important;
                    top: 100% !important;
                    bottom: auto !important;
                }

                /* Fix admonition text color to be black in MDXEditor */
                .mdxeditor-root-contenteditable .admonition,
                .mdxeditor-root-contenteditable .admonition-note,
                .mdxeditor-root-contenteditable .admonition-tip,
                .mdxeditor-root-contenteditable .admonition-danger,
                .mdxeditor-root-contenteditable .admonition-info,
                .mdxeditor-root-contenteditable .admonition-caution,
                .mdxeditor-root-contenteditable .admonition p,
                .mdxeditor-root-contenteditable .admonition div,
                .mdxeditor-root-contenteditable .admonition span,
                .mdxeditor-root-contenteditable .admonition strong,
                .mdxeditor-root-contenteditable .admonition em,
                .mdxeditor-root-contenteditable .admonition h1,
                .mdxeditor-root-contenteditable .admonition h2,
                .mdxeditor-root-contenteditable .admonition h3,
                .mdxeditor-root-contenteditable .admonition h4,
                .mdxeditor-root-contenteditable .admonition h5,
                .mdxeditor-root-contenteditable .admonition h6 {
                    color: #000000 !important;
                }

                .mdxeditor-root-contenteditable .admonition *,
                .mdxeditor-root-contenteditable .admonition-note *,
                .mdxeditor-root-contenteditable .admonition-tip *,
                .mdxeditor-root-contenteditable .admonition-danger *,
                .mdxeditor-root-contenteditable .admonition-info *,
                .mdxeditor-root-contenteditable .admonition-caution * {
                    color: #000000 !important;
                }

                /* Force all text within admonitions to be black */
                .mdxeditor-root-contenteditable [class*="admonition"] {
                    color: #000000 !important;
                }

                .mdxeditor-root-contenteditable [class*="admonition"] * {
                    color: #000000 !important;
                }
            `}</style>

            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-visible">
                <MDXEditor
                    ref={setEditorRef}
                    markdown={markdown}
                    onChange={handleMarkdownChange}
                    plugins={[
                        headingsPlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        thematicBreakPlugin(),
                        markdownShortcutPlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        imagePlugin({
                            imageUploadHandler: async (file: File) => {
                                try {
                                    const formData = new FormData();
                                    formData.append("file", file);

                                    const response = await fetch(
                                        "/api/upload-blog-image",
                                        {
                                            method: "POST",
                                            body: formData,
                                        }
                                    );

                                    if (!response.ok) {
                                        throw new Error("Upload failed");
                                    }

                                    const data = await response.json();
                                    console.log(
                                        "Image uploaded via handler:",
                                        data.url
                                    );
                                    return data.url;
                                } catch (error) {
                                    console.error(
                                        "Error uploading image:",
                                        error
                                    );
                                    throw error;
                                }
                            },
                            imageAutocompleteSuggestions: [],
                        }),
                        tablePlugin(),
                        codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
                        codeMirrorPlugin({
                            codeBlockLanguages: {
                                js: "JavaScript",
                                jsx: "JavaScript (React)",
                                ts: "TypeScript",
                                tsx: "TypeScript (React)",
                                css: "CSS",
                                html: "HTML",
                                json: "JSON",
                                python: "Python",
                                java: "Java",
                                cpp: "C++",
                                c: "C",
                                sql: "SQL",
                                bash: "Bash",
                                sh: "Shell",
                                md: "Markdown",
                                txt: "Text",
                            },
                        }),
                        diffSourcePlugin({
                            viewMode: "rich-text",
                            diffMarkdown: "",
                        }),
                        sandpackPlugin({
                            sandpackConfig: {
                                defaultPreset: "react",
                                presets: [
                                    {
                                        label: "React",
                                        name: "react",
                                        meta: "live react",
                                        sandpackTemplate: "react",
                                        sandpackTheme: "light",
                                        snippetFileName: "/App.js",
                                        snippetLanguage: "jsx",
                                        initialSnippetContent:
                                            `export default function App() {
  return (
    <div className="App">
      <h1>Hello Sandpack!</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}`.trim(),
                                    },
                                ],
                            },
                        }),
                        directivesPlugin({
                            directiveDescriptors: [
                                AdmonitionDirectiveDescriptor,
                            ],
                        }),
                        // frontmatterPlugin removed - we use database fields instead of YAML frontmatter
                        toolbarPlugin({
                            toolbarContents: () => <KitchenSinkToolbar />,
                        }),
                    ]}
                    contentEditableClassName="prose max-w-none min-h-[400px] p-4 text-gray-900 dark:text-white bg-transparent"
                />
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                    Rich markdown editor with live preview. Use toolbar buttons
                    or type markdown syntax directly.
                </span>
                <span>{markdown.length} characters</span>
            </div>
        </div>
    );
}
