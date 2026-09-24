import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { RadioGroup } from "@/components/ui/radio";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Bell, CreditCard, Languages, Moon, Sun } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

const LANGUAGE_OPTIONS = [
  { label: "Espanol", value: "es" },
  { label: "English", value: "en" },
];

const CURRENCY_OPTIONS = [{ label: "Quetzales", value: "GTQ" }];

export function PreferencesSection() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    theme: "system",
    language: "es",
    currency: "MXN",
  });

  // const handleToggle = (key: keyof typeof preferences) => {
  //   setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  // };

  const handleChange = (key: keyof typeof preferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

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
          <VStack className="gap-4">
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wider text-gray-400"
            >
              Apariencia
            </Text>

            <View>
              <Text className="text-gray-700 text-sm font-medium">
                Tema de la interfaz
              </Text>

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
                    <Sun
                      size={24}
                      color="#374151"
                      style={{ marginBottom: 8 }}
                    />
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
            </View>
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
              <View className="flex-1" style={{ minWidth: 160 }}>
                {/* Label con icono: se arma afuera porque el label de AppSelect es solo texto */}
                <HStack
                  className="items-center gap-2"
                  style={{ marginBottom: 6 }}
                >
                  <Languages size={16} color="#9ca3af" />
                  <Text className="text-gray-700 text-sm font-medium">
                    Idioma
                  </Text>
                </HStack>
                <AppSelect
                  placeholder="Selecciona un idioma"
                  searchable={false}
                  isDisabled
                  options={LANGUAGE_OPTIONS}
                  value={preferences.language}
                  onChange={(value) => handleChange("language", value)}
                />
              </View>

              <View className="flex-1" style={{ minWidth: 160 }}>
                <HStack
                  className="items-center gap-2"
                  style={{ marginBottom: 6 }}
                >
                  <CreditCard size={16} color="#9ca3af" />
                  <Text className="text-gray-700 text-sm font-medium">
                    Moneda
                  </Text>
                </HStack>
                <AppSelect
                  placeholder="Selecciona una moneda"
                  searchable={false}
                  isDisabled
                  options={CURRENCY_OPTIONS}
                  value={preferences.currency}
                  onChange={(value) => handleChange("currency", value)}
                />
              </View>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Card>
  );
}
