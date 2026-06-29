import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const ctx = require.context('./app');

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ExpoRoot context={ctx} />
    </QueryClientProvider>
  );
}

registerRootComponent(App);
