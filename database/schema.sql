-- Blog Database Schema
-- Run this in your PostgreSQL database

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
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_published_status ON blog_posts(is_published, published_at);

-- Sample data
INSERT INTO blog_posts (slug, title, summary, content, image_url, tags) VALUES
(
    'getting-started-with-vite',
    'Getting Started with Vite',
    'Learn how to set up a Vite project with React and TypeScript.',
    '# Getting Started with Vite

Vite is a modern build tool that provides a faster and leaner development experience.

## Installation

```bash
npm create vite@latest my-project -- --template react-ts
cd my-project
npm install
```

## Features

- ⚡️ Lightning fast HMR
- 🛠️ Rich features out of the box
- 📦 Optimized build
- 🔧 Highly extensible

## Getting Started

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Vite makes development a breeze!',
    '/api/images/vite-logo.png',
    ARRAY['vite', 'react', 'typescript', 'frontend']
),
(
    'building-a-blog-with-express',
    'Building a Blog with Express',
    'Create a full-stack blog application using Express and React.',
    '# Building a Blog with Express

Express.js is a minimal and flexible Node.js web application framework.

## Setup

```bash
npm init -y
npm install express pg
```

## Database Schema

```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

- `GET /api/posts` - List all posts
- `GET /api/posts/:slug` - Get specific post

Express makes building APIs simple and efficient!',
    '/api/images/express-logo.png',
    ARRAY['express', 'nodejs', 'api', 'backend']
);

-- Update function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
