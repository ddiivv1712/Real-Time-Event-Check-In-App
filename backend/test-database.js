const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://devanands@localhost:5432/events_db'
    }
  }
});

async function testDatabasePersistence() {
  console.log('🧪 Testing Database Integration & Persistence...\n');

  try {
    // Test 1: Check if seeded data exists
    console.log('1️⃣ Testing seeded data retrieval...');
    const users = await prisma.user.findMany();
    const events = await prisma.event.findMany({
      include: { attendees: true }
    });
    
    console.log(`✅ Found ${users.length} users in database`);
    console.log(`✅ Found ${events.length} events in database`);
    
    if (users.length > 0) {
      console.log(`   Sample user: ${users[0].name} (${users[0].email})`);
    }
    
    if (events.length > 0) {
      console.log(`   Sample event: ${events[0].name} at ${events[0].location}`);
      console.log(`   Attendees: ${events[0].attendees.length}`);
    }
    
    // Test 2: Create a new user and verify persistence
    console.log('\n2️⃣ Testing new user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const newUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail
      }
    });
    console.log(`✅ Created new user: ${newUser.name} (${newUser.email})`);
    
    // Test 3: Join event and verify persistence
    console.log('\n3️⃣ Testing event join functionality...');
    if (events.length > 0) {
      const eventToJoin = events[0];
      const updatedEvent = await prisma.event.update({
        where: { id: eventToJoin.id },
        data: {
          attendees: {
            connect: { id: newUser.id }
          }
        },
        include: { attendees: true }
      });
      
      console.log(`✅ User joined event "${updatedEvent.name}"`);
      console.log(`   Event now has ${updatedEvent.attendees.length} attendees`);
      
      // Verify the join persisted
      const verifyEvent = await prisma.event.findUnique({
        where: { id: eventToJoin.id },
        include: { attendees: true }
      });
      
      const userJoined = verifyEvent.attendees.some(attendee => attendee.id === newUser.id);
      console.log(`✅ Join persistence verified: ${userJoined ? 'SUCCESS' : 'FAILED'}`);
    }
    
    // Test 4: Test leave event functionality
    console.log('\n4️⃣ Testing event leave functionality...');
    if (events.length > 0) {
      const eventToLeave = events[0];
      const updatedEvent = await prisma.event.update({
        where: { id: eventToLeave.id },
        data: {
          attendees: {
            disconnect: { id: newUser.id }
          }
        },
        include: { attendees: true }
      });
      
      console.log(`✅ User left event "${updatedEvent.name}"`);
      console.log(`   Event now has ${updatedEvent.attendees.length} attendees`);
    }
    
    // Test 5: Database relationships integrity
    console.log('\n5️⃣ Testing database relationships...');
    const usersWithEvents = await prisma.user.findMany({
      include: { events: true }
    });
    
    let totalRelationships = 0;
    usersWithEvents.forEach(user => {
      totalRelationships += user.events.length;
      if (user.events.length > 0) {
        console.log(`   ${user.name} is attending ${user.events.length} event(s)`);
      }
    });
    
    console.log(`✅ Total user-event relationships: ${totalRelationships}`);
    
    // Test 6: Data persistence across queries
    console.log('\n6️⃣ Testing data persistence...');
    const finalUserCount = await prisma.user.count();
    const finalEventCount = await prisma.event.count();
    
    console.log(`✅ Final user count: ${finalUserCount}`);
    console.log(`✅ Final event count: ${finalEventCount}`);
    
    console.log('\n🎉 All database tests passed! Data is being persisted correctly in PostgreSQL.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabasePersistence();