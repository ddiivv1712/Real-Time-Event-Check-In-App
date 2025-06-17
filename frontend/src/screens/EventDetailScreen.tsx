import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SafeFlatList from '../components/SafeFlatList';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import { useStore } from '../store';
import { Event, User, JoinEventPayload } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import io, { Socket } from 'socket.io-client';

const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: ID!, $userEmail: String!) {
    joinEvent(eventId: $eventId, userEmail: $userEmail) {
      id
      attendees {
        id
        name
        email
      }
    }
  }
`;

const LEAVE_EVENT = gql`
  mutation LeaveEvent($eventId: ID!, $userEmail: String!) {
    leaveEvent(eventId: $eventId, userEmail: $userEmail) {
      id
      attendees {
        id
        name
        email
      }
    }
  }
`;

const GRAPHQL_ENDPOINT = 'http://192.168.0.152:4000/graphql';

type EventDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetail'>;
type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

interface Props {
  navigation: EventDetailScreenNavigationProp;
  route: EventDetailScreenRouteProp;
}

export default function EventDetailScreen({ navigation, route }: Props) {
  const { event: initialEvent } = route.params;
  
  // Add safety check for initialEvent
  if (!initialEvent) {
    console.error('EventDetailScreen: No event provided in route params');
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Error: Event not found</Text>
        </View>
      </View>
    );
  }
  
  const { userEmail } = useStore();
  const [event, setEvent] = useState<Event>(initialEvent);
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const newSocket = io('http://192.168.0.152:4000');
    setSocket(newSocket);

    newSocket.on('eventUpdated', (updatedEvent: Event) => {
      if (updatedEvent.id === event.id) {
        setEvent(updatedEvent);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [event.id]);

  const joinEventMutation = useMutation({
    mutationFn: async (variables: JoinEventPayload) => {
      return request(GRAPHQL_ENDPOINT, JOIN_EVENT, variables);
    },
    onSuccess: (data: any) => {
      setEvent(prevEvent => ({
        ...prevEvent,
        attendees: data.joinEvent.attendees
      }));
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Join event error:', error);
      Alert.alert('Error', 'Failed to join event. Please try again.');
    },
  });

  const leaveEventMutation = useMutation({
    mutationFn: async (variables: JoinEventPayload) => {
      return request(GRAPHQL_ENDPOINT, LEAVE_EVENT, variables);
    },
    onSuccess: (data: any) => {
      setEvent(prevEvent => ({
        ...prevEvent,
        attendees: data.leaveEvent.attendees
      }));
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Leave event error:', error);
      Alert.alert('Error', 'Failed to leave event. Please try again.');
    },
  });

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleJoinEvent = () => {
    if (!userEmail) {
      Alert.alert('Error', 'User email not found');
      return;
    }

    joinEventMutation.mutate({
      eventId: event.id,
      userEmail: userEmail,
    });
  };

  const handleLeaveEvent = () => {
    if (!userEmail) {
      Alert.alert('Error', 'User email not found');
      return;
    }

    leaveEventMutation.mutate({
      eventId: event.id,
      userEmail: userEmail,
    });
  };

  const attendees = Array.isArray(event?.attendees) ? event.attendees : [];
  const isJoined = userEmail ? attendees.some(attendee => attendee?.email === userEmail) : false;
  const { date, time } = formatDateTime(event?.startTime || new Date().toISOString());

  const renderAttendee = ({ item }: { item: User }) => {
    if (!item) {
      console.warn('EventDetailScreen: renderAttendee received null/undefined item');
      return null;
    }
    
    try {
      const isCurrentUser = item.email === userEmail;
      const initial = (item.name || 'U').charAt(0).toUpperCase();

      return (
        <View style={styles.attendeeItem}>
          <View style={styles.attendeeAvatar}>
            <Text style={styles.attendeeInitial}>{initial}</Text>
          </View>
          <View style={styles.attendeeInfo}>
            <Text style={styles.attendeeName}>{item.name || 'Unknown User'}</Text>
            <Text style={styles.attendeeEmail}>{item.email || 'No email'}</Text>
          </View>
          {isCurrentUser && (
            <View style={styles.youLabel}>
              <Text style={styles.youLabelText}>You</Text>
            </View>
          )}
        </View>
      );
    } catch (error) {
      console.error('EventDetailScreen: Error rendering attendee item:', error, item);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.eventLocation}>📍 {event.location}</Text>
        <Text style={styles.eventTime}>🕒 {date} at {time}</Text>

        <View style={styles.joinSection}>
          {isJoined ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeaveEvent}
              disabled={leaveEventMutation.isPending}
            >
              <Text style={styles.leaveButtonText}>
                {leaveEventMutation.isPending ? 'Leaving...' : 'Leave Event'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.joinButton]}
              onPress={handleJoinEvent}
              disabled={joinEventMutation.isPending}
            >
              <Text style={styles.joinButtonText}>
                {joinEventMutation.isPending ? 'Joining...' : 'Join Event'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.attendeesSection}>
          <Text style={styles.sectionTitle}>
            Attendees ({attendees.length})
          </Text>
          
          <SafeFlatList
            data={Array.isArray(attendees) ? attendees.filter(Boolean) : []}
            renderItem={renderAttendee}
            style={styles.attendeesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No attendees yet</Text>
              </View>
            }
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#007bff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventLocation: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  eventTime: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  joinSection: {
    marginBottom: 30,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#007bff',
  },
  leaveButton: {
    backgroundColor: '#dc3545',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendeesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  attendeesList: {
    flex: 1,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 8,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attendeeInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    marginBottom: 2,
  },
  attendeeEmail: {
    fontSize: 14,
    color: '#666',
  },
  youLabel: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  youLabelText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});