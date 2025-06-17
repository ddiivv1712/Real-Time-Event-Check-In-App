
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import SafeFlatList from '../components/SafeFlatList';
import { useQuery, gql } from '@apollo/client';
import { useStore } from '../store';
import { Event } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import io from 'socket.io-client';

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

type EventListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EventList'>;

interface Props {
  navigation: EventListScreenNavigationProp;
}

export default function EventListScreen({ navigation }: Props) {
  const { userEmail, logout } = useStore();

  const { data, loading, refetch, error } = useQuery<{ events: Event[] }>(GET_EVENTS, {
    pollInterval: 10000, // Refetch every 10 seconds
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      console.log('EventListScreen: Query completed with data:', JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      console.error('EventListScreen: Query error:', error);
    }
  });

  useEffect(() => {
    if (error) {
      console.error('Query error:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
    }
  }, [error]);

  useEffect(() => {
    const socket = io('http://192.168.0.152:4000');

    socket.on('eventUpdated', () => {
      refetch();
    });

    return () => {
      socket.close();
    };
  }, [refetch]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const renderEvent = ({ item }: { item: Event }) => {
    if (!item) {
      console.warn('EventListScreen: renderEvent received null/undefined item');
      return null;
    }
    
    try {
      const attendees = Array.isArray(item.attendees) ? item.attendees : [];
      const isJoined = userEmail ? attendees.some(attendee => attendee?.email === userEmail) : false;
      const { date, time } = formatDateTime(item.startTime || new Date().toISOString());

      return (
        <TouchableOpacity
          style={styles.eventCard}
          onPress={() => navigation.navigate('EventDetail', { event: item })}
        >
          <View style={styles.eventHeader}>
            <Text style={styles.eventName}>{item.name || 'Unnamed Event'}</Text>
            {isJoined && <Text style={styles.joinedBadge}>Joined</Text>}
          </View>
          <Text style={styles.eventLocation}>📍 {item.location || 'No location'}</Text>
          <Text style={styles.eventTime}>🕒 {date} at {time}</Text>
          <Text style={styles.attendeesCount}>
            👥 {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('EventListScreen: Error rendering event item:', error, item);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading events</Text>
        <Text style={styles.errorDetails}>
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <SafeFlatList
        data={Array.isArray(data?.events) ? data.events.filter(Boolean) : []}
        renderItem={renderEvent}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor="#007bff"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events available</Text>
          </View>
        }
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
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
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#007bff',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginBottom: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  joinedBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventLocation: {
    fontSize: 14,
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    marginBottom: 5,
  },
  attendeesCount: {
    fontSize: 14,
    color: '#007bff',
  },
});
