import { IconSymbol } from '@/components/ui/icon-symbol';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
          drawerType: 'front',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Hola',
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="house.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="explore"
          options={{
            title: 'Explore',
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="paperplane.fill" color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}