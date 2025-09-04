# Express Server Setup

This project now uses Express.js to handle server-side routing and API endpoints, working seamlessly with the Vite frontend.

## Architecture

### Frontend (Vite + React)

-   **Development**: Runs on `http://localhost:5173` (Vite dev server)
-   **Production**: Built to `dist/` folder and served by Express
-   **Routing**: Client-side routing with browser history API

### Backend (Express)

-   **Development**: Runs on `http://localhost:3000` (Express server)
-   **Production**: Serves the built frontend and handles API requests
-   **Routing**: Server-side routing with fallback to client-side

## Setup

### 1. Install Dependencies

```bash
npm install express concurrently
```

### 2. Development Mode

Run both frontend and backend simultaneously:

```bash
npm run dev:server
```

This runs:

-   Vite dev server on port 5173
-   Express server on port 3000
-   API requests are proxied from Vite to Express

### 3. Production Mode

Build and serve the application:

```bash
npm run start
```

This:

-   Builds the frontend with `npm run build`
-   Serves the built files with Express

## API Endpoints

### GET `/api/posts`

Returns a list of blog posts:

```json
[
    {
        "id": 1,
        "title": "Getting Started with Vite",
        "slug": "getting-started-with-vite",
        "summary": "Learn how to set up a Vite project...",
        "publishedAt": "2024-01-15"
    }
]
```

### GET `/api/posts/:slug`

Returns a specific blog post:

```json
{
    "id": 1,
    "title": "Getting Started with Vite",
    "slug": "getting-started-with-vite",
    "content": "This is the full content...",
    "summary": "Learn how to set up a Vite project...",
    "publishedAt": "2024-01-15"
}
```

## Routing Strategy

### Server-Side Routing (Express)

-   Serves static files from `dist/` directory
-   Handles API requests at `/api/*` endpoints
-   Falls back to `index.html` for all other routes

### Client-Side Routing (React)

-   Uses browser history API for navigation
-   Link component prevents default behavior
-   Dispatches custom events for route changes

### Link Component Integration

```tsx
import { Link } from '../components/ui/link';

// Internal navigation (uses history API)
<Link href="/blog">Go to Blog</Link>

// External links (normal anchor behavior)
<Link href="https://example.com" external>
  External Site
</Link>
```

## Development Workflow

### 1. Start Development Servers

```bash
npm run dev:server
```

### 2. Access Your App

-   **Frontend**: `http://localhost:5173`
-   **API**: `http://localhost:3000/api`

### 3. API Development

-   Add new endpoints in `server/index.js`
-   API requests are automatically proxied during development
-   No CORS issues during development

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Start Production Server

```bash
npm run server
```

### 3. Environment Variables

```bash
PORT=3000 npm run server
```

## Benefits

-   ✅ **Full-Stack**: Complete server-side and client-side solution
-   ✅ **API Support**: RESTful API endpoints for data
-   ✅ **SEO Friendly**: Server-side rendering capabilities
-   ✅ **Development**: Hot reload for both frontend and backend
-   ✅ **Production**: Optimized build served by Express
-   ✅ **Routing**: Seamless client-side and server-side routing
-   ✅ **Proxy**: No CORS issues during development

## Customization

### Adding New API Endpoints

```javascript
// In server/index.js
app.get("/api/custom", (req, res) => {
    res.json({ message: "Custom endpoint" });
});
```

### Database Integration

```javascript
// Example with a database
app.get("/api/posts", async (req, res) => {
    const posts = await db.getPosts();
    res.json(posts);
});
```

### Authentication

```javascript
// Example with authentication middleware
app.use("/api/protected", authMiddleware);
app.get("/api/protected/posts", (req, res) => {
    // Protected route
});
```

## Troubleshooting

### Port Conflicts

If port 3000 is in use:

```bash
PORT=3001 npm run server
```

### Build Issues

Ensure all dependencies are installed:

```bash
npm install
```

### API Not Working

Check that both servers are running:

```bash
npm run dev:server
```
