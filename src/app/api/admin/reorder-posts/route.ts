import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdmin();

        const body = await request.json();
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const supabase = await createClient(request);

        // Update the order for each item
        const updatePromises = items.map(
            (item: { id: number; order: number }) =>
                supabase
                    .from("articles")
                    .update({
                        order: item.order,
                        updatedAt: new Date().toISOString(),
                    })
                    .eq("id", item.id)
        );

        const results = await Promise.all(updatePromises);

        // Check for any errors
        const hasError = results.some((result) => result.error);
        if (hasError) {
            console.error("Some updates failed:", results);
            return NextResponse.json(
                { error: "Some updates failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Post order updated successfully",
        });
    } catch (error) {
        console.error("Error reordering posts:", error);
        return NextResponse.json(
            { error: "Failed to reorder posts" },
            { status: 500 }
        );
    }
}
