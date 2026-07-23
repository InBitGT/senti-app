import { AccordionItem, DrawerItem, FooterDrawer } from "@/components/atom";
import { PerfilDrawer } from "@/components/atom/PerfilDrawer/PerfilDrawer";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLogin } from "@/src/hooks";
import { useAuthStore } from "@/src/store";
import { Claims, Module } from "@/src/types";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { Href, router } from "expo-router";
import { View } from "react-native";
import { styles } from "./DrawerContent.style";

type DrawerContentProps = DrawerContentComponentProps & {
  modules: Module[];
  claims: Claims|null
};

export function DrawerContent({
  modules = [],
  claims,
  ...drawerProps
}: DrawerContentProps) {
  const { logout } = useLogin()
  const { clearClaims}= useAuthStore.getState()
  

  const handleNavigate = (path: string) => {
    router.push(path as Href);
    drawerProps.navigation.closeDrawer();
  };

  const handleLogout = async() => {
    if(!claims?.sub) return
    await logout.mutateAsync(claims.sub)
    clearClaims()
    router.dismissAll()
    router.replace("/(auth)/Login");
  };

  return (
    <View style={styles.root}>
      <PerfilDrawer name={claims?.username} email={claims?.email}/>

      <Divider style={styles.divider} />

      <DrawerContentScrollView
        {...drawerProps}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionLabel}>NAVEGACIÓN</Text>
        <VStack style={styles.menu}>
          {modules.map((mod) =>
            mod.children?.length ? (
              <AccordionItem
                key={mod.id}
                mod={mod}
                onNavigate={handleNavigate}
              />
            ) : (
              <DrawerItem
                key={mod.id}
                mod={mod}
                onNavigate={handleNavigate}
              />
            )
          )}
        </VStack>
      </DrawerContentScrollView>

      <FooterDrawer handleLogout={handleLogout}/>
    </View>
  );
}
