import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg.surface,
          borderTopColor: COLORS.bg.border,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.text.primary,
        tabBarInactiveTintColor: '#444444',
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>🧭</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>➕</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>🎟️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
