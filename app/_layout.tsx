import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useAuthStore } from '@/src/store/useAuthStore';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

const queryClient = new QueryClient();

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: 'transparent',
    surface: '#ffffff',
    surfaceVariant: 'transparent',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#ffffff',
      level3: '#ffffff',
      level4: '#ffffff',
      level5: '#ffffff',
    },
  },
};
SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs()

export default function RootLayout() {
  const claims = useAuthStore((state) => state.claims);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (claims) {
      router.replace('/(drawer)');
    } else {
      router.replace('/(auth)/Login');
    }
    SplashScreen.hideAsync();
  }, [isReady, claims, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <GluestackUIProvider mode="dark">
          <PaperProvider theme={paperTheme}>
            <View style={{ flex: 1 }} onLayout={() => setIsReady(true)}>
              <Stack>
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/Login" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="dark" />
            </View>
          </PaperProvider>
        </GluestackUIProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}