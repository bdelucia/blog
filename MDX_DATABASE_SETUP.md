# MDX Database Storage Setup

This project stores MDX content in PostgreSQL as text and converts it to MDX when needed. This approach provides flexibility and performance while maintaining the power of MDX.

## Architecture Overview

### Storage Strategy

-   **MDX Content**: Stored as `TEXT` in PostgreSQL
-   **Conversion**: Converted to MDX components at runtime
-   **Performance**: Cached and optimized for fast rendering
-   **Flexibility**: Easy to edit and version control

### Database Schema

```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL, -- MDX content stored as text
    published_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    image_url VARCHAR(500),
    tags TEXT[],
    is_published BOOLEAN DEFAULT true
);
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install pg
```

### 2. Set Up PostgreSQL Database

```bash
# Create database
createdb blog_db

# Run schema
psql blog_db < database/schema.sql
```

### 3. Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/blog_db
NODE_ENV=development
```

### 4. Start the Application

```bash
npm run dev:server
```

## API Endpoints

### GET `/api/posts`

Returns a list of all published blog posts:

```json
[
    {
        "id": 1,
        "slug": "getting-started-with-vite",
        "title": "Getting Started with Vite",
        "summary": "Learn how to set up a Vite project...",
        "published_at": "2024-01-15T00:00:00Z",
        "image_url": "/api/images/vite-logo.png",
        "tags": ["vite", "react", "typescript"]
    }
]
```

### GET `/api/posts/:slug`

Returns a specific blog post with full content:

```json
{
    "id": 1,
    "slug": "getting-started-with-vite",
    "title": "Getting Started with Vite",
    "summary": "Learn how to set up a Vite project...",
    "content": "# Getting Started with Vite\n\nVite is a modern build tool...",
    "published_at": "2024-01-15T00:00:00Z",
    "image_url": "/api/images/vite-logo.png",
    "tags": ["vite", "react", "typescript"]
}
```

## MDX Content Examples

### Basic MDX

````mdx
# My Blog Post

This is a **bold** paragraph with _italic_ text.

## Code Example

```jsx
function Hello() {
    return <h1>Hello World!</h1>;
}
```
````

## Components

<BlogImage src="/image.jpg" alt="Description" />
```

### Advanced MDX with Custom Components

```mdx
# Advanced Blog Post

<BlogCarousel images={["image1.jpg", "image2.jpg"]} />

<BlogImage
    src="/hero.jpg"
    alt="Hero Image"
    caption="This is a beautiful hero image"
    variant="center"
/>

## Interactive Elements

<Table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>React</td>
            <td>18.0</td>
        </tr>
        <tr>
            <td>Vite</td>
            <td>4.0</td>
        </tr>
    </tbody>
</Table>
```

## Frontend Integration

### Fetching Posts

```tsx
import { getBlogPosts, getBlogPost } from "./data/blog";

// Get all posts
const posts = await getBlogPosts();

// Get specific post
const post = await getBlogPost("getting-started-with-vite");
```

### Rendering MDX Content

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import { BlogImage, BlogCarousel, Table } from "./components/blog-mdx";

const components = {
    BlogImage,
    BlogCarousel,
    Table,
    h1: (props: any) => <h1 className="text-3xl font-bold" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-semibold" {...props} />,
};

function BlogPost({ content }: { content: string }) {
    return <MDXRemote source={content} components={components} />;
}
```

## Benefits of This Approach

### ✅ **Flexibility**

-   Store MDX as text in database
-   Easy to edit and version control
-   Support for custom components
-   Dynamic content generation

### ✅ **Performance**

-   Fast database queries
-   Efficient caching
-   Optimized rendering
-   CDN-friendly

### ✅ **Scalability**

-   Horizontal scaling
-   Database replication
-   Load balancing
-   Microservices ready

### ✅ **Developer Experience**

-   Familiar MDX syntax
-   Hot reload support
-   TypeScript integration
-   Easy debugging

## Alternative Approaches

### Option 2: Store as JSON

```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    content JSONB NOT NULL -- Store MDX as structured JSON
);
```

### Option 3: Hybrid Approach

```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL, -- Raw MDX
    parsed_content JSONB, -- Parsed MDX structure
    metadata JSONB -- Frontmatter data
);
```

## Migration from File System

If you're migrating from file-based MDX:

1. **Export existing content**:

```bash
# Script to read .mdx files and insert into database
node scripts/migrate-mdx-to-db.js
```

2. **Update imports**:

```tsx
// Before
import { getBlogPosts } from "./data/blog";

// After (no changes needed - API handles it)
const posts = await getBlogPosts();
```

3. **Test thoroughly**:

```bash
npm run test
npm run dev:server
```

## Production Considerations

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
PORT=3000
```

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
```

### Caching Strategy

```tsx
// Implement Redis caching for frequently accessed posts
const cachedPost = await redis.get(`post:${slug}`);
if (cachedPost) {
    return JSON.parse(cachedPost);
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**

    - Check `DATABASE_URL` environment variable
    - Ensure PostgreSQL is running
    - Verify database exists

2. **MDX Rendering Issues**

    - Check component imports
    - Verify MDX syntax
    - Test with simple content first

3. **Performance Issues**
    - Add database indexes
    - Implement caching
    - Optimize queries

### Debug Commands

```bash
# Check database connection
npm run db:test

# View logs
npm run dev:server 2>&1 | grep -i error

# Health check
curl http://localhost:3000/api/health
```
