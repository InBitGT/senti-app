import { Box } from "@/components/ui/box"
import { Card } from "@/components/ui/card"
import { Divider } from "@/components/ui/divider"
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
} from "@/components/ui/form-control"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { RadioGroup } from "@/components/ui/radio"
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Text } from "@/components/ui/text"
import { VStack } from "@/components/ui/vstack"
import {
    Bell,
    ChevronDown,
    CreditCard,
    Languages,
    Moon,
    Sun,
} from "lucide-react-native"
import { useState } from "react"
import { Pressable } from "react-native"

export function PreferencesSection() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    theme: "system",
    language: "es",
    currency: "MXN",
  })

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleChange = (key: keyof typeof preferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      {/* Header */}
      <VStack>
        <HStack className="items-center gap-2">
          <Bell size={20} color="#6366f1" />
          <Heading size="lg" className="text-gray-900">
            Preferencias
          </Heading>
        </HStack>
        <Text size="sm" className="text-gray-500">
          Personaliza tu experiencia en la plataforma
        </Text>
      </VStack>

      <Box className="mt-5">
        <VStack className="gap-6">
          {/* ── Notifications ── */}
          <VStack className="gap-4">
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wider text-gray-400"
            >
              Notificaciones
            </Text>

            <VStack className="gap-5">
              {/* Email Notifications */}
              <HStack className="items-center justify-between">
                <VStack className="flex-1 mr-4">
                  <Text className="font-medium text-gray-900">
                    Notificaciones por correo
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    Recibe actualizaciones importantes en tu correo
                  </Text>
                </VStack>
                <Switch
                  value={preferences.emailNotifications}
                  onToggle={() => handleToggle("emailNotifications")}
                  trackColor={{ false: "#d1d5db", true: "#6366f1" }}
                  thumbColor="#ffffff"
                />
              </HStack>

              {/* Push Notifications */}
              <HStack className="items-center justify-between">
                <VStack className="flex-1 mr-4">
                  <Text className="font-medium text-gray-900">
                    Notificaciones push
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    Alertas en tiempo real en tu navegador
                  </Text>
                </VStack>
                <Switch
                  value={preferences.pushNotifications}
                  onToggle={() => handleToggle("pushNotifications")}
                  trackColor={{ false: "#d1d5db", true: "#6366f1" }}
                  thumbColor="#ffffff"
                />
              </HStack>

              {/* Marketing Emails */}
              <HStack className="items-center justify-between">
                <VStack className="flex-1 mr-4">
                  <Text className="font-medium text-gray-900">
                    Correos de marketing
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    Ofertas, novedades y promociones especiales
                  </Text>
                </VStack>
                <Switch
                  value={preferences.marketingEmails}
                  onToggle={() => handleToggle("marketingEmails")}
                  trackColor={{ false: "#d1d5db", true: "#6366f1" }}
                  thumbColor="#ffffff"
                />
              </HStack>
            </VStack>
          </VStack>

          <Divider className="bg-gray-200" />

          {/* ── Appearance ── */}
          <VStack className="gap-4">
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wider text-gray-400"
            >
              Apariencia
            </Text>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700 text-sm font-medium">
                  Tema de la interfaz
                </FormControlLabelText>
              </FormControlLabel>

              <RadioGroup
                value={preferences.theme}
                onChange={(value) => handleChange("theme", value)}
              >
                <HStack className="gap-4 mt-2">
                  <Pressable
                    onPress={() => handleChange("theme", "light")}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:
                        preferences.theme === "light" ? "#6366f1" : "#e5e7eb",
                      backgroundColor:
                        preferences.theme === "light" ? "#eef2ff" : "#f9fafb",
                      paddingVertical: 16,
                    }}
                  >
                    <Sun size={24} color="#374151" style={{ marginBottom: 8 }} />
                    <Text size="sm" className="font-medium text-gray-700">
                      Claro
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleChange("theme", "dark")}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:
                        preferences.theme === "dark" ? "#6366f1" : "#e5e7eb",
                      backgroundColor:
                        preferences.theme === "dark" ? "#eef2ff" : "#f9fafb",
                      paddingVertical: 16,
                    }}
                  >
                    <Moon
                      size={24}
                      color="#374151"
                      style={{ marginBottom: 8 }}
                    />
                    <Text size="sm" className="font-medium text-gray-700">
                      Oscuro
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleChange("theme", "system")}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:
                        preferences.theme === "system" ? "#6366f1" : "#e5e7eb",
                      backgroundColor:
                        preferences.theme === "system" ? "#eef2ff" : "#f9fafb",
                      paddingVertical: 16,
                    }}
                  >
                    <HStack className="mb-2">
                      <Sun size={16} color="#374151" />
                      <Moon size={16} color="#374151" />
                    </HStack>
                    <Text size="sm" className="font-medium text-gray-700">
                      Sistema
                    </Text>
                  </Pressable>
                </HStack>
              </RadioGroup>
            </FormControl>
          </VStack>

          <Divider className="bg-gray-200" />

          {/* ── Regional ── */}
          <VStack className="gap-4">
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wider text-gray-400"
            >
              Regional
            </Text>

            <HStack className="gap-4 flex-wrap sm:flex-nowrap">
              <FormControl className="flex-1">
                <FormControlLabel>
                  <HStack className="items-center gap-2">
                    <Languages size={16} color="#9ca3af" />
                    <FormControlLabelText className="text-gray-700 text-sm font-medium">
                      Idioma
                    </FormControlLabelText>
                  </HStack>
                </FormControlLabel>
                <Select
                  selectedValue={preferences.language}
                  onValueChange={(value) => handleChange("language", value)}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg h-11">
                    <SelectInput
                      placeholder="Selecciona un idioma"
                      className="text-gray-900 placeholder:text-gray-400"
                    />
                    <SelectIcon as={ChevronDown} className="mr-3 text-gray-400" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="bg-white">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Espanol" value="es" />
                      <SelectItem label="English" value="en" />
                      <SelectItem label="Portugues" value="pt" />
                      <SelectItem label="Francais" value="fr" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

              <FormControl className="flex-1">
                <FormControlLabel>
                  <HStack className="items-center gap-2">
                    <CreditCard size={16} color="#9ca3af" />
                    <FormControlLabelText className="text-gray-700 text-sm font-medium">
                      Moneda
                    </FormControlLabelText>
                  </HStack>
                </FormControlLabel>
                <Select
                  selectedValue={preferences.currency}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg h-11">
                    <SelectInput
                      placeholder="Selecciona una moneda"
                      className="text-gray-900 placeholder:text-gray-400"
                    />
                    <SelectIcon as={ChevronDown} className="mr-3 text-gray-400" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="bg-white">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="MXN - Peso Mexicano" value="MXN" />
                      <SelectItem label="USD - Dolar Americano" value="USD" />
                      <SelectItem label="EUR - Euro" value="EUR" />
                      <SelectItem label="COP - Peso Colombiano" value="COP" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Card>
  )
}