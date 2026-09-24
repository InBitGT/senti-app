import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Key, Shield, Smartphone } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

export function SecuritySection() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <Card className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      {/* Header */}
      <VStack>
        <HStack className="items-center gap-2">
          <Shield size={20} color="#6366f1" />
          <Heading size="lg" className="text-gray-900">
            Seguridad
          </Heading>
        </HStack>
        <Text size="sm" className="text-gray-500">
          Administra tu contrasena y opciones de seguridad
        </Text>
      </VStack>

      <Box className="mt-5">
        <VStack className="gap-6">
          {/* ── Password Section ── */}
          <VStack className="gap-4">
            <HStack className="items-center justify-between">
              <HStack className="items-center gap-3">
                <Center className="size-10 rounded-lg bg-gray-100">
                  <Key size={20} color="#4b5563" />
                </Center>
                <VStack>
                  <Text className="font-medium text-gray-900">Contrasena</Text>
                  <Text size="sm" className="text-gray-500">
                    Ultima actualizacion hace 3 meses
                  </Text>
                </VStack>
              </HStack>
              <AppButton
                label={showPasswordForm ? "Cancelar" : "Cambiar"}
                outline
                outlineBorderColor="#d1d5db"
                outlineTextColor="#374151"
                fullWidth={false}
                onPress={() => setShowPasswordForm(!showPasswordForm)}
              />
            </HStack>

            {showPasswordForm && (
              <VStack className="ml-13 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <AppInput
                  label="Contrasena actual"
                  placeholder="Ingresa tu contrasena actual"
                  secureTextEntry
                  autoCapitalize="none"
                  clearable={false}
                />

                <View>
                  <AppInput
                    label="Nueva contrasena"
                    placeholder="Minimo 8 caracteres"
                    secureTextEntry
                    autoCapitalize="none"
                    clearable={false}
                  />
                  <Text
                    className="text-gray-400 text-xs"
                    style={{ marginTop: 4 }}
                  >
                    Usa al menos 8 caracteres con letras, numeros y simbolos
                  </Text>
                </View>

                <AppInput
                  label="Confirmar contrasena"
                  placeholder="Repite la nueva contrasena"
                  secureTextEntry
                  autoCapitalize="none"
                  clearable={false}
                />

                <View style={{ alignSelf: "flex-start" }}>
                  <AppButton
                    label="Actualizar contrasena"
                    variant="primary"
                    fullWidth={false}
                  />
                </View>
              </VStack>
            )}
          </VStack>

          <Divider className="bg-gray-200" />

          <HStack className="items-center justify-between">
            <HStack className="items-center gap-3 flex-1">
              <Center className="size-10 rounded-lg bg-gray-100">
                <Smartphone size={20} color="#4b5563" />
              </Center>
              <VStack className="flex-1 gap-1">
                <HStack className="items-center gap-2">
                  <Text className="font-medium text-gray-900">
                    Autenticacion de dos factores
                  </Text>
                  <Badge
                    className={
                      twoFactor
                        ? "bg-green-100 rounded-full"
                        : "bg-gray-100 rounded-full"
                    }
                  >
                    <BadgeText
                      className={twoFactor ? "text-green-700" : "text-gray-500"}
                    >
                      {twoFactor ? "Activo" : "Inactivo"}
                    </BadgeText>
                  </Badge>
                </HStack>
                <Text size="sm" className="text-gray-500">
                  Agrega una capa extra de seguridad a tu cuenta
                </Text>
              </VStack>
            </HStack>
            <Switch
              isDisabled
              value={twoFactor}
              onToggle={() => setTwoFactor(!twoFactor)}
              trackColor={{ false: "#d1d5db", true: "#6366f1" }}
              thumbColor="#ffffff"
            />
          </HStack>
        </VStack>
      </Box>
    </Card>
  );
}
