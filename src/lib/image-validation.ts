interface ValidationResult {
    isValid: boolean;
    error?: string;
    fileInfo?: {
        name: string;
        size: number;
        type: string;
        extension: string;
    };
}

/**
 * Validates an image file using Supabase Edge Function
 * @param file - The file to validate
 * @returns Promise<ValidationResult>
 */
export async function validateImageFile(file: File): Promise<ValidationResult> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-image`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                body: formData,
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("Validation failed:", result);
            return {
                isValid: false,
                error: result.error || "Validation failed",
                fileInfo: result.fileInfo,
            };
        }

        return result;
    } catch (error) {
        console.error("Error validating image:", error);
        return {
            isValid: false,
            error: "Failed to validate image. Please try again.",
        };
    }
}

/**
 * Client-side validation fallback (used when Edge Function is not available)
 * @param file - The file to validate
 * @returns ValidationResult
 */
export function validateImageFileClient(file: File): ValidationResult {
    // Validate file type
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
            fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type,
                extension: file.name.split(".").pop() || "unknown",
            },
        };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `File too large. Maximum size is 5MB. Your file is ${(
                file.size /
                1024 /
                1024
            ).toFixed(2)}MB.`,
            fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type,
                extension: file.name.split(".").pop() || "unknown",
            },
        };
    }

    // File is valid
    return {
        isValid: true,
        fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
            extension: file.name.split(".").pop() || "unknown",
        },
    };
}
