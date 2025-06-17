import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import MainApp from './src/MainApp';

const queryClient = new QueryClient();
const apolloClient = new ApolloClient({
  // Using local network IP for Apollo Client URI; required for physical devices
  // Make sure your phone is on the same network and the IP is correct
  uri: 'http://192.168.0.152:4000/graphql',
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <MainApp />
      </QueryClientProvider>
    </ApolloProvider>
  );
}
