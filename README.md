# Bob with a Blog

A modern blog built with Next.js, React, TypeScript, Drizzle ORM, and Supabase, deployed on AWS ECS with automated CI/CD.

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

## Tech Stack

-   **Frontend**: Next.js 15, React, TypeScript
-   **Styling**: Tailwind CSS, Shadcn/ui
-   **Database**: Supabase (PostgreSQL)
-   **ORM**: Drizzle ORM
-   **Authentication**: Supabase Auth
-   **File Storage**: Supabase Storage
-   **Deployment**: AWS ECS with Application Load Balancer
-   **CI/CD**: GitHub Actions with AWS SDK v3
-   **Container**: Docker with multi-stage builds

## Profile Picture Uploads

This project includes a secure profile picture upload system using Supabase Edge Functions:

-   ✅ **File Type Validation**: Only JPG, PNG, WebP, GIF, and SVG files allowed
-   ✅ **Size Limits**: Maximum 5MB file size
-   ✅ **Security**: Users can only upload/update their own avatars
-   ✅ **Real-time Preview**: See your new avatar before saving
-   ✅ **Automatic Optimization**: Images are optimized for web delivery

### Setup Profile Uploads

1. Navigate to the `../supabase-functions` directory
2. Run the setup script:

    ```bash
    # Windows
    setup.bat

    # Linux/Mac
    chmod +x setup.sh && ./setup.sh
    ```

3. Follow the prompts to deploy the Edge Function and storage bucket

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `pnpm dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

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

### Infrastructure Setup

The AWS infrastructure is defined in `aws-deployment/cloudformation-template.yaml`:

```bash
# Deploy infrastructure
aws cloudformation create-stack \
  --stack-name blog-app-infrastructure \
  --template-body file://aws-deployment/cloudformation-template.yaml \
  --capabilities CAPABILITY_IAM \
  --region us-east-2
```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/aws-deploy.yml`) provides:

#### Test Job

-   **Triggers**: Every push and pull request
-   **Steps**: Type checking, linting, build validation
-   **Package Manager**: pnpm (as configured)

#### Deploy Job

-   **Triggers**: Only on pushes to `main` branch
-   **Dependencies**: Waits for test job to pass

**Deployment Steps**:

1. **Build & Push**: Creates Docker image and pushes to ECR
2. **Task Definition**: Updates ECS task definition with new image
3. **IAM Verification**: Ensures required roles exist
4. **Health Check Update**: Configures ALB health check path
5. **Cleanup**: Removes old task definitions
6. **Deploy**: Updates ECS service with new task definition
7. **Verification**: Confirms deployment success

### Required GitHub Secrets

Configure these secrets in your GitHub repository:

```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

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

### Troubleshooting

Common issues and solutions:

1. **IAM Role Errors**: Pipeline automatically creates missing roles
2. **Health Check Failures**: ALB health check path is automatically updated
3. **Task Definition Conflicts**: Old definitions are automatically cleaned up
4. **Deployment Timeouts**: Extended timeout (15 minutes) with detailed logging

### Manual Deployment

If needed, you can manually deploy:

```bash
# Build and push image
docker build -t blog-app:latest .
docker tag blog-app:latest 423623853941.dkr.ecr.us-east-2.amazonaws.com/blog-app:latest
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 423623853941.dkr.ecr.us-east-2.amazonaws.com
docker push 423623853941.dkr.ecr.us-east-2.amazonaws.com/blog-app:latest

# Update ECS service
aws ecs update-service \
  --cluster bob-with-a-blog \
  --service blog-app-task-service-u66yqxeg \
  --force-new-deployment \
  --region us-east-2
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (pipeline will run automatically)
5. Submit a pull request

## License

MIT License - see LICENSE file for details
