import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useAuthStore } from '@/src/store/useAuthStore';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync(); // 👈 mantiene splash visible

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

function RootLayoutNav() {
  const claims = useAuthStore((state) => state.claims);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';

    if (claims && inAuth) {
      router.replace('/(drawer)');
    } else if (!claims && !inAuth) {
      router.replace('/(auth)/Login');
    }

    SplashScreen.hideAsync(); // 👈 oculta splash cuando ya sabe a dónde ir
  }, [claims, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <GluestackUIProvider mode="dark">
          <PaperProvider theme={paperTheme}>
            <RootLayoutNav />
            <StatusBar style="dark" />
          </PaperProvider>
        </GluestackUIProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}