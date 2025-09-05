import fs from "fs";
import matter from "gray-matter";
import path from "path";

type Metadata = {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
};

export const BLOG_IMGS_URL = `https://pub-22e36f870e1647a6a48e07c2fa9d9ae8.r2.dev/`;

function getMDXFiles(dir: string) {
    return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

export async function getPost(slug: string) {
    const filePath = path.join("content", `${slug}.mdx`);
    let source = fs.readFileSync(filePath, "utf-8");
    const { content: rawContent, data: metadata } = matter(source);
    // Return the raw MDX content instead of converting to HTML
    return {
        source: rawContent,
        metadata,
        slug,
    };
}

async function getAllPosts(dir: string) {
    let mdxFiles = getMDXFiles(dir);
    return Promise.all(
        mdxFiles.map(async (file) => {
            let slug = path.basename(file, path.extname(file));
            let { metadata, source } = await getPost(slug);
            return {
                metadata,
                slug,
                source,
            };
        })
    );
}

export async function getBlogPosts() {
    return getAllPosts(path.join(process.cwd(), "src/content"));
}
