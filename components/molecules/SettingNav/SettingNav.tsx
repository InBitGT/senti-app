import { useLogin } from "@/src/hooks";
import { useAuthStore } from "@/src/store";
import { router } from "expo-router";
import { LogOut, MapPin, User } from "lucide-react-native";
import {
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingsNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "personal", label: "Informacion Personal", icon: User },
  { id: "address", label: "Direccion", icon: MapPin },
  // { id: "security", label: "Seguridad", icon: Shield },
  // { id: "preferences", label: "Preferencias", icon: Bell },
];

export function SettingsNav({
  activeSection,
  onSectionChange,
}: SettingsNavProps) {
  const { logout } = useLogin();
  const { claims, clearClaims } = useAuthStore.getState();

  const handle = async () => {
    if (!claims?.sub) return;
    await logout.mutateAsync(claims?.sub);
    clearClaims();
    router.dismissAll();
    router.replace("/(auth)/Login");
  };

  // Contenido compartido entre la rama web (DesktopScrollView) y la
  // rama nativa (ScrollView de RN), para no duplicar el JSX de los ítems.
  const navContent = (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        return (
          <Pressable
            key={item.id}
            onPress={() => onSectionChange(item.id)}
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: isActive ? "#eef2ff" : "transparent",
              borderWidth: isActive ? 1 : 0,
              borderColor: isActive ? "#c7d2fe" : "transparent",
            }}
          >
            <Icon size={20} color={isActive ? "#6366f1" : "#6b7280"} />
          </Pressable>
        );
      })}

      <View
        style={{
          width: 1,
          height: 24,
          backgroundColor: "#f3f4f6",
          marginHorizontal: 4,
        }}
      />

      <TouchableOpacity
        onPress={handle}
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
        }}
      >
        <LogOut size={20} color="#ef4444" />
      </TouchableOpacity>
    </>
  );

  // FIX: en web/Tauri, envolver DesktopScrollView (overflow-x + drag de
  // mouse) DENTRO de un <ScrollView> de RN genera dos contenedores de
  // scroll horizontal anidados peleándose entre sí. Acá además faltaba
  // el prop `horizontal` en DesktopScrollView, que por defecto deja
  // overflowX en "hidden" y recorta el contenido en vez de dejarlo
  // scrollear — combinando ambos bugs, en desktop los ítems que no
  // entraban en el ancho visible simplemente desaparecían.
  if (Platform.OS === "web") {
    return (
      <View style={{ height: 60 }} className="bg-white rounded-xl">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 8,
            height: 60,
          }}
        >
          {navContent}
        </View>
      </View>
    );
  }

  // En iOS/Android seguimos usando el ScrollView nativo de RN, que ahí sí
  // funciona bien con touch.
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, height: 60 }}
      contentContainerStyle={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 8,
      }}
      className="bg-white rounded-xl"
    >
      {navContent}
    </ScrollView>
  );
}
