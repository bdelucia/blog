# Troubleshooting Guide

## Common Issues and Solutions

### 1. API Connection Refused Error

**Error**: `[vite] http proxy error: /api/posts AggregateError [ECONNREFUSED]`

**Cause**: The Express server is not running on port 3000.

**Solutions**:

#### Option A: Start Both Servers

```bash
# Install dependencies first
npm install

# Start both servers
npm run dev:server
```

#### Option B: Start Servers Separately

```bash
# Terminal 1 - Start Express server
npm run server

# Terminal 2 - Start Vite dev server
npm run dev
```

#### Option C: Use the Full Development Script

```bash
npm run dev:full
```

### 2. Database Connection Issues

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Cause**: PostgreSQL is not running or not installed.

**Solutions**:

#### Install PostgreSQL

```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Create database
createdb blog_db

# Run schema
psql blog_db < database/schema.sql
```

#### Test Database Connection

```bash
npm run db:test
```

### 3. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:

#### Kill Process Using Port 3000

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### Use Different Port

```bash
PORT=3001 npm run server
```

### 4. Missing Dependencies

**Error**: `Cannot find module 'pg'`

**Solution**:

```bash
npm install
```

### 5. TypeScript Errors

**Error**: Various TypeScript compilation errors

**Solutions**:

#### Check TypeScript Configuration

```bash
npx tsc --noEmit
```

#### Fix Import Issues

Make sure all imports use relative paths:

```tsx
// ✅ Correct
import { cn } from "../../lib/utils";

// ❌ Incorrect
import { cn } from "@/lib/utils";
```

### 6. Vite Proxy Issues

**Error**: Vite proxy not working

**Solutions**:

#### Check Vite Config

Ensure `vite.config.ts` has the proxy configuration:

```ts
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
});
```

#### Restart Vite Server

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

## Development Workflow

### Recommended Setup

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Set Up Database** (Optional - fallback data will be used)

    ```bash
    # Install PostgreSQL
    # Create database
    createdb blog_db
    psql blog_db < database/schema.sql
    ```

3. **Start Development**

    ```bash
    # Option 1: Both servers together
    npm run dev:server

    # Option 2: Full development script
    npm run dev:full
    ```

4. **Access Your App**
    - Frontend: http://localhost:5173
    - Backend: http://localhost:3000
    - API: http://localhost:3000/api

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/blog_db
NODE_ENV=development
PORT=3000
```

## Debug Commands

### Check Server Status

```bash
# Check if Express server is running
curl http://localhost:3000/api/health

# Check if Vite server is running
curl http://localhost:5173
```

### View Logs

```bash
# Express server logs
npm run server

# Vite server logs
npm run dev

# Both servers with logs
npm run dev:server
```

### Database Debugging

```bash
# Test database connection
npm run db:test

# Connect to database directly
psql blog_db

# List tables
\dt

# View sample data
SELECT * FROM blog_posts LIMIT 5;
```

## Fallback Mode

If the Express server is not running, the application will automatically use fallback data:

-   **Blog Posts**: Shows sample posts from the fallback data
-   **API Calls**: Gracefully handle connection errors
-   **Development**: Continue working without database

This ensures your frontend development can continue even without the backend running.

## Getting Help

### Check Logs

1. Look at the terminal output for error messages
2. Check browser console for client-side errors
3. Check network tab for failed API requests

### Common Solutions

1. Restart both servers
2. Clear browser cache
3. Check port availability
4. Verify database connection
5. Check environment variables

### Still Having Issues?

1. Check the [Express Setup Guide](./EXPRESS_SETUP.md)
2. Check the [MDX Database Setup Guide](./MDX_DATABASE_SETUP.md)
3. Verify all dependencies are installed
4. Check your system requirements

