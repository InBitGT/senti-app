import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';
import 'react-native-reanimated';

LogBox.ignoreAllLogs();
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient()


export default function RootLayout() {
  const auth = false;
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (auth) {
      router.replace('/(drawer)');
    } else {
      router.replace('/(auth)/Login');
    }
  }, [isReady, auth, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode="dark">
        <View style={{ flex: 1 }} onLayout={() => setIsReady(true)}>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/Login" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="dark" />
        </View>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}