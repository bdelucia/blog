@echo off
REM Deploy Supabase Edge Function for Image Validation
REM Make sure you have Supabase CLI installed and are logged in

echo 🚀 Deploying Supabase Edge Function: validate-image

REM Deploy the function
echo 📦 Deploying validate-image function...
npx supabase functions deploy validate-image

if %ERRORLEVEL% EQU 0 (
    echo ✅ Successfully deployed validate-image function!
    echo.
    echo 🔗 Function URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/validate-image
    echo.
    echo 📝 Next steps:
    echo 1. Update your environment variables with the function URL
    echo 2. Test the function with your image uploads
    echo 3. Monitor function logs in Supabase dashboard
) else (
    echo ❌ Failed to deploy function. Please check your Supabase configuration.
    pause
    exit /b 1
)

pause
