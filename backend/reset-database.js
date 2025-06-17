#!/usr/bin/env node

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function resetDatabase() {
  console.log('🔄 Starting database reset...');
  
  try {
    // Step 1: Reset Prisma database
    console.log('\n1️⃣ Resetting Prisma database...');
    execSync('npx prisma db push --force-reset', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    // Step 2: Generate Prisma client
    console.log('\n2️⃣ Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    // Step 3: Test database connection
    console.log('\n3️⃣ Testing database connection...');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      // Test basic operations
      const userCount = await prisma.user.count();
      const eventCount = await prisma.event.count();
      console.log(`📊 Current state: ${userCount} users, ${eventCount} events`);
      
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      throw dbError;
    } finally {
      await prisma.$disconnect();
    }
    
    // Step 4: Seed database
    console.log('\n4️⃣ Seeding database...');
    execSync('npm run db:setup', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('ℹ️  You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Database reset failed:', error.message);
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 It looks like the database doesn\'t exist.');
      console.log('Please create the database first:');
      console.log('1. Connect to PostgreSQL: psql -U devanands');
      console.log('2. Create database: CREATE DATABASE events_db;');
      console.log('3. Run this script again');
    }
    
    process.exit(1);
  }
}

resetDatabase();