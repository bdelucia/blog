# Bob with a Blog

A modern blog built with Next.js, React, TypeScript, Drizzle ORM, and Supabase, deployed on AWS ECS with automated CI/CD. Features a comprehensive admin dashboard with Google Analytics integration, real-time visitor tracking, and automated deployment pipeline.

## Features

-   📝 **Blog Posts**: Create and manage blog posts with MDX support
-   🔐 **Authentication**: User authentication with Supabase Auth
-   👤 **User Profiles**: Profile management with avatar uploads
-   💬 **Comments System**: Interactive comments with reactions
-   🎨 **Modern UI**: Beautiful, responsive design with dark mode
-   📱 **Mobile Responsive**: Optimized for all screen sizes
-   ⚡ **Performance**: Fast loading with Next.js 15 and Turbopack
-   🚀 **AWS Deployment**: Production-ready deployment on AWS ECS
-   🔄 **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
-   📊 **Admin Dashboard**: Real-time analytics with Google Analytics 4 integration
-   📈 **Interactive Charts**: Toggleable visitor, user, and page view analytics
-   🎯 **Real-time Metrics**: Live visitor counts and growth percentages
-   🗂️ **Data Tables**: Comprehensive posts and users management with search/filter
-   🚀 **SPA Navigation**: Fast client-side navigation with shared layouts
-   💾 **Smart Caching**: React Query with aggressive prefetching and caching
-   🎛️ **Chart Controls**: Time range filters (7/30/90 days) and view types
-   🗑️ **Delete Confirmations**: Safe deletion with confirmation dialogs

## Tech Stack

-   **Frontend**: Next.js 15, React, TypeScript
-   **Styling**: Tailwind CSS, Shadcn/ui
-   **Database**: Supabase (PostgreSQL)
-   **ORM**: Drizzle ORM
-   **Authentication**: Supabase Auth
-   **File Storage**: Supabase Storage
-   **Analytics**: Google Analytics 4 Data API
-   **Deployment**: AWS ECS with Application Load Balancer
-   **CI/CD**: GitHub Actions with AWS SDK v3
-   **Container**: Docker with multi-stage builds

## API Routes & Endpoints

### Authentication Routes

-   **`/api/auth/check-email`** - Check if email exists in database
-   **`/api/auth/create-user`** - Create new user account
-   **`/api/auth/get-user`** - Get user profile data
-   **`/api/auth/update-oauth-data`** - Update OAuth user data

### Admin Routes (Protected - Admin Only)

-   **`/api/admin/analytics-chart`** - Fetch GA4 visitor data by device type
-   **`/api/admin/page-views`** - Fetch GA4 page view data by date
-   **`/api/admin/users-chart`** - Fetch user registration data for charts
-   **`/api/admin/posts`** - Manage blog posts (CRUD operations)
-   **`/api/admin/users`** - Manage user accounts
-   **`/api/admin/delete-post`** - Delete blog posts with confirmation
-   **`/api/admin/upload-blog-image`** - Upload images for blog posts

### User Routes (Protected - Authenticated Users)

-   **`/api/user`** - Get current user profile
-   **`/api/upload-profile-picture`** - Upload user avatar
-   **`/api/upload-r2-image`** - Upload images to R2 storage

### Comments System (Mixed - Public Read, Protected Write)

-   **`/api/comments`** - Get all comments for a post (Public)
-   **`/api/comments/[id]`** - Manage individual comments (Protected - Authenticated Users)

### Health & Monitoring (Public)

-   **`/api/health`** - Comprehensive health check with database connectivity
-   **`/api/health-simple`** - Simple health check for load balancer (returns 200 OK)

### Public Routes

-   **`/`** - Homepage with blog post listings
-   **`/[slug]`** - Individual blog post pages
-   **`/auth/login`** - User login page
-   **`/auth/signup`** - User registration page
-   **`/auth/reset-password`** - Password reset page
-   **`/auth/callback`** - OAuth callback handler

### Protected Routes (Admin Only)

-   **`/admin`** - Admin dashboard with analytics and charts
-   **`/admin/posts`** - Post management interface with data table
-   **`/admin/users`** - User management interface with data table
-   **`/admin/posts/new-post`** - Create new blog post
-   **`/admin/posts/edit-post/[slug]`** - Edit existing blog post

## Project Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── [slug]/                   # Dynamic blog post pages
│   │   └── page.tsx             # Individual post page
│   ├── admin/                    # Admin dashboard routes
│   │   ├── layout.tsx           # Shared admin layout with sidebar
│   │   ├── page.tsx             # Admin dashboard overview
│   │   ├── posts/               # Post management
│   │   │   ├── page.tsx         # Posts data table
│   │   │   ├── new-post/        # Create new post
│   │   │   └── edit-post/       # Edit existing posts
│   │   └── users/               # User management
│   │       └── page.tsx         # Users data table
│   ├── api/                      # API routes
│   │   ├── admin/               # Admin-only API endpoints
│   │   │   ├── analytics-chart/ # GA4 visitor data
│   │   │   ├── page-views/      # GA4 page view data
│   │   │   ├── users-chart/     # User registration data
│   │   │   ├── posts/           # CRUD operations for posts
│   │   │   ├── users/           # User management
│   │   │   ├── delete-post/     # Post deletion with confirmation
│   │   │   └── upload-blog-image/ # Image uploads
│   │   ├── auth/                # Authentication endpoints
│   │   │   ├── check-email/     # Email validation
│   │   │   ├── create-user/     # User registration
│   │   │   ├── get-user/        # User profile data
│   │   │   └── update-oauth-data/ # OAuth user updates
│   │   ├── comments/            # Comments system
│   │   │   └── [id]/           # Individual comment management
│   │   ├── health/              # Health check endpoints
│   │   ├── user/                # User profile endpoints
│   │   ├── upload-profile-picture/ # Avatar uploads
│   │   └── upload-r2-image/     # R2 storage uploads
│   ├── auth/                     # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── signup/              # Registration page
│   │   ├── reset-password/      # Password reset
│   │   └── callback/            # OAuth callback
│   ├── dashboard/               # User dashboard
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
├── components/                   # React components
│   ├── admin/                   # Admin dashboard components
│   │   ├── AdminDashboardClient.tsx      # Main dashboard client
│   │   ├── AdminDashboardHeader.tsx      # Dashboard header
│   │   ├── AdminLoadingWrapper.tsx       # Loading states
│   │   ├── AdminPostsView.tsx           # Posts management view
│   │   ├── AdminUsersView.tsx           # Users management view
│   │   ├── AdminSPAContent.tsx          # SPA content router
│   │   ├── PostsDataTable.tsx           # Posts data table with actions
│   │   ├── UsersDataTable.tsx           # Users data table
│   │   ├── DashboardEditPostForm.tsx    # Post editing form
│   │   ├── DashboardNewPostForm.tsx     # New post creation form
│   │   ├── MDXEditorComponent.tsx       # Rich text editor
│   │   ├── analytics-chart.tsx          # Analytics visualization
│   │   ├── page-views-chart.tsx         # Page views chart
│   │   └── users-chart.tsx              # User registration chart
│   ├── auth/                    # Authentication components
│   │   ├── login-form.tsx       # Login form
│   │   ├── signup-form.tsx      # Registration form
│   │   └── reset-password-form.tsx # Password reset form
│   ├── home/                    # Homepage components
│   │   ├── ClientSections.tsx   # Client-side homepage sections
│   │   ├── FilteredPosts.tsx    # Post filtering
│   │   ├── HeroTagFilter.tsx    # Hero section tag filter
│   │   ├── PostCard.tsx         # Individual post cards
│   │   └── TagFilterModal.tsx   # Tag filtering modal
│   ├── magicui/                 # UI component library
│   │   ├── starfield.tsx        # Animated starfield background
│   │   ├── shine-border.tsx     # Shine border effect
│   │   └── [other-ui-components] # Additional UI components
│   ├── mdx-components/          # MDX rendering components
│   │   ├── [various-mdx-components] # Custom MDX elements
│   ├── providers/               # React context providers
│   │   ├── admin-dashboard-provider.tsx # Admin dashboard state
│   │   ├── query-client-provider.tsx    # React Query provider
│   │   ├── theme-provider.tsx           # Theme management
│   │   └── auth-provider.tsx            # Authentication context
│   ├── shared/                  # Shared components
│   │   ├── [shared-components]  # Reusable UI components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   │   ├── button.tsx           # Button component
│   │   ├── dialog.tsx           # Modal dialogs
│   │   ├── data-table.tsx       # Data table component
│   │   ├── spinner.tsx          # Loading spinners
│   │   └── [other-ui-components] # Additional base components
│   ├── analytics/               # Analytics components
│   │   └── BlogPostTracker.tsx  # Post view tracking
│   ├── app-sidebar.tsx          # Main application sidebar
│   ├── admin-cards.tsx          # Admin dashboard cards
│   ├── admin-sidebar.tsx        # Admin-specific sidebar
│   ├── site-header.tsx          # Site header component
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── db/                          # Database layer
│   ├── articles/                # Article/post database functions
│   │   ├── functions.ts         # CRUD operations for posts
│   │   ├── queries.ts           # Database queries
│   │   └── types.ts             # Type definitions
│   ├── users/                   # User database functions
│   │   ├── functions.ts         # User management functions
│   │   ├── queries.ts           # User queries
│   │   └── types.ts             # User type definitions
│   ├── comments/                # Comments database functions
│   │   ├── functions.ts         # Comment CRUD operations
│   │   ├── queries.ts           # Comment queries
│   │   └── types.ts             # Comment type definitions
│   └── db.js                    # Database connection
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts               # Authentication hook
│   ├── useAuthState.ts          # Auth state management
│   ├── useAdminData.ts          # Admin data fetching
│   ├── useAdminDataQuery.ts     # Admin data with React Query
│   ├── usePrefetchAdminData.ts  # Admin data prefetching
│   ├── useAnalyticsChartData.ts # Analytics chart data
│   ├── usePageViewsChartData.ts # Page views chart data
│   ├── useUsersChartData.ts     # Users chart data
│   ├── usePrefetchChartData.ts  # Chart data prefetching
│   ├── useUserQuery.ts          # User data queries
│   ├── useSessionManager.ts     # Session management
│   ├── useTheme.ts              # Theme management
│   └── use-mobile.ts            # Mobile detection
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication utilities
│   ├── auth-client.ts           # Client-side auth
│   ├── supabase-config.ts       # Supabase configuration
│   ├── analytics.ts             # Google Analytics integration
│   ├── email-config.ts          # Email configuration
│   ├── image-validation.ts      # Image upload validation
│   ├── query-client.ts          # React Query configuration
│   ├── session-refresh.ts       # Session refresh logic
│   ├── constants.ts             # Application constants
│   └── utils.ts                 # General utilities
├── data/                        # Data layer
│   ├── blog.ts                  # Blog data functions
│   └── blog-client.ts           # Client-side blog data
├── utils/                       # Utility functions
│   └── supabase/                # Supabase utilities
│       ├── [supabase-utils]     # Database helper functions
├── styles/                      # Additional styles
├── middleware.ts                 # Next.js middleware
└── index.ts                     # Main entry point

# Configuration Files
├── next.config.ts               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
├── components.json              # shadcn/ui configuration
├── drizzle.config.ts            # Drizzle ORM configuration
├── package.json                 # Dependencies and scripts
├── pnpm-lock.yaml              # Package lock file
├── Dockerfile                   # Docker configuration
├── .env.local                   # Environment variables
└── README.md                    # Project documentation

# Database
├── drizzle/                     # Database migrations
│   ├── [migration-files]        # SQL migration files
│   └── meta/                    # Migration metadata
└── supabase/                    # Supabase configuration
    ├── config.toml              # Supabase config
    └── functions/               # Edge functions
        └── validate-image/      # Image validation function

# Deployment
├── aws-deployment/              # AWS deployment files
│   ├── cloudformation-template.yaml # Infrastructure as code
│   └── ecs-task-definition.json     # ECS task configuration
└── scripts/                     # Deployment scripts
    ├── deploy-edge-function.sh  # Edge function deployment
    └── deploy-edge-function.bat # Windows deployment script

# Content
├── content/                     # MDX blog content
│   └── [blog-posts].mdx         # Individual blog posts
└── public/                      # Static assets
    ├── images/                  # Image assets
    │   ├── avatars/             # User avatars
    │   ├── backgrounds/         # Background images
    │   ├── content/             # Blog post images
    │   └── icons/               # Icon assets
    ├── [favicon-files]          # Favicon and app icons
    └── site.webmanifest         # PWA manifest
```

## AWS Deployment

This project is deployed on AWS using ECS (Elastic Container Service) with Fargate, Application Load Balancer, and automated CI/CD.

### Architecture

-   **ECS Cluster**: `bob-with-a-blog` - Container orchestration
-   **ECS Service**: `blog-app-task-service-u66yqxeg` - Manages running containers
-   **ECR Repository**: `blog-app` - Stores Docker images
-   **Application Load Balancer**: Distributes traffic across containers
-   **Target Group**: Health checks and load balancing
-   **VPC**: Isolated network with public subnets across 3 AZs

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/aws-deploy.yml`) provides automated testing, building, and deployment with comprehensive error handling and monitoring.

#### Pipeline Overview

The pipeline consists of two main jobs that run in sequence:

1. **Test Job** - Validates code quality and build integrity
2. **Deploy Job** - Builds, pushes, and deploys to AWS ECS

#### Test Job Details

**Triggers**: Every push and pull request to any branch

**Environment**:

-   Node.js 20.x
-   pnpm package manager
-   Ubuntu latest

**Steps**:

1. **Checkout Code** - Retrieves the latest code from the repository
2. **Setup Node.js** - Installs Node.js 20.x with pnpm
3. **Install Dependencies** - Runs `pnpm install` to install all packages
4. **Type Check** - Validates TypeScript types with `pnpm type-check`
5. **Lint Code** - Runs ESLint to ensure code quality with `pnpm lint`
6. **Build Application** - Compiles the Next.js application with `pnpm build`

**Success Criteria**: All steps must pass for the pipeline to continue

#### Deploy Job Details

**Triggers**: Only on pushes to `main` branch (production deployments)

**Dependencies**: Waits for Test Job to complete successfully

**Environment**:

-   AWS credentials configured via GitHub Secrets
-   Docker for containerization
-   AWS CLI for infrastructure management

**Deployment Steps**:

1. **Checkout & Setup**

    - Retrieves code from repository
    - Configures AWS credentials from GitHub Secrets
    - Sets up Node.js and pnpm environment

2. **Build & Push Docker Image**

    - Builds Docker image using multi-stage Dockerfile
    - Tags image with latest timestamp
    - Pushes image to Amazon ECR repository
    - Updates ECS task definition with new image URI

3. **Infrastructure Verification**

    - Verifies ECS cluster exists (`bob-with-a-blog`)
    - Checks ECS service status (`blog-app-task-service-u66yqxeg`)
    - Validates ECR repository access
    - Ensures IAM roles and permissions are correct

4. **Health Check Configuration**

    - Updates Application Load Balancer health check path to `/api/health-simple`
    - Configures health check timeout and interval settings
    - Ensures target group is properly configured

5. **Task Definition Management**

    - Creates new task definition with updated image
    - Removes old task definitions to prevent clutter
    - Maintains only the latest 5 task definitions

6. **Service Deployment**

    - Updates ECS service with new task definition
    - Forces new deployment to ensure latest image is used
    - Waits for deployment to complete (15-minute timeout)

7. **Deployment Verification**
    - Checks ECS service status
    - Verifies all tasks are running
    - Confirms health checks are passing
    - Validates Application Load Balancer target health

**Error Handling**:

-   Comprehensive logging at each step
-   Automatic rollback on deployment failures
-   Detailed error messages for troubleshooting
-   IAM role creation if missing
-   Health check path updates if needed

**Monitoring & Logging**:

-   Real-time deployment status in GitHub Actions
-   ECS service events tracking
-   Container logs available in CloudWatch Logs
-   Health check status monitoring
-   Deployment success/failure notifications

## Admin Dashboard & Analytics

The admin dashboard provides comprehensive analytics and management capabilities with real-time Google Analytics 4 integration.

### Dashboard Features

#### Real-Time Analytics Cards

-   **Unique Visitors** - Live GA4 `totalUsers` count with growth percentage
-   **Total Users** - Database user count from Supabase
-   **Published Posts** - Live count of published blog posts
-   **Page Views** - Real GA4 `screenPageViews` count

#### Interactive Charts

-   **Visitor Analytics Chart** - Device breakdown (desktop/mobile) with Y-axis numbers
-   **Page Views Chart** - Daily page view trends with smooth animations
-   **Time Range Filters** - 7 days, 30 days, 90 days views
-   **Responsive Design** - Optimized for mobile and desktop

#### Data Sources

-   **Google Analytics 4** - Real visitor and page view data
-   **Supabase Database** - User counts and post statistics
-   **Live Updates** - Data refreshes on page load
-   **Growth Calculations** - Month-over-month percentage changes

### Google Analytics Integration

#### Authentication Method

-   **Service Account** - Secure server-to-server authentication
-   **OAuth 2.0** - Google Analytics Data API access
-   **Scopes** - `https://www.googleapis.com/auth/analytics.readonly`

#### Data Metrics

-   **totalUsers** - Unique visitors (last 30 days)
-   **screenPageViews** - Total page views
-   **sessions** - User sessions
-   **bounceRate** - Page bounce rate
-   **deviceCategory** - Desktop/mobile breakdown

### Admin Management Features

#### Interactive Dashboard

-   **Toggleable Charts** - Switch between visitor, user, and page view analytics
-   **Real-time Data** - Live updates from Google Analytics 4 and database
-   **Time Range Controls** - 7, 30, and 90-day views with cumulative/daily options
-   **Default View** - Visitors chart displayed on page load
-   **Chart Controls** - Hide "Show Graph" buttons when respective charts are active

#### Post Management

-   **Data Table Interface** - Comprehensive posts management with search and filtering
-   **Action Buttons** - View, Edit, and Delete buttons for each post
-   **Delete Confirmation** - Safe deletion with shadcn/ui confirmation dialogs
-   **Rich MDX Editor** - Create and edit posts with live preview
-   **Post Status** - Draft/Published workflow
-   **Image Uploads** - Secure image handling with validation

#### User Management

-   **Data Table Interface** - Complete user management with search and filtering
-   **User Profiles** - View and manage user accounts
-   **Registration Analytics** - Track user growth with daily/cumulative charts
-   **Role Management** - Admin/User role assignments
-   **Profile Pictures** - Avatar upload system with fallback handling

#### Performance Features

-   **SPA Navigation** - Fast client-side navigation with shared layouts
-   **Smart Caching** - React Query with aggressive prefetching and caching
-   **Data Prefetching** - Hover-based prefetching for instant page loads
-   **Loading States** - Comprehensive loading spinners and error handling
-   **Optimized Queries** - Efficient data fetching with proper cache management

#### Security Features

-   **Admin Authentication** - Role-based access control
-   **API Protection** - All admin routes require authentication
-   **Data Validation** - Input sanitization and validation
-   **Safe Deletions** - Confirmation dialogs for destructive actions

### Health Checks

The application includes comprehensive health check endpoints:

-   **`/api/health`**: Detailed health check with database connectivity
-   **`/api/health-simple`**: Simple health check for ALB (returns 200 OK)

### Monitoring

The pipeline provides detailed logging and monitoring:

-   **ECS Service Events**: Track deployment progress
-   **Container Logs**: Available in CloudWatch Logs (`/ecs/blog-app`)
-   **Health Check Status**: Monitored by Application Load Balancer
-   **Deployment Status**: Real-time status in GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (pipeline will run automatically)
5. Submit a pull request

## License

MIT License - see LICENSE file for details
