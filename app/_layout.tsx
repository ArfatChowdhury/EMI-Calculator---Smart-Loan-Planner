import { LoanProvider } from '@/src/context/LoanContext';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SettingsProvider>
      <LoanProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </LoanProvider>
    </SettingsProvider>
  );
}
