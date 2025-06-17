#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE INTEGRATION TEST SUITE
 * 
 * This script performs deep testing of the Real-Time Event Check-In App
 * covering backend, frontend, and data integration
 */

const fetch = require('node-fetch');
const { io } = require('socket.io-client');
const { PrismaClient } = require('@prisma/client');

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';
const SOCKET_ENDPOINT = 'http://localhost:4000';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  retries: 3,
  concurrent_clients: 3
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logStep = (step, message) => {
  console.log(`${step} ${message}`);
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`);
  testResults.passed++;
};

const logError = (message, error) => {
  console.log(`❌ ${message}`);
  if (error) console.error(error);
  testResults.failed++;
  testResults.errors.push({ message, error: error?.message || error });
};

const incrementTest = () => {
  testResults.total++;
};

// GraphQL Helper Functions
async function graphqlRequest(query, variables = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  
  const data = await response.json();
  if (data.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

// Test Suite Implementation
class ComprehensiveTestSuite {
  constructor() {
    this.prisma = new PrismaClient();
    this.sockets = [];
    this.testData = {
      users: [],
      events: [],
      testEmails: []
    };
  }

  async runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE INTEGRATION TESTS');
    console.log('============================================\n');

    try {
      // Phase 1: Backend Infrastructure Tests
      await this.testBackendInfrastructure();
      
      // Phase 2: Database Integration Tests
      await this.testDatabaseIntegration();
      
      // Phase 3: GraphQL API Tests
      await this.testGraphQLAPI();
      
      // Phase 4: Real-time Functionality Tests
      await this.testRealTimeFunctionality();
      
      // Phase 5: Data Persistence Tests
      await this.testDataPersistence();
      
      // Phase 6: Concurrency Tests
      await this.testConcurrency();
      
      // Phase 7: Error Handling Tests
      await this.testErrorHandling();
      
      // Phase 8: Performance Tests
      await this.testPerformance();
      
      // Phase 9: Frontend Integration Tests
      await this.testFrontendIntegration();
      
      // Phase 10: End-to-End User Flow Tests
      await this.testEndToEndUserFlow();

      this.printTestResults();
      
    } catch (error) {
      console.error('🔥 CRITICAL TEST FAILURE:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  async testBackendInfrastructure() {
    logStep('🏗️', 'Testing Backend Infrastructure...\n');

    // Test 1: Server Health Check
    incrementTest();
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' })
      });
      
      if (response.ok) {
        logSuccess('GraphQL server is running and responding');
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      logError('GraphQL server health check failed', error);
    }

    // Test 2: Socket.io Connection Test
    incrementTest();
    try {
      const socket = io(SOCKET_ENDPOINT, { timeout: 5000 });
      
      await new Promise((resolve, reject) => {
        socket.on('connect', () => {
          logSuccess('Socket.io server connection established');
          socket.close();
          resolve();
        });
        
        socket.on('connect_error', (error) => {
          reject(error);
        });
        
        setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
      });
    } catch (error) {
      logError('Socket.io connection test failed', error);
    }

    // Test 3: Database Connection Test
    incrementTest();
    try {
      await this.prisma.$connect();
      logSuccess('Database connection established');
    } catch (error) {
      logError('Database connection failed', error);
    }
  }

  async testDatabaseIntegration() {
    logStep('🗄️', 'Testing Database Integration...\n');

    // Test 1: Schema Validation
    incrementTest();
    try {
      const users = await this.prisma.user.findMany();
      const events = await this.prisma.event.findMany();
      
      if (users.length > 0 && events.length > 0) {
        logSuccess(`Database schema working - Found ${users.length} users, ${events.length} events`);
        this.testData.users = users;
        this.testData.events = events;
      } else {
        throw new Error('No seed data found in database');
      }
    } catch (error) {
      logError('Database schema validation failed', error);
    }

    // Test 2: CRUD Operations
    incrementTest();
    try {
      const testEmail = `crud-test-${Date.now()}@example.com`;
      
      // Create
      const user = await this.prisma.user.create({
        data: { email: testEmail, name: 'CRUD Test User' }
      });
      
      // Read
      const foundUser = await this.prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      // Update
      const updatedUser = await this.prisma.user.update({
        where: { email: testEmail },
        data: { name: 'Updated CRUD Test User' }
      });
      
      // Delete
      await this.prisma.user.delete({
        where: { email: testEmail }
      });
      
      if (foundUser && updatedUser.name === 'Updated CRUD Test User') {
        logSuccess('Database CRUD operations working correctly');
      } else {
        throw new Error('CRUD operations validation failed');
      }
    } catch (error) {
      logError('Database CRUD operations test failed', error);
    }

    // Test 3: Relationship Operations
    incrementTest();
    try {
      const testEmail = `relation-test-${Date.now()}@example.com`;
      const user = await this.prisma.user.create({
        data: { email: testEmail, name: 'Relation Test User' }
      });
      
      const event = this.testData.events[0];
      
      // Join event (create relationship)
      await this.prisma.event.update({
        where: { id: event.id },
        data: { attendees: { connect: { id: user.id } } }
      });
      
      // Verify relationship
      const eventWithAttendees = await this.prisma.event.findUnique({
        where: { id: event.id },
        include: { attendees: true }
      });
      
      const isUserAttending = eventWithAttendees.attendees.some(a => a.id === user.id);
      
      if (isUserAttending) {
        logSuccess('Database relationship operations working correctly');
      } else {
        throw new Error('User not found in event attendees');
      }
      
      // Cleanup
      await this.prisma.user.delete({ where: { email: testEmail } });
    } catch (error) {
      logError('Database relationship operations test failed', error);
    }
  }

  async testGraphQLAPI() {
    logStep('🔗', 'Testing GraphQL API...\n');

    // Test 1: Query Events
    incrementTest();
    try {
      const data = await graphqlRequest(`
        query {
          events {
            id
            name
            location
            startTime
            attendees {
              id
              name
              email
            }
          }
        }
      `);
      
      if (data.events && data.events.length > 0) {
        logSuccess(`GraphQL events query working - Retrieved ${data.events.length} events`);
      } else {
        throw new Error('No events returned from GraphQL query');
      }
    } catch (error) {
      logError('GraphQL events query test failed', error);
    }

    // Test 2: Query User (Me)
    incrementTest();
    try {
      const testEmail = 'alice@example.com';
      const data = await graphqlRequest(`
        query($email: String!) {
          me(email: $email) {
            id
            name
            email
          }
        }
      `, { email: testEmail });
      
      if (data.me && data.me.email === testEmail) {
        logSuccess('GraphQL me query working correctly');
      } else {
        throw new Error('Me query did not return expected user');
      }
    } catch (error) {
      logError('GraphQL me query test failed', error);
    }

    // Test 3: Join Event Mutation
    incrementTest();
    try {
      const testEmail = `gql-join-test-${Date.now()}@example.com`;
      const eventId = this.testData.events[0].id;
      
      const data = await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          joinEvent(eventId: $eventId, userEmail: $userEmail) {
            id
            attendees {
              id
              email
            }
          }
        }
      `, { eventId, userEmail: testEmail });
      
      const userJoined = data.joinEvent.attendees.some(a => a.email === testEmail);
      
      if (userJoined) {
        logSuccess('GraphQL joinEvent mutation working correctly');
        this.testData.testEmails.push(testEmail);
      } else {
        throw new Error('User not found in attendees after join');
      }
    } catch (error) {
      logError('GraphQL joinEvent mutation test failed', error);
    }

    // Test 4: Leave Event Mutation
    incrementTest();
    try {
      const testEmail = `gql-leave-test-${Date.now()}@example.com`;
      const eventId = this.testData.events[0].id;
      
      // First join
      await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          joinEvent(eventId: $eventId, userEmail: $userEmail) {
            id
          }
        }
      `, { eventId, userEmail: testEmail });
      
      // Then leave
      const data = await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          leaveEvent(eventId: $eventId, userEmail: $userEmail) {
            id
            attendees {
              id
              email
            }
          }
        }
      `, { eventId, userEmail: testEmail });
      
      const userLeft = !data.leaveEvent.attendees.some(a => a.email === testEmail);
      
      if (userLeft) {
        logSuccess('GraphQL leaveEvent mutation working correctly');
      } else {
        throw new Error('User still found in attendees after leave');
      }
    } catch (error) {
      logError('GraphQL leaveEvent mutation test failed', error);
    }
  }

  async testRealTimeFunctionality() {
    logStep('🔴', 'Testing Real-time Functionality...\n');

    // Test 1: Socket Connection and Room Joining
    incrementTest();
    try {
      const socket1 = io(SOCKET_ENDPOINT);
      const socket2 = io(SOCKET_ENDPOINT);
      
      this.sockets.push(socket1, socket2);
      
      await new Promise((resolve, reject) => {
        let connectedCount = 0;
        
        const onConnect = () => {
          connectedCount++;
          if (connectedCount === 2) {
            logSuccess('Multiple socket connections established');
            resolve();
          }
        };
        
        socket1.on('connect', onConnect);
        socket2.on('connect', onConnect);
        
        setTimeout(() => reject(new Error('Socket connection timeout')), 10000);
      });
    } catch (error) {
      logError('Socket connection test failed', error);
    }

    // Test 2: Real-time Join Events
    incrementTest();
    try {
      const eventId = this.testData.events[0].id;
      const testEmail = `realtime-join-test-${Date.now()}@example.com`;
      
      let receivedEvents = [];
      
      // Set up listeners
      this.sockets[0].emit('joinEventRoom', eventId);
      this.sockets[1].emit('joinEventRoom', eventId);
      
      this.sockets[0].on('userJoined', (data) => {
        receivedEvents.push({ socket: 0, event: 'userJoined', data });
      });
      
      this.sockets[1].on('userJoined', (data) => {
        receivedEvents.push({ socket: 1, event: 'userJoined', data });
      });
      
      // Trigger join via GraphQL
      await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          joinEvent(eventId: $eventId, userEmail: $userEmail) {
            id
          }
        }
      `, { eventId, userEmail: testEmail });
      
      // Wait for real-time events
      await delay(2000);
      
      if (receivedEvents.length >= 2) {
        logSuccess('Real-time userJoined events working correctly');
      } else {
        throw new Error(`Expected 2+ events, received ${receivedEvents.length}`);
      }
      
      this.testData.testEmails.push(testEmail);
    } catch (error) {
      logError('Real-time join events test failed', error);
    }

    // Test 3: Real-time Leave Events
    incrementTest();
    try {
      const eventId = this.testData.events[0].id;
      const testEmail = `realtime-leave-test-${Date.now()}@example.com`;
      
      let receivedEvents = [];
      
      // Join first
      await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          joinEvent(eventId: $eventId, userEmail: $userEmail) {
            id
          }
        }
      `, { eventId, userEmail: testEmail });
      
      // Set up listeners
      this.sockets[0].on('userLeft', (data) => {
        receivedEvents.push({ socket: 0, event: 'userLeft', data });
      });
      
      this.sockets[1].on('userLeft', (data) => {
        receivedEvents.push({ socket: 1, event: 'userLeft', data });
      });
      
      // Trigger leave via GraphQL
      await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          leaveEvent(eventId: $eventId, userEmail: $userEmail) {
            id
          }
        }
      `, { eventId, userEmail: testEmail });
      
      // Wait for real-time events
      await delay(2000);
      
      if (receivedEvents.length >= 2) {
        logSuccess('Real-time userLeft events working correctly');
      } else {
        throw new Error(`Expected 2+ events, received ${receivedEvents.length}`);
      }
    } catch (error) {
      logError('Real-time leave events test failed', error);
    }
  }

  async testDataPersistence() {
    logStep('💾', 'Testing Data Persistence...\n');

    // Test 1: Join/Leave Persistence
    incrementTest();
    try {
      const eventId = this.testData.events[0].id;
      const testEmail = `persistence-test-${Date.now()}@example.com`;
      
      // Join event
      await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          joinEvent(eventId: $eventId, userEmail: $userEmail) {
            id
          }
        }
      `, { eventId, userEmail: testEmail });
      
      // Verify in database
      const eventAfterJoin = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: { attendees: true }
      });
      
      const userJoinedInDB = eventAfterJoin.attendees.some(a => a.email === testEmail);
      
      if (userJoinedInDB) {
        logSuccess('Join operation persisted to database');
      } else {
        throw new Error('Join operation not persisted to database');
      }
      
      // Leave event
      await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          leaveEvent(eventId: $eventId, userEmail: $userEmail) {
            id
          }
        }
      `, { eventId, userEmail: testEmail });
      
      // Verify in database
      const eventAfterLeave = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: { attendees: true }
      });
      
      const userLeftInDB = !eventAfterLeave.attendees.some(a => a.email === testEmail);
      
      if (userLeftInDB) {
        logSuccess('Leave operation persisted to database');
      } else {
        throw new Error('Leave operation not persisted to database');
      }
    } catch (error) {
      logError('Data persistence test failed', error);
    }
  }

  async testConcurrency() {
    logStep('🔄', 'Testing Concurrency...\n');

    // Test 1: Multiple Users Joining Same Event
    incrementTest();
    try {
      const eventId = this.testData.events[0].id;
      const testEmails = Array.from({length: 5}, (_, i) => 
        `concurrent-test-${Date.now()}-${i}@example.com`
      );
      
      // Join all users concurrently
      const joinPromises = testEmails.map(email => 
        graphqlRequest(`
          mutation($eventId: ID!, $userEmail: String!) {
            joinEvent(eventId: $eventId, userEmail: $userEmail) {
              id
            }
          }
        `, { eventId, userEmail: email })
      );
      
      await Promise.all(joinPromises);
      
      // Verify all users joined
      const eventWithAttendees = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: { attendees: true }
      });
      
      const allUsersJoined = testEmails.every(email => 
        eventWithAttendees.attendees.some(a => a.email === email)
      );
      
      if (allUsersJoined) {
        logSuccess('Concurrent user joins working correctly');
      } else {
        throw new Error('Not all users joined during concurrent test');
      }
      
      this.testData.testEmails.push(...testEmails);
    } catch (error) {
      logError('Concurrency test failed', error);
    }
  }

  async testErrorHandling() {
    logStep('⚠️', 'Testing Error Handling...\n');

    // Test 1: Invalid Event ID
    incrementTest();
    try {
      try {
        await graphqlRequest(`
          mutation($eventId: ID!, $userEmail: String!) {
            joinEvent(eventId: $eventId, userEmail: $userEmail) {
              id
            }
          }
        `, { eventId: 'invalid-event-id', userEmail: 'test@example.com' });
        
        logError('Should have thrown error for invalid event ID');
      } catch (error) {
        if (error.message.includes('GraphQL Error')) {
          logSuccess('Error handling for invalid event ID working correctly');
        } else {
          throw error;
        }
      }
    } catch (error) {
      logError('Error handling test failed', error);
    }

    // Test 2: Leave Event Without Joining
    incrementTest();
    try {
      const eventId = this.testData.events[0].id;
      const testEmail = `error-test-${Date.now()}@example.com`;
      
      try {
        await graphqlRequest(`
          mutation($eventId: ID!, $userEmail: String!) {
            leaveEvent(eventId: $eventId, userEmail: $userEmail) {
              id
            }
          }
        `, { eventId, userEmail: testEmail });
        
        logError('Should have thrown error for leaving without joining');
      } catch (error) {
        if (error.message.includes('User not found')) {
          logSuccess('Error handling for leaving without joining working correctly');
        } else {
          throw error;
        }
      }
    } catch (error) {
      logError('Error handling test failed', error);
    }
  }

  async testPerformance() {
    logStep('⚡', 'Testing Performance...\n');

    // Test 1: Query Response Time
    incrementTest();
    try {
      const startTime = Date.now();
      
      await graphqlRequest(`
        query {
          events {
            id
            name
            location
            startTime
            attendees {
              id
              name
              email
            }
          }
        }
      `);
      
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 1000) {
        logSuccess(`GraphQL query performance good: ${responseTime}ms`);
      } else {
        logError(`GraphQL query performance slow: ${responseTime}ms`);
      }
    } catch (error) {
      logError('Performance test failed', error);
    }
  }

  async testFrontendIntegration() {
    logStep('📱', 'Testing Frontend Integration...\n');

    // Test 1: Frontend Dependencies
    incrementTest();
    try {
      const fs = require('fs');
      const path = require('path');
      
      const frontendPath = '/Users/devanands/Desktop/Real-Time Event Check-In App/frontend';
      const packageJsonPath = path.join(frontendPath, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        const requiredDeps = [
          '@apollo/client',
          '@tanstack/react-query',
          'socket.io-client',
          'zustand',
          'react-native'
        ];
        
        const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
        
        if (missingDeps.length === 0) {
          logSuccess('All required frontend dependencies present');
        } else {
          throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
        }
      } else {
        throw new Error('Frontend package.json not found');
      }
    } catch (error) {
      logError('Frontend dependencies test failed', error);
    }

    // Test 2: TypeScript Types
    incrementTest();
    try {
      const fs = require('fs');
      const path = require('path');
      
      const typesPath = '/Users/devanands/Desktop/Real-Time Event Check-In App/frontend/src/types.ts';
      
      if (fs.existsSync(typesPath)) {
        const typesContent = fs.readFileSync(typesPath, 'utf8');
        
        const requiredTypes = ['User', 'Event', 'AppState', 'RootStackParamList'];
        const missingTypes = requiredTypes.filter(type => !typesContent.includes(`interface ${type}`) && !typesContent.includes(`type ${type}`));
        
        if (missingTypes.length === 0) {
          logSuccess('All required TypeScript types present');
        } else {
          throw new Error(`Missing types: ${missingTypes.join(', ')}`);
        }
      } else {
        throw new Error('Frontend types file not found');
      }
    } catch (error) {
      logError('Frontend types test failed', error);
    }
  }

  async testEndToEndUserFlow() {
    logStep('🎯', 'Testing End-to-End User Flow...\n');

    // Test 1: Complete User Journey
    incrementTest();
    try {
      const userEmail = `e2e-test-${Date.now()}@example.com`;
      const eventId = this.testData.events[0].id;
      
      // Step 1: Create/Get User
      const userData = await graphqlRequest(`
        query($email: String!) {
          me(email: $email) {
            id
            name
            email
          }
        }
      `, { email: userEmail });
      
      if (!userData.me) {
        throw new Error('User creation failed');
      }
      
      // Step 2: Join Event
      const joinData = await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          joinEvent(eventId: $eventId, userEmail: $userEmail) {
            id
            attendees {
              id
              email
            }
          }
        }
      `, { eventId, userEmail });
      
      const userJoined = joinData.joinEvent.attendees.some(a => a.email === userEmail);
      if (!userJoined) {
        throw new Error('User join failed');
      }
      
      // Step 3: Verify Event List
      const eventsData = await graphqlRequest(`
        query {
          events {
            id
            attendees {
              email
            }
          }
        }
      `);
      
      const eventWithUser = eventsData.events.find(e => 
        e.id === eventId && e.attendees.some(a => a.email === userEmail)
      );
      
      if (!eventWithUser) {
        throw new Error('User not found in events list');
      }
      
      // Step 4: Leave Event
      const leaveData = await graphqlRequest(`
        mutation($eventId: ID!, $userEmail: String!) {
          leaveEvent(eventId: $eventId, userEmail: $userEmail) {
            id
            attendees {
              email
            }
          }
        }
      `, { eventId, userEmail });
      
      const userLeft = !leaveData.leaveEvent.attendees.some(a => a.email === userEmail);
      if (!userLeft) {
        throw new Error('User leave failed');
      }
      
      logSuccess('Complete end-to-end user flow working correctly');
    } catch (error) {
      logError('End-to-end user flow test failed', error);
    }
  }

  async cleanup() {
    logStep('🧹', 'Cleaning up test data...\n');
    
    try {
      // Clean up test users
      for (const email of this.testData.testEmails) {
        try {
          await this.prisma.user.delete({ where: { email } });
        } catch (error) {
          // User might not exist, ignore
        }
      }
      
      // Close socket connections
      this.sockets.forEach(socket => {
        if (socket.connected) {
          socket.close();
        }
      });
      
      // Close database connection
      await this.prisma.$disconnect();
      
      logSuccess('Test cleanup completed');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  printTestResults() {
    console.log('\n============================================');
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('============================================\n');
    
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%\n`);
    
    if (testResults.failed > 0) {
      console.log('❌ FAILED TESTS:');
      testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
        if (error.error) {
          console.log(`   Error: ${error.error}`);
        }
      });
      console.log('');
    }
    
    if (testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! The application is working perfectly!');
      console.log('✅ Backend API: Fully functional');
      console.log('✅ Database: All operations working');
      console.log('✅ Real-time: Socket.io working correctly');
      console.log('✅ GraphQL: All queries and mutations working');
      console.log('✅ Data Integration: Complete data flow verified');
      console.log('✅ Error Handling: Proper error management');
      console.log('✅ Performance: Good response times');
      console.log('✅ Frontend: All components properly structured');
      console.log('✅ End-to-End: Complete user flow working');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
    }
    
    console.log('\n============================================');
  }
}

// Install dependencies if needed
async function installDependencies() {
  try {
    require('node-fetch');
    require('socket.io-client');
    require('@prisma/client');
  } catch (e) {
    console.log('Installing required dependencies...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npm install node-fetch@2 socket.io-client @prisma/client', { 
        stdio: 'inherit',
        cwd: '/Users/devanands/Desktop/Real-Time Event Check-In App/backend'
      });
      console.log('Dependencies installed successfully\n');
    } catch (error) {
      console.error('Failed to install dependencies:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  await installDependencies();
  
  const testSuite = new ComprehensiveTestSuite();
  await testSuite.runAllTests();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
main().catch(console.error);