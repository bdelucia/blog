import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { validateImageFile } from "@/lib/image-validation";

export async function POST(request: NextRequest) {
    try {
        // Get the current user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Create Supabase client with service role key for admin operations
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error(
                "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
            );
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Debug: Check if storage is available
        if (!supabase.storage) {
            console.error("Supabase storage is not available");
            return NextResponse.json(
                { error: "Storage service not available" },
                { status: 500 }
            );
        }

        // Get the form data
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file using Supabase Edge Function
        const validation = await validateImageFile(file);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: validation.error,
                    fileInfo: validation.fileInfo,
                },
                { status: 400 }
            );
        }

        console.log("File validation passed:", validation.fileInfo);

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split(".").pop();
        const fileName = `blog-${timestamp}-${randomString}.${fileExtension}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
            .from("blog-images")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("Error uploading to Supabase storage:", error);
            return NextResponse.json(
                { error: "Failed to upload image" },
                { status: 500 }
            );
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
            .from("blog-images")
            .getPublicUrl(data.path);

        return NextResponse.json({
            success: true,
            fileName: data.path,
            url: urlData.publicUrl,
        });
    } catch (error) {
        console.error("Error uploading blog image:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
