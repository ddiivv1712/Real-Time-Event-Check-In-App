const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLeaveEventFunctionality() {
  console.log('🧪 Testing LEAVE EVENT Functionality in Database...');
  console.log('='.repeat(60));

  try {
    // Step 1: Get an existing event to test with
    console.log('\n1️⃣ Finding an event to test with...');
    const events = await prisma.event.findMany({
      include: { attendees: true }
    });
    
    if (events.length === 0) {
      console.log('❌ No events found. Creating a test event...');
      const testEvent = await prisma.event.create({
        data: {
          name: 'Leave Test Event',
          location: 'Test Location',
          startTime: new Date()
        },
        include: { attendees: true }
      });
      events.push(testEvent);
    }
    
    const testEvent = events[0];
    console.log(`✅ Using event: "${testEvent.name}" (ID: ${testEvent.id})`);
    console.log(`   Initial attendees: ${testEvent.attendees.length}`);
    
    // Step 2: Create a test user
    console.log('\n2️⃣ Creating test user for leave functionality...');
    const testEmail = `leave-test-${Date.now()}@example.com`;
    const testUser = await prisma.user.create({
      data: {
        name: 'Leave Test User',
        email: testEmail
      }
    });
    console.log(`✅ Created user: ${testUser.name} (${testUser.email})`);
    
    // Step 3: Join the event first
    console.log('\n3️⃣ Joining event (prerequisite for leaving)...');
    const eventAfterJoin = await prisma.event.update({
      where: { id: testEvent.id },
      data: {
        attendees: {
          connect: { id: testUser.id }
        }
      },
      include: { attendees: true }
    });
    
    console.log(`✅ User joined event successfully`);
    console.log(`   Attendees after join: ${eventAfterJoin.attendees.length}`);
    
    // Verify user is in attendees list
    const userInAttendees = eventAfterJoin.attendees.some(attendee => attendee.id === testUser.id);
    console.log(`✅ User is in attendees list: ${userInAttendees ? 'YES' : 'NO'}`);
    
    if (!userInAttendees) {
      throw new Error('User was not properly added to event attendees');
    }
    
    // Step 4: TEST THE LEAVE FUNCTIONALITY
    console.log('\n4️⃣ 🎯 TESTING LEAVE EVENT FUNCTIONALITY...');
    const eventAfterLeave = await prisma.event.update({
      where: { id: testEvent.id },
      data: {
        attendees: {
          disconnect: { id: testUser.id }
        }
      },
      include: { attendees: true }
    });
    
    console.log(`✅ Leave event operation completed`);
    console.log(`   Attendees after leave: ${eventAfterLeave.attendees.length}`);
    console.log(`   Expected attendees: ${eventAfterJoin.attendees.length - 1}`);
    
    // Step 5: Verify user was removed
    console.log('\n5️⃣ Verifying user was properly removed...');
    const userStillInAttendees = eventAfterLeave.attendees.some(attendee => attendee.id === testUser.id);
    console.log(`✅ User still in attendees: ${userStillInAttendees ? 'YES (❌ FAILED)' : 'NO (✅ SUCCESS)'}`);
    
    const attendeeCountCorrect = eventAfterLeave.attendees.length === (eventAfterJoin.attendees.length - 1);
    console.log(`✅ Attendee count correct: ${attendeeCountCorrect ? 'YES' : 'NO'}`);
    
    // Step 6: Test database persistence
    console.log('\n6️⃣ Testing database persistence...');
    const eventFromDb = await prisma.event.findUnique({
      where: { id: testEvent.id },
      include: { attendees: true }
    });
    
    const userStillInDbAttendees = eventFromDb.attendees.some(attendee => attendee.id === testUser.id);
    console.log(`✅ User persisted as removed in DB: ${!userStillInDbAttendees ? 'YES' : 'NO (❌ FAILED)'}`);
    console.log(`   DB attendee count: ${eventFromDb.attendees.length}`);
    
    // Step 7: Test user-event relationship from user perspective
    console.log('\n7️⃣ Checking user-event relationship...');
    const userWithEvents = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: { events: true }
    });
    
    const userStillHasEvent = userWithEvents.events.some(event => event.id === testEvent.id);
    console.log(`✅ User still has event in their list: ${userStillHasEvent ? 'YES (❌ FAILED)' : 'NO (✅ SUCCESS)'}`);
    console.log(`   User's current events: ${userWithEvents.events.length}`);
    
    // Step 8: Test re-joining after leaving (should work)
    console.log('\n8️⃣ Testing re-join after leave...');
    const eventAfterRejoin = await prisma.event.update({
      where: { id: testEvent.id },
      data: {
        attendees: {
          connect: { id: testUser.id }
        }
      },
      include: { attendees: true }
    });
    
    const userRejoinedSuccessfully = eventAfterRejoin.attendees.some(attendee => attendee.id === testUser.id);
    console.log(`✅ User can re-join after leaving: ${userRejoinedSuccessfully ? 'YES' : 'NO'}`);
    console.log(`   Attendees after re-join: ${eventAfterRejoin.attendees.length}`);
    
    // Step 9: Final cleanup and summary
    console.log('\n9️⃣ Final cleanup and test summary...');
    
    // Clean up - remove test user from event
    await prisma.event.update({
      where: { id: testEvent.id },
      data: {
        attendees: {
          disconnect: { id: testUser.id }
        }
      }
    });
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 LEAVE EVENT FUNCTIONALITY TEST RESULTS:');
    console.log('='.repeat(60));
    console.log(`✅ User successfully joined event: YES`);
    console.log(`✅ Leave operation executed: YES`);
    console.log(`✅ User removed from attendees: ${!userStillInAttendees ? 'YES' : 'NO'}`);
    console.log(`✅ Attendee count updated correctly: ${attendeeCountCorrect ? 'YES' : 'NO'}`);
    console.log(`✅ Database persistence working: ${!userStillInDbAttendees ? 'YES' : 'NO'}`);
    console.log(`✅ Bidirectional relationship updated: ${!userStillHasEvent ? 'YES' : 'NO'}`);
    console.log(`✅ Re-join after leave works: ${userRejoinedSuccessfully ? 'YES' : 'NO'}`);
    
    const allTestsPassed = !userStillInAttendees && attendeeCountCorrect && 
                          !userStillInDbAttendees && !userStillHasEvent && 
                          userRejoinedSuccessfully;
    
    console.log('\n🎉 OVERALL RESULT:', allTestsPassed ? 
      '✅ ALL TESTS PASSED - Leave functionality is working perfectly!' : 
      '❌ SOME TESTS FAILED - Leave functionality needs attention');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testLeaveEventFunctionality();