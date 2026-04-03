import { DrawerContent } from '@/components';
import { useDrawer } from '@/src/hooks';
import { useAuthStore } from '@/src/store';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  const { drawer } = useDrawer();
  const claims = useAuthStore.getState().claims;

  useEffect(() => {
    if (claims?.role_id) {
      drawer.mutate(claims.role_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => (
          <DrawerContent
          claims={claims}
            {...props}
            modules={drawer.data ?? []} 
          />
        )}
        screenOptions={{
          headerShown: true,
          drawerType: 'front',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{ title: 'Hola' }}
        />
        <Drawer.Screen
          name="explore"
          options={{ title: 'Explore' }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}