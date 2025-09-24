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
    frontmatterPlugin,
    toolbarPlugin,
    sandpackPlugin,
    directivesPlugin,
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
    InsertFrontmatter,
    AdmonitionDirectiveDescriptor,
    HighlightToggle,
    InsertCodeBlock,
    InsertSandpack,
    ConditionalContents,
    ChangeCodeMirrorLanguage,
    ShowSandpackInfo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface MDXEditorComponentProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
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
    const [markdown, setMarkdown] = useState(content || "");
    const [editorRef, setEditorRef] = useState<any>(null);

    // Update markdown when content prop changes (only when switching posts)
    useEffect(() => {
        if (content !== markdown) {
            setMarkdown(content || "");

            // Also update the editor directly if it exists
            if (editorRef && content) {
                editorRef.setMarkdown(content);
            }
        }
    }, [content, markdown, editorRef]);

    // Handle markdown changes from the editor
    const handleMarkdownChange = (newMarkdown: string) => {
        setMarkdown(newMarkdown);
        onChange(newMarkdown);
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
            `}</style>

            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
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
                        frontmatterPlugin(),
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
                        toolbarPlugin({
                            toolbarContents: () => (
                                <ConditionalContents
                                    options={[
                                        {
                                            when: (editor) =>
                                                editor?.editorType ===
                                                "codeblock",
                                            contents: () => (
                                                <ChangeCodeMirrorLanguage />
                                            ),
                                        },
                                        {
                                            when: (editor) =>
                                                editor?.editorType ===
                                                "sandpack",
                                            contents: () => (
                                                <ShowSandpackInfo />
                                            ),
                                        },
                                        {
                                            fallback: () => (
                                                <>
                                                    <UndoRedo />
                                                    <Separator />
                                                    <BoldItalicUnderlineToggles />
                                                    <HighlightToggle />
                                                    <CodeToggle />
                                                    <Separator />
                                                    <CreateLink />
                                                    <CustomImageUpload
                                                        editorRef={editorRef}
                                                    />
                                                    <Separator />
                                                    <ListsToggle />
                                                    <Separator />
                                                    <InsertTable />
                                                    <InsertThematicBreak />
                                                    <Separator />
                                                    <InsertCodeBlock />
                                                    <Separator />
                                                    <InsertSandpack />
                                                    <Separator />
                                                    <InsertAdmonition />
                                                    <InsertFrontmatter />
                                                    <Separator />
                                                    <BlockTypeSelect />
                                                </>
                                            ),
                                        },
                                    ]}
                                />
                            ),
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
