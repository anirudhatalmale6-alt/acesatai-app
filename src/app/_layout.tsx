import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0e1a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0a0e1a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'ACESATAI', headerShown: false }} />
        <Stack.Screen name="quiz" options={{ title: 'Adaptive Quiz' }} />
        <Stack.Screen name="snap-solve" options={{ title: 'Snap & Solve' }} />
        <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
      </Stack>
    </>
  );
}
