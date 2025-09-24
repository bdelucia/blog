import React from "react";

interface AdmonitionProps {
    children: React.ReactNode;
    type?: "note" | "tip" | "warning" | "danger" | "info" | "caution";
    title?: string;
}

const Admonition: React.FC<AdmonitionProps> = ({
    children,
    type = "note",
    title,
}) => {
    const getClassName = () => {
        switch (type) {
            case "note":
                return "admonitionNote";
            case "tip":
                return "admonitionTip";
            case "warning":
            case "caution":
                return "admonitionCaution";
            case "danger":
                return "admonitionDanger";
            case "info":
                return "admonitionInfo";
            default:
                return "admonitionNote";
        }
    };

    return <div className={getClassName()}>{children}</div>;
};

export default Admonition;
