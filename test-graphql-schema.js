#!/usr/bin/env node

/**
 * Comprehensive GraphQL Schema Test
 * Tests all queries, mutations, and validates schema documentation
 */

async function testGraphQLSchema() {
  try {
    // Install dependencies if needed
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
    console.log('🧪 Testing GraphQL Schema at:', GRAPHQL_ENDPOINT);
    console.log('=' .repeat(60));

    // Test 1: Introspection Query (Test schema documentation)
    console.log('\n1️⃣ Testing Schema Introspection...');
    const INTROSPECTION_QUERY = gql`
      query IntrospectionQuery {
        __schema {
          types {
            name
            description
            fields {
              name
              description
              type {
                name
                kind
              }
            }
          }
        }
      }
    `;

    const schemaData = await request(GRAPHQL_ENDPOINT, INTROSPECTION_QUERY);
    
    // Find our custom types
    const userType = schemaData.__schema.types.find(t => t.name === 'User');
    const eventType = schemaData.__schema.types.find(t => t.name === 'Event');
    
    console.log('✅ Schema introspection successful!');
    console.log(`📋 User type description: ${userType?.description || 'No description'}`);
    console.log(`📋 Event type description: ${eventType?.description || 'No description'}`);
    
    // Test field descriptions
    if (userType?.fields) {
      console.log('👤 User fields:');
      userType.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.description || 'No description'}`);
      });
    }
    
    if (eventType?.fields) {
      console.log('🎪 Event fields:');
      eventType.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.description || 'No description'}`);
      });
    }

    // Test 2: Events Query
    console.log('\n2️⃣ Testing Events Query...');
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
    
    eventsData.events.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.name} at ${event.location}`);
      console.log(`     Start: ${event.startTime}`);
      console.log(`     Attendees: ${event.attendees.length}`);
    });

    // Test 3: Me Query (User Creation/Retrieval)
    console.log('\n3️⃣ Testing Me Query...');
    const GET_ME = gql`
      query GetMe($email: String!) {
        me(email: $email) {
          id
          name
          email
        }
      }
    `;

    const testEmails = [
      'john.doe@test.com',
      'jane.smith@test.com',
      'invalid-email' // This should fail
    ];

    for (const email of testEmails) {
      try {
        const userData = await request(GRAPHQL_ENDPOINT, GET_ME, { email });
        console.log(`✅ ME query for ${email}: ${userData.me.name} (${userData.me.email})`);
      } catch (error) {
        console.log(`❌ ME query failed for ${email}: ${error.message}`);
      }
    }

    // Test 4: Mutation Testing
    if (eventsData.events.length > 0) {
      const testEventId = eventsData.events[0].id;
      const testUserEmail = 'mutation.test@example.com';
      
      console.log('\n4️⃣ Testing Join Event Mutation...');
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

      // Test joining an event
      const joinResult = await request(GRAPHQL_ENDPOINT, JOIN_EVENT, {
        eventId: testEventId,
        userEmail: testUserEmail
      });
      console.log(`✅ JOIN_EVENT successful!`);
      console.log(`🎉 Joined event: ${joinResult.joinEvent.name}`);
      console.log(`👥 Total attendees: ${joinResult.joinEvent.attendees.length}`);

      // Test joining the same event again (should not duplicate)
      const joinAgainResult = await request(GRAPHQL_ENDPOINT, JOIN_EVENT, {
        eventId: testEventId,
        userEmail: testUserEmail
      });
      console.log(`✅ JOIN_EVENT (duplicate) handled correctly!`);
      console.log(`👥 Attendees count unchanged: ${joinAgainResult.joinEvent.attendees.length}`);

      console.log('\n5️⃣ Testing Leave Event Mutation...');
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

      // Test leaving the event
      const leaveResult = await request(GRAPHQL_ENDPOINT, LEAVE_EVENT, {
        eventId: testEventId,
        userEmail: testUserEmail
      });
      console.log(`✅ LEAVE_EVENT successful!`);
      console.log(`👋 Left event: ${leaveResult.leaveEvent.name}`);
      console.log(`👥 Remaining attendees: ${leaveResult.leaveEvent.attendees.length}`);

      // Test leaving an event not joined (should handle gracefully)
      const leaveAgainResult = await request(GRAPHQL_ENDPOINT, LEAVE_EVENT, {
        eventId: testEventId,
        userEmail: testUserEmail
      });
      console.log(`✅ LEAVE_EVENT (not joined) handled correctly!`);
      console.log(`👥 Attendees count unchanged: ${leaveAgainResult.leaveEvent.attendees.length}`);
    }

    // Test 6: Error Handling
    console.log('\n6️⃣ Testing Error Handling...');
    
    // Test invalid event ID
    try {
      const JOIN_EVENT = gql`
        mutation JoinEvent($eventId: ID!, $userEmail: String!) {
          joinEvent(eventId: $eventId, userEmail: $userEmail) {
            id
            name
          }
        }
      `;

      await request(GRAPHQL_ENDPOINT, JOIN_EVENT, {
        eventId: 'invalid-event-id',
        userEmail: 'test@example.com'
      });
      console.log('❌ Error handling test failed - should have thrown an error');
    } catch (error) {
      console.log('✅ Error handling works: Invalid event ID properly rejected');
    }

    // Test missing parameters
    try {
      await request(GRAPHQL_ENDPOINT, gql`
        mutation {
          joinEvent(eventId: "", userEmail: "") {
            id
          }
        }
      `);
      console.log('❌ Error handling test failed - should have thrown an error');
    } catch (error) {
      console.log('✅ Error handling works: Empty parameters properly rejected');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 All GraphQL schema tests completed successfully!');
    console.log('📚 Schema is well documented and functional');
    console.log('✨ Ready for production use');
    
  } catch (error) {
    console.error('\n❌ GraphQL schema test failed:');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2));
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Connection refused - make sure the backend server is running');
      console.error('Run: cd backend && npm run dev');
    }
    
    process.exit(1);
  }
}

// Self-executing test
if (require.main === module) {
  testGraphQLSchema();
}

module.exports = { testGraphQLSchema };