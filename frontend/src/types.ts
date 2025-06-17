export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  startTime: string;
  attendees: User[];
}

export interface AppState {
  userEmail: string;
  userName: string;
  isLoggedIn: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
}

export interface JoinEventPayload {
  eventId: string;
  userEmail: string;
  [key: string]: any;
}

export type RootStackParamList = {
  EventList: undefined;
  EventDetail: { event: Event };
};