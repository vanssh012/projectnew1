import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C9A050',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;
  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync();
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (segments[0] === '(auth)') {
          router.replace('/(tabs)');
        }
        // Register Push Notifications
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await supabase.from('profiles').update({ expo_push_token: token }).eq('id', session.user.id);
        }
      }
    } catch (e) {
      console.log('Auth check skipped');
    }
    setCheckingSession(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event" />
        <Stack.Screen name="host" />
      </Stack>
    </QueryClientProvider>
  );
}
