import { HeaderRight } from '@/components/molecules/HeaderRight';
import { DrawerContent } from '@/components/organisms/DrawerContent';
import { useDrawer } from '@/src/hooks';
import { useAuthStore } from '@/src/store';
import { getGroupTitle } from '@/src/utils';
import { useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  const { drawer } = useDrawer();
  const claims = useAuthStore.getState().claims;

  const segments = useSegments();
  const isForm = segments.some((s) => s.includes('(form)'));


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
          headerRight: () => (<HeaderRight name={claims?.tenant_name ?? "Mi Empresa"} />),
        }}
      >
        <Drawer.Screen
          name="index"
          options={{ title: 'Home' }}
        />
        <Drawer.Screen
          name="explore"
          options={{ title: 'Explore' }}
        />
        <Drawer.Screen
          name="profile"
          options={{ title: 'Perfil' }}
        />
        <Drawer.Screen
          name="dashboard"
          options={{ title: 'Dashboard' }}
        />
        <Drawer.Screen
          name="(inventory)"
          options={({ route }) => ({
            headerShown: !isForm,
            title: getGroupTitle('(inventory)', route, 'Inventario'),
          })}
        />
        <Drawer.Screen
          name="(config)"
          options={({ route }) => ({
            headerShown: !isForm,
            title: getGroupTitle('(config)', route, 'Configuraciones'),
          })}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}