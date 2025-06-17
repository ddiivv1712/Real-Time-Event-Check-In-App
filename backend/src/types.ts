export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  startTime: Date;
  attendees: User[];
}

export interface GraphQLContext {
  prisma: any;
}

export interface JoinEventPayload {
  eventId: string;
  user: User;
  attendees: User[];
}