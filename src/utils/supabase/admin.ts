import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client with service role key for admin operations
 * This bypasses RLS (Row Level Security) policies
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing Supabase URL or Service Role Key");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
