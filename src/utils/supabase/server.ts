import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getCookieOptions } from "@/lib/supabase-config";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // Set longer expiration for refresh tokens (7 days)
                            const cookieOptions = {
                                ...options,
                                ...getCookieOptions(),
                                // Override maxAge for refresh tokens specifically
                                maxAge: name.includes("refresh")
                                    ? getCookieOptions().maxAge
                                    : options?.maxAge,
                            };
                            cookieStore.set(name, value, cookieOptions);
                        });
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}
