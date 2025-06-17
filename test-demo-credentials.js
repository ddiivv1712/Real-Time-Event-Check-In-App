const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

// Test configuration
const SERVER_URL = 'http://localhost:4000';
const GRAPHQL_ENDPOINT = `${SERVER_URL}/graphql`;

// Demo credentials from seed.ts
const DEMO_USERS = [
  { name: 'Alice Johnson', email: 'alice@example.com' },
  { name: 'Bob Smith', email: 'bob@example.com' },
  { name: 'Charlie Brown', email: 'charlie@example.com' }
];

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test query execution
    const users = await prisma.user.findMany();
    const events = await prisma.event.findMany({ include: { attendees: true } });
    
    console.log(`✅ Found ${users.length} users in database`);
    console.log(`✅ Found ${events.length} events in database`);
    
    // Verify demo users exist
    let foundDemoUsers = 0;
    for (const demoUser of DEMO_USERS) {
      const user = await prisma.user.findUnique({ where: { email: demoUser.email } });
      if (user) {
        console.log(`✅ Demo user found: ${user.name} (${user.email})`);
        foundDemoUsers++;
      } else {
        console.log(`❌ Demo user missing: ${demoUser.email}`);
      }
    }
    
    console.log(`\n📊 Demo users status: ${foundDemoUsers}/${DEMO_USERS.length} found`);
    return foundDemoUsers === DEMO_USERS.length;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testServerHealth() {
  console.log('\n🏥 Testing Server Health...\n');
  
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const health = await response.json();
    
    if (response.ok) {
      console.log('✅ Server health check passed');
      console.log(`   Status: ${health.status}`);
      console.log(`   Database: ${health.database}`);
      console.log(`   Timestamp: ${health.timestamp}`);
      return true;
    } else {
      console.log('❌ Server health check failed');
      console.log(`   Status: ${health.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
}

async function testGraphQLEndpoint() {
  console.log('\n🔗 Testing GraphQL Endpoint...\n');
  
  try {
    const query = `
      query {
        events {
          id
          name
          location
          attendees {
            id
            name
            email
          }
        }
      }
    `;
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const result = await response.json();
    
    if (response.ok && !result.errors) {
      console.log('✅ GraphQL endpoint is working');
      console.log(`✅ Retrieved ${result.data.events.length} events`);
      
      // Show some sample data
      if (result.data.events.length > 0) {
        const event = result.data.events[0];
        console.log(`   Sample event: "${event.name}" at ${event.location}`);
        console.log(`   Attendees: ${event.attendees.length}`);
      }
      
      return result.data.events;
    } else {
      console.error('❌ GraphQL query failed:', result.errors || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('❌ GraphQL endpoint test failed:', error.message);
    return null;
  }
}

async function testUserAuthentication(email) {
  console.log(`\n👤 Testing User Authentication: ${email}...\n`);
  
  try {
    const query = `
      query GetUser($email: String!) {
        me(email: $email) {
          id
          name
          email
        }
      }
    `;
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query,
        variables: { email }
      }),
    });
    
    const result = await response.json();
    
    if (response.ok && !result.errors && result.data.me) {
      const user = result.data.me;
      console.log(`✅ Authentication successful for ${email}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      return user;
    } else {
      console.error(`❌ Authentication failed for ${email}:`, result.errors || 'User not found');
      return null;
    }
  } catch (error) {
    console.error(`❌ Authentication test failed for ${email}:`, error.message);
    return null;
  }
}

async function testEventJoinLeave(user, events) {
  console.log(`\n🎪 Testing Event Join/Leave for ${user.email}...\n`);
  
  if (!events || events.length === 0) {
    console.log('❌ No events available for testing');
    return false;
  }
  
  const testEvent = events[0];
  
  try {
    // Test joining an event
    console.log(`📝 Testing join event: "${testEvent.name}"`);
    
    const joinMutation = `
      mutation JoinEvent($eventId: ID!, $userEmail: String!) {
        joinEvent(eventId: $eventId, userEmail: $userEmail) {
          id
          name
          attendees {
            id
            name
            email
          }
        }
      }
    `;
    
    const joinResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: joinMutation,
        variables: {
          eventId: testEvent.id,
          userEmail: user.email
        }
      }),
    });
    
    const joinResult = await joinResponse.json();
    
    if (joinResponse.ok && !joinResult.errors) {
      const updatedEvent = joinResult.data.joinEvent;
      const userJoined = updatedEvent.attendees.some(attendee => attendee.email === user.email);
      
      console.log(`✅ Join event successful`);
      console.log(`   Event now has ${updatedEvent.attendees.length} attendees`);
      console.log(`   User in attendees list: ${userJoined ? 'YES' : 'NO'}`);
      
      // Test leaving the event
      console.log(`\n📤 Testing leave event: "${testEvent.name}"`);
      
      const leaveMutation = `
        mutation LeaveEvent($eventId: ID!, $userEmail: String!) {
          leaveEvent(eventId: $eventId, userEmail: $userEmail) {
            id
            name
            attendees {
              id
              name
              email
            }
          }
        }
      `;
      
      const leaveResponse = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: leaveMutation,
          variables: {
            eventId: testEvent.id,
            userEmail: user.email
          }
        }),
      });
      
      const leaveResult = await leaveResponse.json();
      
      if (leaveResponse.ok && !leaveResult.errors) {
        const finalEvent = leaveResult.data.leaveEvent;
        const userLeft = !finalEvent.attendees.some(attendee => attendee.email === user.email);
        
        console.log(`✅ Leave event successful`);
        console.log(`   Event now has ${finalEvent.attendees.length} attendees`);
        console.log(`   User removed from attendees: ${userLeft ? 'YES' : 'NO'}`);
        
        return userJoined && userLeft;
      } else {
        console.error('❌ Leave event failed:', leaveResult.errors);
        return false;
      }
    } else {
      console.error('❌ Join event failed:', joinResult.errors);
      return false;
    }
  } catch (error) {
    console.error('❌ Event join/leave test failed:', error.message);
    return false;
  }
}

async function testNewUserCreation() {
  console.log('\n🆕 Testing New User Creation...\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  
  try {
    const user = await testUserAuthentication(testEmail);
    
    if (user) {
      console.log(`✅ New user creation successful`);
      console.log(`   Created user with auto-generated name: ${user.name}`);
      
      // Verify user was actually saved to database
      const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
      if (dbUser) {
        console.log(`✅ User persisted to database: ${dbUser.name} (${dbUser.email})`);
        return true;
      } else {
        console.log(`❌ User not found in database after creation`);
        return false;
      }
    } else {
      console.log(`❌ New user creation failed`);
      return false;
    }
  } catch (error) {
    console.error('❌ New user creation test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 DEMO CREDENTIALS & DATABASE CONNECTIVITY TEST\n');
  console.log('='.repeat(60));
  
  const results = {
    database: false,
    server: false,
    graphql: false,
    authentication: 0,
    eventOperations: 0,
    newUser: false
  };
  
  try {
    // Test 1: Database Connection
    results.database = await testDatabaseConnection();
    
    // Test 2: Server Health
    results.server = await testServerHealth();
    
    // Test 3: GraphQL Endpoint
    const events = await testGraphQLEndpoint();
    results.graphql = events !== null;
    
    // Test 4: Demo User Authentication
    let authenticatedUsers = [];
    for (const demoUser of DEMO_USERS) {
      const user = await testUserAuthentication(demoUser.email);
      if (user) {
        results.authentication++;
        authenticatedUsers.push(user);
      }
    }
    
    // Test 5: Event Join/Leave Operations
    if (authenticatedUsers.length > 0 && events) {
      for (const user of authenticatedUsers.slice(0, 2)) { // Test with first 2 users
        const success = await testEventJoinLeave(user, events);
        if (success) results.eventOperations++;
      }
    }
    
    // Test 6: New User Creation
    results.newUser = await testNewUserCreation();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`🗄️  Database Connection: ${results.database ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🏥 Server Health: ${results.server ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🔗 GraphQL Endpoint: ${results.graphql ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`👤 Demo User Authentication: ${results.authentication}/${DEMO_USERS.length} ${results.authentication === DEMO_USERS.length ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🎪 Event Operations: ${results.eventOperations}/${Math.min(2, authenticatedUsers.length)} ${results.eventOperations > 0 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🆕 New User Creation: ${results.newUser ? '✅ PASSED' : '❌ FAILED'}`);
    
    const totalTests = 6;
    const passedTests = [
      results.database,
      results.server,
      results.graphql,
      results.authentication === DEMO_USERS.length,
      results.eventOperations > 0,
      results.newUser
    ].filter(Boolean).length;
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! Demo credentials are working and database is connected.');
      console.log('\n📋 Demo Credentials Summary:');
      DEMO_USERS.forEach(user => {
        console.log(`   • ${user.name}: ${user.email}`);
      });
      console.log('\n💡 You can use any of these emails to login to the application.');
      console.log('💡 The system will also create new users automatically if you use a new email.');
    } else {
      console.log('\n❌ Some tests failed. Please check the errors above and ensure:');
      console.log('   • The backend server is running (npm run dev)');
      console.log('   • The database is properly configured and accessible');
      console.log('   • All dependencies are installed (npm install)');
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed with error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if server is running before starting tests
async function checkServerRunning() {
  try {
    const response = await fetch(`${SERVER_URL}/health`, { timeout: 5000 });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  const isServerRunning = await checkServerRunning();
  
  if (!isServerRunning) {
    console.log('⚠️  Backend server is not running!');
    console.log('Please start the server first:');
    console.log('   cd backend && npm run dev');
    console.log('\nThen run this test again.');
    return;
  }
  
  await runAllTests();
}

main();