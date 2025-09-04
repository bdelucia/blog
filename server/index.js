import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection (optional)
let pool = null;
try {
    const { Pool } = await import("pg");
    pool = new Pool({
        connectionString:
            process.env.DATABASE_URL ||
            `postgresql://${process.env.DB_USER || "postgres"}:${
                process.env.DB_PASSWORD || "password"
            }@${process.env.DB_HOST || "localhost"}:${
                process.env.DB_PORT || "5432"
            }/${process.env.DB_NAME || "bob-blog"}`,
        ssl:
            process.env.NODE_ENV === "production"
                ? { rejectUnauthorized: false }
                : false,
    });

    // Test the connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection established");
} catch (error) {
    console.warn(
        "⚠️ Database connection failed, using fallback data:",
        error.message
    );
    pool = null;
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

// Fallback data for when database is not available
const FALLBACK_POSTS = [
    {
        id: 1,
        slug: "getting-started-with-vite",
        title: "Getting Started with Vite",
        summary:
            "Learn how to set up a Vite project with React and TypeScript.",
        published_at: "2024-01-15T00:00:00Z",
        image_url: "/api/images/vite-logo.png",
        tags: ["vite", "react", "typescript", "frontend"],
    },
    {
        id: 2,
        slug: "building-a-blog-with-express",
        title: "Building a Blog with Express",
        summary:
            "Create a full-stack blog application using Express and React.",
        published_at: "2024-01-20T00:00:00Z",
        image_url: "/api/images/express-logo.png",
        tags: ["express", "nodejs", "api", "backend"],
    },
];

// API routes
app.get("/api/posts", async (req, res) => {
    try {
        if (pool) {
            const { rows } = await pool.query(`
                SELECT id, slug, title, summary, published_at, image_url, tags
                FROM blog_posts 
                WHERE is_published = true 
                ORDER BY published_at DESC
            `);
            res.json(rows);
        } else {
            // Use fallback data if database is not available
            res.json(FALLBACK_POSTS);
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
        // Fallback to static data on error
        res.json(FALLBACK_POSTS);
    }
});

app.get("/api/posts/:slug", async (req, res) => {
    try {
        const { slug } = req.params;

        if (pool) {
            const { rows } = await pool.query(
                `
                SELECT id, slug, title, summary, content, published_at, image_url, tags
                FROM blog_posts 
                WHERE slug = $1 AND is_published = true
            `,
                [slug]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: "Post not found" });
            }

            res.json(rows[0]);
        } else {
            // Use fallback data if database is not available
            const fallbackPost = FALLBACK_POSTS.find(
                (post) => post.slug === slug
            );
            if (!fallbackPost) {
                return res.status(404).json({ error: "Post not found" });
            }
            res.json(fallbackPost);
        }
    } catch (error) {
        console.error("Error fetching post:", error);
        // Fallback to static data on error
        const fallbackPost = FALLBACK_POSTS.find((post) => post.slug === slug);
        if (!fallbackPost) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.json(fallbackPost);
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Handle all routes by serving the index.html file
// This enables client-side routing to work properly
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});
