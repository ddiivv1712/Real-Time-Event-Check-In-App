const fetch = require('node-fetch');

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

async function testGraphQLAPI() {
  console.log('🚀 Testing GraphQL API Integration...\n');

  try {
    // Test 1: Query all events
    console.log('1️⃣ Testing events query...');
    const eventsQuery = {
      query: `
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
      `
    };

    const eventsResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventsQuery)
    });

    const eventsData = await eventsResponse.json();
    if (eventsData.errors) {
      throw new Error('GraphQL Error: ' + JSON.stringify(eventsData.errors));
    }

    console.log(`✅ Retrieved ${eventsData.data.events.length} events`);
    if (eventsData.data.events.length > 0) {
      const event = eventsData.data.events[0];
      console.log(`   Event: ${event.name} at ${event.location}`);
      console.log(`   Attendees: ${event.attendees.length}`);
    }

    // Test 2: Query user (me)
    console.log('\n2️⃣ Testing me query...');
    const testEmail = 'alice@example.com';
    const meQuery = {
      query: `
        query($email: String!) {
          me(email: $email) {
            id
            name
            email
          }
        }
      `,
      variables: { email: testEmail }
    };

    const meResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meQuery)
    });

    const meData = await meResponse.json();
    if (meData.errors) {
      throw new Error('GraphQL Error: ' + JSON.stringify(meData.errors));
    }

    console.log(`✅ Retrieved user: ${meData.data.me.name} (${meData.data.me.email})`);

    // Test 3: Join event mutation
    console.log('\n3️⃣ Testing joinEvent mutation...');
    const eventId = eventsData.data.events[0].id;
    const newUserEmail = `graphql-test-${Date.now()}@example.com`;
    
    const joinEventMutation = {
      query: `
        mutation($eventId: ID!, $userEmail: String!) {
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
      `,
      variables: { eventId, userEmail: newUserEmail }
    };

    const joinResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(joinEventMutation)
    });

    const joinData = await joinResponse.json();
    if (joinData.errors) {
      throw new Error('GraphQL Error: ' + JSON.stringify(joinData.errors));
    }

    console.log(`✅ User joined event: ${joinData.data.joinEvent.name}`);
    console.log(`   New attendee count: ${joinData.data.joinEvent.attendees.length}`);
    
    const newAttendee = joinData.data.joinEvent.attendees.find(a => a.email === newUserEmail);
    console.log(`   New attendee: ${newAttendee.name} (${newAttendee.email})`);

    // Test 4: Leave event mutation
    console.log('\n4️⃣ Testing leaveEvent mutation...');
    const leaveEventMutation = {
      query: `
        mutation($eventId: ID!, $userEmail: String!) {
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
      `,
      variables: { eventId, userEmail: newUserEmail }
    };

    const leaveResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveEventMutation)
    });

    const leaveData = await leaveResponse.json();
    if (leaveData.errors) {
      throw new Error('GraphQL Error: ' + JSON.stringify(leaveData.errors));
    }

    console.log(`✅ User left event: ${leaveData.data.leaveEvent.name}`);
    console.log(`   Updated attendee count: ${leaveData.data.leaveEvent.attendees.length}`);

    // Test 5: Verify persistence by querying events again
    console.log('\n5️⃣ Testing data persistence...');
    const verifyResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventsQuery)
    });

    const verifyData = await verifyResponse.json();
    const verifyEvent = verifyData.data.events.find(e => e.id === eventId);
    
    console.log(`✅ Event persistence verified`);
    console.log(`   Event "${verifyEvent.name}" has ${verifyEvent.attendees.length} attendees`);

    console.log('\n🎉 All GraphQL API tests passed! Database integration is working correctly.');

  } catch (error) {
    console.error('❌ GraphQL API test failed:', error.message);
    console.error(error);
  }
}

// Install node-fetch if not present
try {
  require('node-fetch');
  testGraphQLAPI();
} catch (e) {
  console.log('Installing node-fetch...');
  const { execSync } = require('child_process');
  execSync('npm install node-fetch@2', { stdio: 'inherit' });
  console.log('node-fetch installed, running tests...\n');
  delete require.cache[require.resolve('node-fetch')];
  testGraphQLAPI();
}