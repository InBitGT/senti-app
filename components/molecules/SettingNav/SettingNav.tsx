import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { useLogin } from "@/src/hooks";
import { useAuthStore } from "@/src/store";
import { router } from "expo-router";
import { Bell, LogOut, MapPin, Shield, User } from "lucide-react-native";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";

interface SettingsNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "personal", label: "Informacion Personal", icon: User },
  { id: "address", label: "Direccion", icon: MapPin },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "preferences", label: "Preferencias", icon: Bell },
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
      <DesktopScrollView>
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
      </DesktopScrollView>
    </ScrollView>
  );
}
