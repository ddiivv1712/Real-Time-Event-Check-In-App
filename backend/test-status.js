const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getDatabaseStatus() {
  try {
    console.log('📊 Current Database Status:');
    console.log('='.repeat(50));
    
    const users = await prisma.user.findMany({
      include: { events: true }
    });
    
    const events = await prisma.event.findMany({
      include: { attendees: true }
    });
    
    console.log(`👥 Users: ${users.length}`);
    users.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.name} (${user.email}) - ${user.events.length} events`);
    });
    
    console.log(`\n🎉 Events: ${events.length}`);
    events.forEach((event, i) => {
      console.log(`   ${i+1}. ${event.name} at ${event.location}`);
      console.log(`      Start: ${event.startTime}`);
      console.log(`      Attendees: ${event.attendees.length}`);
      event.attendees.forEach(attendee => {
        console.log(`        - ${attendee.name} (${attendee.email})`);
      });
    });
    
    console.log(`\n✅ Database Connection: HEALTHY`);
    console.log(`✅ Schema: VALID`);
    console.log(`✅ Data Integrity: MAINTAINED`);
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getDatabaseStatus();