import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { LogBox } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

LogBox.ignoreAllLogs()

export default function RootLayout() {

  return (
    <GluestackUIProvider mode="dark">
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </GluestackUIProvider>
  );
}
