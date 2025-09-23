import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

        // Check if R2 credentials are configured
        if (
            !process.env.R2_ACCESS_KEY_ID ||
            !process.env.R2_SECRET_ACCESS_KEY ||
            !process.env.R2_BUCKET_NAME ||
            !process.env.R2_ENDPOINT
        ) {
            console.error("R2 environment variables are not configured");
            return NextResponse.json(
                { error: "R2 storage not configured" },
                { status: 500 }
            );
        }

        // Create S3 client for R2
        const s3Client = new S3Client({
            region: "auto",
            endpoint: process.env.R2_ENDPOINT,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });

        // Get the form data
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
                },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split(".").pop();
        const fileName = `blog-${timestamp}-${randomString}.${fileExtension}`;

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
            CacheControl: "public, max-age=31536000", // 1 year cache
        });

        await s3Client.send(command);

        // Return the public URL
        const publicUrl = `https://pub-22e36f870e1647a6a48e07c2fa9d9ae8.r2.dev/${fileName}`;

        return NextResponse.json({
            success: true,
            fileName: fileName,
            url: publicUrl,
        });
    } catch (error) {
        console.error("Error uploading to R2:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
