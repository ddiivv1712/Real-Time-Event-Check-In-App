#!/usr/bin/env node

async function testBackend() {
  try {
    // First install graphql-request if not available
    let request, gql;
    try {
      const graphqlRequest = require('graphql-request');
      request = graphqlRequest.request;
      gql = graphqlRequest.gql;
    } catch (err) {
      console.log('📦 Installing graphql-request...');
      const { execSync } = require('child_process');
      execSync('npm install graphql-request graphql --no-save', { stdio: 'inherit' });
      const graphqlRequest = require('graphql-request');
      request = graphqlRequest.request;
      gql = graphqlRequest.gql;
    }

    const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

    console.log('🔍 Testing GraphQL endpoint:', GRAPHQL_ENDPOINT);
    
    // Test 1: Get Events
    console.log('\n1️⃣ Testing GET_EVENTS query...');
    const GET_EVENTS = gql`
      query GetEvents {
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
    `;

    const eventsData = await request(GRAPHQL_ENDPOINT, GET_EVENTS);
    console.log('✅ GET_EVENTS successful!');
    console.log(`📊 Found ${eventsData.events.length} events`);
    
    // Test 2: Test User Creation/Retrieval
    console.log('\n2️⃣ Testing ME query...');
    const GET_ME = gql`
      query GetMe($email: String!) {
        me(email: $email) {
          id
          name
          email
        }
      }
    `;

    const testEmail = 'test@example.com';
    const userData = await request(GRAPHQL_ENDPOINT, GET_ME, { email: testEmail });
    console.log('✅ ME query successful!');
    console.log(`👤 User: ${userData.me.name} (${userData.me.email})`);

    // Test 3: Test Join Event Mutation
    if (eventsData.events.length > 0) {
      const testEventId = eventsData.events[0].id;
      console.log('\n3️⃣ Testing JOIN_EVENT mutation...');
      
      const JOIN_EVENT = gql`
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

      const joinResult = await request(GRAPHQL_ENDPOINT, JOIN_EVENT, {
        eventId: testEventId,
        userEmail: testEmail
      });
      console.log('✅ JOIN_EVENT successful!');
      console.log(`🎉 Joined event: ${joinResult.joinEvent.name}`);
      console.log(`👥 Total attendees: ${joinResult.joinEvent.attendees.length}`);

      // Test 4: Test Leave Event Mutation
      console.log('\n4️⃣ Testing LEAVE_EVENT mutation...');
      
      const LEAVE_EVENT = gql`
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

      const leaveResult = await request(GRAPHQL_ENDPOINT, LEAVE_EVENT, {
        eventId: testEventId,
        userEmail: testEmail
      });
      console.log('✅ LEAVE_EVENT successful!');
      console.log(`👋 Left event: ${leaveResult.leaveEvent.name}`);
      console.log(`👥 Remaining attendees: ${leaveResult.leaveEvent.attendees.length}`);
    }

    console.log('\n🎯 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Backend test failed:');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('GraphQL errors:', error.response.errors);
      console.error('Response status:', error.response.status);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Connection refused - make sure the backend server is running on port 4000');
      console.error('Run: cd backend && npm run dev');
    }
    
    process.exit(1);
  }
}

testBackend();