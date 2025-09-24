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
-   📈 **Analytics Charts**: Interactive visitor and page view tracking
-   🎯 **Real-time Metrics**: Live visitor counts and growth percentages

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

### Admin Routes

-   **`/api/admin/analytics-chart`** - Fetch GA4 visitor data by device type
-   **`/api/admin/page-views`** - Fetch GA4 page view data by date
-   **`/api/admin/posts`** - Manage blog posts (CRUD operations)
-   **`/api/admin/users`** - Manage user accounts
-   **`/api/admin/upload-blog-image`** - Upload images for blog posts

### User Routes

-   **`/api/user`** - Get current user profile
-   **`/api/upload-profile-picture`** - Upload user avatar
-   **`/api/upload-r2-image`** - Upload images to R2 storage

### Comments System

-   **`/api/comments`** - Get all comments for a post
-   **`/api/comments/[id]`** - Manage individual comments (GET, POST, DELETE)

### Health & Monitoring

-   **`/api/health`** - Comprehensive health check with database connectivity
-   **`/api/health-simple`** - Simple health check for load balancer (returns 200 OK)

### Public Routes

-   **`/`** - Homepage with blog post listings
-   **`/[slug]`** - Individual blog post pages
-   **`/auth/login`** - User login page
-   **`/auth/signup`** - User registration page
-   **`/auth/reset-password`** - Password reset page
-   **`/auth/callback`** - OAuth callback handler
-   **`/admin`** - Admin dashboard with analytics
-   **`/admin/posts`** - Post management interface
-   **`/admin/posts/new-post`** - Create new blog post
-   **`/admin/posts/edit-post/[id]`** - Edit existing blog post

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── shared/         # Shared components (Header, Footer, etc.)
│   ├── auth/           # Authentication components
│   └── magicui/        # UI components
├── db/                 # Database schemas and functions
├── lib/                # Utility functions
└── hooks/              # Custom React hooks
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

#### Post Management

-   **Create Posts** - Rich MDX editor with live preview
-   **Edit Posts** - Update existing content
-   **Post Status** - Draft/Published workflow
-   **Image Uploads** - Secure image handling

#### User Management

-   **User Profiles** - View and manage user accounts
-   **Role Management** - Admin/User role assignments
-   **Profile Pictures** - Avatar upload system

#### Security Features

-   **Admin Authentication** - Role-based access control
-   **API Protection** - All admin routes require authentication
-   **Data Validation** - Input sanitization and validation

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
