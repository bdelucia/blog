"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

interface SandpackRendererProps {
    children?: string;
    code?: string;
    "data-code"?: string;
    template?: string;
    theme?: "light" | "dark" | "auto";
}

export default function SandpackRenderer({
    children,
    code,
    "data-code": dataCode,
    template = "react",
    theme = "auto",
}: SandpackRendererProps) {
    const { theme: currentTheme } = useTheme();

    // Determine the theme to use
    const sandpackTheme =
        theme === "auto" ? (currentTheme === "dark" ? "dark" : "light") : theme;

    // Extract the code from either the code prop, data-code prop, or children
    let reactCode = "";
    if (dataCode) {
        // Decode base64 encoded content (browser compatible)
        try {
            reactCode = atob(dataCode);
        } catch (error) {
            console.error("Failed to decode base64 content:", error);
            reactCode = "";
        }
    } else {
        reactCode = (code || children || "").trim();
    }

    // Ensure the code has proper export statement
    let processedCode = reactCode;
    if (!processedCode.includes("export default")) {
        // If no export, wrap the code in a default export
        processedCode = `export default function App() {\n  return (\n    <div>\n      ${processedCode
            .split("\n")
            .map((line) => `      ${line}`)
            .join("\n")}\n    </div>\n  );\n}`;
    }

    // Default files configuration
    const files = {
        "/App.js": {
            code:
                processedCode ||
                `export default function App() {
  return (
    <div className="App">
      <h1>Hello Sandpack!</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}`,
        },
    };

    return (
        <div className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <Sandpack
                template={template as any}
                theme={sandpackTheme}
                options={{
                    showNavigator: false,
                    showRefreshButton: true,
                    showInlineErrors: true,
                    wrapContent: true,
                    editorHeight: 400,
                    autorun: true,
                }}
                files={files}
            />
        </div>
    );
}
