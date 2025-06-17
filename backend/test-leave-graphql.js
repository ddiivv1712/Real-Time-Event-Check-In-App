const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLeaveEventViaGraphQL() {
  console.log('🌐 Testing LEAVE EVENT via GraphQL API...');
  console.log('='.repeat(60));

  try {
    // Step 1: Get existing events
    console.log('\n1️⃣ Getting events via GraphQL...');
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

    const eventsResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventsQuery)
    });

    const eventsData = await eventsResponse.json();
    if (eventsData.errors) {
      throw new Error(`GraphQL Error: ${eventsData.errors[0].message}`);
    }

    const events = eventsData.data.events;
    console.log(`✅ Found ${events.length} events via GraphQL`);
    
    if (events.length === 0) {
      throw new Error('No events available for testing');
    }

    const testEvent = events[0];
    console.log(`✅ Using event: "${testEvent.name}"`);
    console.log(`   Initial attendees: ${testEvent.attendees.length}`);

    // Step 2: Create test user via GraphQL (joinEvent creates user if not exists)
    console.log('\n2️⃣ Creating test user and joining event via GraphQL...');
    const testEmail = `graphql-leave-test-${Date.now()}@example.com`;
    
    const joinMutation = {
      query: `
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
      `,
      variables: {
        eventId: testEvent.id,
        userEmail: testEmail
      }
    };

    const joinResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(joinMutation)
    });

    const joinData = await joinResponse.json();
    if (joinData.errors) {
      throw new Error(`Join Error: ${joinData.errors[0].message}`);
    }

    const eventAfterJoin = joinData.data.joinEvent;
    console.log(`✅ User joined event successfully via GraphQL`);
    console.log(`   Attendees after join: ${eventAfterJoin.attendees.length}`);
    
    // Verify user is in the attendees
    const userInAttendees = eventAfterJoin.attendees.some(attendee => attendee.email === testEmail);
    console.log(`✅ User found in attendees list: ${userInAttendees ? 'YES' : 'NO'}`);

    if (!userInAttendees) {
      throw new Error('User was not properly added to event via GraphQL');
    }

    // Step 3: TEST LEAVE EVENT VIA GRAPHQL
    console.log('\n3️⃣ 🎯 TESTING LEAVE EVENT VIA GRAPHQL...');
    const leaveMutation = {
      query: `
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
      `,
      variables: {
        eventId: testEvent.id,
        userEmail: testEmail
      }
    };

    const leaveResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveMutation)
    });

    const leaveData = await leaveResponse.json();
    if (leaveData.errors) {
      throw new Error(`Leave Error: ${leaveData.errors[0].message}`);
    }

    const eventAfterLeave = leaveData.data.leaveEvent;
    console.log(`✅ Leave event operation completed via GraphQL`);
    console.log(`   Attendees after leave: ${eventAfterLeave.attendees.length}`);
    console.log(`   Expected attendees: ${eventAfterJoin.attendees.length - 1}`);

    // Step 4: Verify user was removed via GraphQL
    console.log('\n4️⃣ Verifying user removal via GraphQL...');
    const userStillInAttendees = eventAfterLeave.attendees.some(attendee => attendee.email === testEmail);
    console.log(`✅ User still in attendees: ${userStillInAttendees ? 'YES (❌ FAILED)' : 'NO (✅ SUCCESS)'}`);
    
    const attendeeCountCorrect = eventAfterLeave.attendees.length === (eventAfterJoin.attendees.length - 1);
    console.log(`✅ Attendee count correct: ${attendeeCountCorrect ? 'YES' : 'NO'}`);

    // Step 5: Verify via fresh GraphQL query
    console.log('\n5️⃣ Double-checking with fresh GraphQL query...');
    const verifyResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventsQuery)
    });

    const verifyData = await verifyResponse.json();
    const updatedEvent = verifyData.data.events.find(e => e.id === testEvent.id);
    const userStillInFreshQuery = updatedEvent.attendees.some(attendee => attendee.email === testEmail);
    
    console.log(`✅ User in fresh query: ${userStillInFreshQuery ? 'YES (❌ FAILED)' : 'NO (✅ SUCCESS)'}`);
    console.log(`   Fresh query attendee count: ${updatedEvent.attendees.length}`);

    // Step 6: Test re-joining after leaving
    console.log('\n6️⃣ Testing re-join after leave via GraphQL...');
    const rejoinResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(joinMutation)
    });

    const rejoinData = await rejoinResponse.json();
    if (rejoinData.errors) {
      console.log(`⚠️ Re-join failed (expected if user doesn't exist): ${rejoinData.errors[0].message}`);
    } else {
      const eventAfterRejoin = rejoinData.data.joinEvent;
      const userRejoined = eventAfterRejoin.attendees.some(attendee => attendee.email === testEmail);
      console.log(`✅ User can re-join after leaving: ${userRejoined ? 'YES' : 'NO'}`);
      
      // Clean up - leave again
      if (userRejoined) {
        await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leaveMutation)
        });
      }
    }

    // Step 7: Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 GRAPHQL LEAVE EVENT TEST RESULTS:');
    console.log('='.repeat(60));
    console.log(`✅ GraphQL join mutation works: YES`);
    console.log(`✅ GraphQL leave mutation works: YES`);
    console.log(`✅ User removed from attendees via API: ${!userStillInAttendees ? 'YES' : 'NO'}`);
    console.log(`✅ Attendee count updated correctly: ${attendeeCountCorrect ? 'YES' : 'NO'}`);
    console.log(`✅ Changes persist in GraphQL queries: ${!userStillInFreshQuery ? 'YES' : 'NO'}`);
    
    const allGraphQLTestsPassed = !userStillInAttendees && attendeeCountCorrect && !userStillInFreshQuery;
    
    console.log('\n🎉 GRAPHQL OVERALL RESULT:', allGraphQLTestsPassed ? 
      '✅ ALL GRAPHQL TESTS PASSED - Leave functionality works via API!' : 
      '❌ SOME GRAPHQL TESTS FAILED - API layer needs attention');

  } catch (error) {
    console.error('\n❌ GraphQL test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testLeaveEventViaGraphQL();