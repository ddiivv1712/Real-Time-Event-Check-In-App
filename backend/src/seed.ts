import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // Clean existing data
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Charlie Brown',
        email: 'charlie@example.com'
      }
    })
  ]);

  // Create sample events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: 'Tech Meetup',
        location: 'Downtown Hall',
        startTime: new Date('2024-12-20T18:00:00Z'),
        attendees: {
          connect: [{ id: users[0].id }, { id: users[1].id }]
        }
      }
    }),
    prisma.event.create({
      data: {
        name: 'Music Festival',
        location: 'City Park',
        startTime: new Date('2024-12-22T15:00:00Z'),
        attendees: {
          connect: [{ id: users[0].id }]
        }
      }
    }),
    prisma.event.create({
      data: {
        name: 'Food Fair',
        location: 'Main Street',
        startTime: new Date('2024-12-25T12:00:00Z')
      }
    })
  ]);

  console.log('✅ Database seeded with sample data!');
  console.log(`Created ${users.length} users and ${events.length} events`);
}

seed()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });