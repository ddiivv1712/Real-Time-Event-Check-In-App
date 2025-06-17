import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { GraphQLContext, JoinEventPayload } from './types';

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// GraphQL Schema
const typeDefs = `
  """
  Represents a user in the event check-in system
  """
  type User {
    """
    Unique identifier for the user
    """
    id: ID!
    
    """
    Display name of the user, typically derived from their email
    """
    name: String!
    
    """
    Email address of the user, used as unique identifier for authentication
    """
    email: String!
  }

  """
  Represents an event that users can join or leave
  """
  type Event {
    """
    Unique identifier for the event
    """
    id: ID!
    
    """
    Name or title of the event
    """
    name: String!
    
    """
    Physical or virtual location where the event takes place
    """
    location: String!
    
    """
    ISO 8601 formatted date and time when the event starts
    """
    startTime: String!
    
    """
    List of users who have joined this event
    """
    attendees: [User!]!
  }

  type Query {
    """
    Retrieves all available events with their attendees, ordered by start time
    """
    events: [Event!]!
    
    """
    Retrieves or creates a user by email address. 
    If the user doesn't exist, creates a new user with the provided email.
    """
    me(
      """
      Email address of the user to retrieve or create
      """
      email: String!
    ): User
  }

  type Mutation {
    """
    Adds a user to an event's attendee list. 
    If the user is already attending, returns the current event state.
    Creates a new user if one doesn't exist with the provided email.
    """
    joinEvent(
      """
      Unique identifier of the event to join
      """
      eventId: ID!
      
      """
      Email address of the user joining the event
      """
      userEmail: String!
    ): Event!
    
    """
    Removes a user from an event's attendee list.
    If the user is not attending, returns the current event state.
    """
    leaveEvent(
      """
      Unique identifier of the event to leave
      """
      eventId: ID!
      
      """
      Email address of the user leaving the event
      """
      userEmail: String!
    ): Event!
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    events: async () => {
      try {
        const events = await prisma.event.findMany({
          include: { attendees: true },
          orderBy: { startTime: 'asc' }
        });
        
        console.log(`📊 Retrieved ${events.length} events from database`);
        return events;
      } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events');
      }
    },
    me: async (_: any, { email }: { email: string }) => {
      try {
        if (!email || !email.includes('@')) {
          throw new Error('Valid email is required');
        }

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.log(`👤 Creating new user for email: ${email}`);
          user = await prisma.user.create({
            data: { 
              email, 
              name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'User'
            }
          });
        }
        
        console.log(`👤 Retrieved user: ${user.name} (${user.email})`);
        return user;
      } catch (error) {
        console.error('Error in me query:', error);
        throw error;
      }
    }
  },
  Mutation: {
    joinEvent: async (_: any, { eventId, userEmail }: { eventId: string, userEmail: string }) => {
      try {
        // Validate inputs
        if (!eventId || !userEmail) {
          throw new Error('Event ID and user email are required');
        }

        // Check if event exists
        const existingEvent = await prisma.event.findUnique({
          where: { id: eventId },
          include: { attendees: true }
        });

        if (!existingEvent) {
          throw new Error('Event not found');
        }

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) {
          user = await prisma.user.create({
            data: { email: userEmail, name: userEmail.split('@')[0] }
          });
        }

        // Check if user is already in the event
        const isAlreadyJoined = existingEvent.attendees.some(attendee => attendee.email === userEmail);
        
        if (isAlreadyJoined) {
          // User already joined, return the current event state
          return existingEvent;
        }

        // Add user to event
        const event = await prisma.event.update({
          where: { id: eventId },
          data: { attendees: { connect: { id: user.id } } },
          include: { attendees: true }
        });

        // Real-time update
        const payload: JoinEventPayload = {
          eventId,
          user,
          attendees: event.attendees
        };
        
        io.to(`event-${eventId}`).emit('userJoined', payload);
        io.emit('eventUpdated', { eventId, attendees: event.attendees });

        return event;
      } catch (error) {
        console.error('Error in joinEvent mutation:', error);
        throw error;
      }
    },
    leaveEvent: async (_: any, { eventId, userEmail }: { eventId: string, userEmail: string }) => {
      try {
        // Validate inputs
        if (!eventId || !userEmail) {
          throw new Error('Event ID and user email are required');
        }

        // Check if event exists
        const existingEvent = await prisma.event.findUnique({
          where: { id: eventId },
          include: { attendees: true }
        });

        if (!existingEvent) {
          throw new Error('Event not found');
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) {
          throw new Error('User not found');
        }

        // Check if user is actually in the event
        const isInEvent = existingEvent.attendees.some(attendee => attendee.email === userEmail);
        
        if (!isInEvent) {
          // User is not in the event, return current event state
          return existingEvent;
        }

        // Remove user from event
        const event = await prisma.event.update({
          where: { id: eventId },
          data: { attendees: { disconnect: { id: user.id } } },
          include: { attendees: true }
        });

        // Real-time update
        const payload: JoinEventPayload = {
          eventId,
          user,
          attendees: event.attendees
        };
        
        io.to(`event-${eventId}`).emit('userLeft', payload);
        io.emit('eventUpdated', { eventId, attendees: event.attendees });

        return event;
      } catch (error) {
        console.error('Error in leaveEvent mutation:', error);
        throw error;
      }
    }
  }
};

// Database health check
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test basic query
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    console.log(`📊 Database status: ${userCount} users, ${eventCount} events`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error('Database connection failed');
  }
}

async function start() {
  try {
    // Check database connection first
    await checkDatabaseConnection();
    
    const apolloServer = new ApolloServer({ 
      typeDefs, 
      resolvers,
      introspection: true, // Enable introspection for GraphQL Playground
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          code: error.extensions?.code,
          path: error.path
        };
      }
    });
    
    await apolloServer.start();
    console.log('✅ Apollo Server started');

    app.use('/graphql', cors(), express.json(), expressMiddleware(apolloServer));

    // Health check endpoint
    app.get('/health', async (req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ 
          status: 'healthy', 
          database: 'connected',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ 
          status: 'unhealthy', 
          database: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // API Documentation endpoint
    app.get('/', (req, res) => {
      res.send(`
        <html>
          <head>
            <title>Event Check-In API</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
              .method { font-weight: bold; color: #2196F3; }
              pre { background: #f0f0f0; padding: 10px; border-radius: 3px; overflow-x: auto; }
              h1 { color: #333; }
              h2 { color: #666; border-bottom: 2px solid #eee; }
            </style>
          </head>
          <body>
            <h1>🎪 Event Check-In API</h1>
            <p>Real-time event check-in system with WebSocket support</p>
            
            <h2>📍 Endpoints</h2>
            
            <div class="endpoint">
              <span class="method">POST</span> <strong>/graphql</strong>
              <p>GraphQL endpoint for all queries and mutations</p>
              <p><a href="/graphql" target="_blank">Open GraphQL Playground</a></p>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span> <strong>/health</strong>
              <p>Health check endpoint</p>
              <p><a href="/health" target="_blank">Check API Health</a></p>
            </div>
            
            <div class="endpoint">
              <span class="method">WebSocket</span> <strong>ws://localhost:4000</strong>
              <p>Real-time updates for event attendee changes</p>
            </div>

            <h2>📚 GraphQL Schema</h2>
            <h3>Types</h3>
            <ul>
              <li><strong>User</strong> - Represents a user with id, name, and email</li>
              <li><strong>Event</strong> - Represents an event with attendees</li>
            </ul>
            
            <h3>Queries</h3>
            <ul>
              <li><strong>events</strong> - Get all events with attendees</li>
              <li><strong>me(email)</strong> - Get or create user by email</li>
            </ul>
            
            <h3>Mutations</h3>
            <ul>
              <li><strong>joinEvent(eventId, userEmail)</strong> - Join an event</li>
              <li><strong>leaveEvent(eventId, userEmail)</strong> - Leave an event</li>
            </ul>

            <h2>🧪 Testing</h2>
            <p>Run comprehensive tests:</p>
            <pre>node test-graphql-schema.js</pre>
            
            <h2>🔄 Real-time Events</h2>
            <p>WebSocket events:</p>
            <ul>
              <li><strong>userJoined</strong> - When a user joins an event</li>
              <li><strong>userLeft</strong> - When a user leaves an event</li>
              <li><strong>eventUpdated</strong> - When event attendees change</li>
            </ul>
          </body>
        </html>
      `);
    });

    // Socket.io
    io.on('connection', (socket) => {
      console.log('👥 User connected:', socket.id);

      socket.on('joinEventRoom', (eventId: string) => {
        socket.join(`event-${eventId}`);
        console.log(`📥 User ${socket.id} joined room: event-${eventId}`);
      });

      socket.on('leaveEventRoom', (eventId: string) => {
        socket.leave(`event-${eventId}`);
        console.log(`📤 User ${socket.id} left room: event-${eventId}`);
      });

      socket.on('disconnect', () => {
        console.log('👋 User disconnected:', socket.id);
      });
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Graceful shutdown initiated...');
      await prisma.$disconnect();
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    server.listen(4000, '0.0.0.0', () => {
      console.log('🚀 Server: http://localhost:4000/graphql');
      console.log('🚀 Server: http://192.168.0.152:4000/graphql');
      console.log('🏥 Health: http://localhost:4000/health');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();