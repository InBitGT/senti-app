import { Divider } from "@/components/ui/divider"
import { Text } from "@/components/ui/text"
import { VStack } from "@/components/ui/vstack"
import { useLogin } from "@/src/hooks"
import { useAuthStore } from "@/src/store"
import { router } from "expo-router"
import { Bell, LogOut, MapPin, Shield, User } from "lucide-react-native"
import { Pressable, TouchableOpacity } from "react-native"

interface SettingsNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const navItems = [
  { id: "personal", label: "Informacion Personal", icon: User },
  { id: "address", label: "Direccion", icon: MapPin },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "preferences", label: "Preferencias", icon: Bell },
]

export function SettingsNav({
  activeSection,
  onSectionChange,
}: SettingsNavProps) {
  const {logout} = useLogin()
  const {claims, clearClaims}= useAuthStore.getState()


  const handle = async()=>{
    if(!claims?.sub)return
    await logout.mutateAsync(claims?.sub)
    clearClaims()
    router.dismissAll()
    router.replace("/(auth)/Login")
  }

  return (
    <VStack className="gap-1 bg-white rounded-xl p-2">
      <VStack className="mb-2 px-3 py-2">
        <Text className="text-lg font-semibold tracking-tight text-gray-900">
          Configuracion
        </Text>
        <Text className="text-sm text-gray-500">
          Administra tu cuenta y preferencias
        </Text>
      </VStack>

      <VStack className="gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <Pressable
              key={item.id}
              onPress={() => onSectionChange(item.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isActive ? "#eef2ff" : "transparent",
                borderWidth: isActive ? 1 : 0,
                borderColor: isActive ? "#c7d2fe" : "transparent",
              }}
            >
              <Icon
                size={18}
                color={isActive ? "#6366f1" : "#6b7280"}
              />
              <Text
                size="sm"
                className={
                  isActive
                    ? "font-semibold text-indigo-600"
                    : "font-medium text-gray-600"
                }
              >
                {item.label}
              </Text>
            </Pressable>
          )
        })}
      </VStack>

      <Divider className="my-3 bg-gray-100" />

      <TouchableOpacity
        onPress={handle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 10,
        }}
      >
        <LogOut size={18} color="#ef4444" />
        <Text size="sm" className="font-medium text-red-500">
          Cerrar sesion
        </Text>
      </TouchableOpacity>
    </VStack>
  )
}