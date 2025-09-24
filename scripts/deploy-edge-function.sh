#!/bin/bash

# Deploy Supabase Edge Function for Image Validation
# Make sure you have Supabase CLI installed and are logged in

echo "🚀 Deploying Supabase Edge Function: validate-image"

# Check if Supabase CLI is available via npx
if ! npx supabase --version &> /dev/null; then
    echo "❌ Supabase CLI is not available. Please ensure Node.js and npm are installed."
    exit 1
fi

# Check if user is logged in
if ! npx supabase projects list &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "npx supabase login"
    exit 1
fi

# Deploy the function
echo "📦 Deploying validate-image function..."
npx supabase functions deploy validate-image

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed validate-image function!"
    echo ""
    echo "🔗 Function URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/validate-image"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your environment variables with the function URL"
    echo "2. Test the function with your image uploads"
    echo "3. Monitor function logs in Supabase dashboard"
else
    echo "❌ Failed to deploy function. Please check your Supabase configuration."
    exit 1
fi
