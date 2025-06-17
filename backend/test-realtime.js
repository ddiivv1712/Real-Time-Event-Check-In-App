const io = require('socket.io-client');
const fetch = require('node-fetch');

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';
const SOCKET_ENDPOINT = 'http://localhost:4000';

async function testRealtimeUpdates() {
  console.log('🔴 Testing Real-time Socket.io Updates...\n');

  try {
    // Get an event to test with
    const eventsQuery = {
      query: `
        query {
          events {
            id
            name
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
    const testEvent = eventsData.data.events[0];
    
    console.log(`1️⃣ Testing with event: ${testEvent.name}`);
    console.log(`   Initial attendees: ${testEvent.attendees.length}`);

    // Create multiple socket connections to simulate multiple users
    const socket1 = io(SOCKET_ENDPOINT);
    const socket2 = io(SOCKET_ENDPOINT);
    
    let socket1Events = [];
    let socket2Events = [];
    
    // Set up event listeners
    socket1.on('connect', () => {
      console.log('✅ Socket 1 connected');
      socket1.emit('joinEventRoom', testEvent.id);
    });
    
    socket2.on('connect', () => {
      console.log('✅ Socket 2 connected');
      socket2.emit('joinEventRoom', testEvent.id);
    });
    
    socket1.on('userJoined', (data) => {
      console.log(`📢 Socket 1 received userJoined: ${data.user.name} joined ${data.eventId}`);
      socket1Events.push('userJoined');
    });
    
    socket1.on('userLeft', (data) => {
      console.log(`📢 Socket 1 received userLeft: ${data.user.name} left ${data.eventId}`);
      socket1Events.push('userLeft');
    });
    
    socket1.on('eventUpdated', (data) => {
      console.log(`📢 Socket 1 received eventUpdated: Event ${data.eventId} now has ${data.attendees.length} attendees`);
      socket1Events.push('eventUpdated');
    });
    
    socket2.on('userJoined', (data) => {
      console.log(`📢 Socket 2 received userJoined: ${data.user.name} joined ${data.eventId}`);
      socket2Events.push('userJoined');
    });
    
    socket2.on('userLeft', (data) => {
      console.log(`📢 Socket 2 received userLeft: ${data.user.name} left ${data.eventId}`);
      socket2Events.push('userLeft');
    });
    
    socket2.on('eventUpdated', (data) => {
      console.log(`📢 Socket 2 received eventUpdated: Event ${data.eventId} now has ${data.attendees.length} attendees`);
      socket2Events.push('eventUpdated');
    });

    // Wait for connections to establish
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n2️⃣ Testing join event real-time updates...');
    
    // Test user joining event
    const testUserEmail = `realtime-test-${Date.now()}@example.com`;
    const joinMutation = {
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
      variables: { eventId: testEvent.id, userEmail: testUserEmail }
    };

    const joinResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(joinMutation)
    });

    const joinData = await joinResponse.json();
    console.log(`✅ User joined event via GraphQL: ${joinData.data.joinEvent.attendees.length} attendees`);
    
    // Wait for real-time events
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n3️⃣ Testing leave event real-time updates...');
    
    // Test user leaving event
    const leaveMutation = {
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
      variables: { eventId: testEvent.id, userEmail: testUserEmail }
    };

    const leaveResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveMutation)
    });

    const leaveData = await leaveResponse.json();
    console.log(`✅ User left event via GraphQL: ${leaveData.data.leaveEvent.attendees.length} attendees`);
    
    // Wait for real-time events
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n4️⃣ Verifying real-time events received...');
    
    console.log(`   Socket 1 received ${socket1Events.length} events: ${socket1Events.join(', ')}`);
    console.log(`   Socket 2 received ${socket2Events.length} events: ${socket2Events.join(', ')}`);
    
    // Verify both sockets received the events
    const socket1ReceivedJoin = socket1Events.includes('userJoined');
    const socket1ReceivedLeave = socket1Events.includes('userLeft');
    const socket2ReceivedJoin = socket2Events.includes('userJoined');
    const socket2ReceivedLeave = socket2Events.includes('userLeft');
    
    console.log(`✅ Socket 1 received join event: ${socket1ReceivedJoin}`);
    console.log(`✅ Socket 1 received leave event: ${socket1ReceivedLeave}`);
    console.log(`✅ Socket 2 received join event: ${socket2ReceivedJoin}`);
    console.log(`✅ Socket 2 received leave event: ${socket2ReceivedLeave}`);
    
    // Clean up
    socket1.disconnect();
    socket2.disconnect();
    
    const allEventsReceived = socket1ReceivedJoin && socket1ReceivedLeave && 
                              socket2ReceivedJoin && socket2ReceivedLeave;
    
    if (allEventsReceived) {
      console.log('\n🎉 SUCCESS: Real-time updates working correctly!');
      console.log('   ✅ Socket.io connections established');
      console.log('   ✅ Event room subscriptions working');
      console.log('   ✅ userJoined events broadcasted');
      console.log('   ✅ userLeft events broadcasted');
      console.log('   ✅ Multiple clients receive updates simultaneously');
    } else {
      throw new Error('Not all real-time events were received');
    }
    
  } catch (error) {
    console.error('❌ Real-time test failed:', error.message);
    console.error(error);
  }
}

// Install socket.io-client if not present
try {
  require('socket.io-client');
  testRealtimeUpdates();
} catch (e) {
  console.log('Installing socket.io-client...');
  const { execSync } = require('child_process');
  execSync('npm install socket.io-client', { stdio: 'inherit' });
  console.log('socket.io-client installed, running tests...\n');
  delete require.cache[require.resolve('socket.io-client')];
  testRealtimeUpdates();
}