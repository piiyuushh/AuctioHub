#!/usr/bin/env node

/**
 * Deployment verification script
 * Run this after setting up environment variables to verify everything is configured correctly
 */

const https = require('https');

const VERCEL_PROJECT_URL = process.env.VERCEL_URL || 'YOUR_VERCEL_URL_HERE';

console.log('🔍 Deployment Configuration Check\n');

// Check local environment variables
console.log('📋 Local Environment Variables:');
console.log('✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : '❌ Missing');
console.log('✓ CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Set' : '❌ Missing');

console.log('\n🚀 Next Steps:');
console.log('1. ✅ Set environment variables in Vercel dashboard');
console.log('2. ✅ Configure Clerk dashboard with your domain');
console.log('3. ✅ Redeploy your application');
console.log('4. 🧪 Test authentication');

console.log('\n📝 To redeploy in Vercel:');
console.log('• Go to your Vercel dashboard');
console.log('• Navigate to Deployments tab');
console.log('• Click the three dots (⋯) on your latest deployment');
console.log('• Select "Redeploy"');

console.log('\n🧪 After redeployment, test these URLs:');
console.log(`• ${VERCEL_PROJECT_URL}/sign-up`);
console.log(`• ${VERCEL_PROJECT_URL}/sign-in`);
console.log(`• ${VERCEL_PROJECT_URL}/clerk-status`);

console.log('\n✨ Success indicators:');
console.log('• Authentication pages show Clerk forms (not "Setup Required")');
console.log('• You can create test accounts');
console.log('• Header shows user profile button');
console.log('• No "MIDDLEWARE_INVOCATION_FAILED" errors');
