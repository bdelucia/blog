import { createClient } from "@/utils/supabase/server";

export default async function Articles() {
    const supabase = await createClient();
    const { data: articles } = await supabase.from("articles").select();

    return <pre>{JSON.stringify(articles, null, 2)}</pre>;
}
