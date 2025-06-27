#!/usr/bin/env node

/**
 * Production Build Script for Mars Explorer Frontend
 * Validates environment variables and builds the application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvironment() {
  log('🔍 Validating environment variables...', 'blue');
  
  const requiredVars = [
    'VITE_API_BASE_URL'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    log('❌ Missing required environment variables:', 'red');
    missingVars.forEach(varName => {
      log(`   - ${varName}`, 'red');
    });
    log('\n💡 Please set these variables in your deployment environment.', 'yellow');
    log('   For Vercel: Use the dashboard or vercel env command', 'yellow');
    log('   For local: Create a .env.local file', 'yellow');
    process.exit(1);
  }
  
  log('✅ Environment variables validated', 'green');
  
  // Log current configuration (without sensitive data)
  log('\n📋 Current configuration:', 'blue');
  log(`   API Base URL: ${process.env.VITE_API_BASE_URL}`, 'blue');
  log(`   Node Environment: ${process.env.NODE_ENV || 'development'}`, 'blue');
}

function buildApplication() {
  log('\n🏗️  Building application...', 'blue');
  
  try {
    // Run TypeScript check
    log('   Running TypeScript check...', 'yellow');
    execSync('npx tsc -b', { stdio: 'inherit' });
    
    // Run Vite build
    log('   Running Vite build...', 'yellow');
    execSync('npx vite build', { stdio: 'inherit' });
    
    log('✅ Build completed successfully!', 'green');
    
    // Check if dist directory exists and has files
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      log(`📦 Generated ${files.length} files in dist/`, 'green');
    }
    
  } catch (error) {
    log('❌ Build failed!', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function main() {
  log('🚀 Mars Explorer - Production Build', 'green');
  log('=====================================\n', 'green');
  
  validateEnvironment();
  buildApplication();
  
  log('\n🎉 Production build ready for deployment!', 'green');
  log('📁 Files are in the dist/ directory', 'blue');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, buildApplication };
