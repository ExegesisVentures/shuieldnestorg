#!/bin/bash

# Script to set up Vercel environment variables
# Run: ./vercel-env-setup.sh

echo "Setting up Vercel environment variables..."

vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview

echo "Done! Now redeploy your project."

