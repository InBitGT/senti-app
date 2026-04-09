import { AddressSection, PersonalInfoSection, PreferencesSection, SecuritySection, SettingsNav } from "@/components"
import { Box } from "@/components/ui/box"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { Text } from "@/components/ui/text"
import { VStack } from "@/components/ui/vstack"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const sectionTitles: Record<string, { title: string; description: string }> = {
  personal: {
    title: "Informacion Personal",
    description: "Actualiza tu informacion de perfil y datos de contacto.",
  },
  address: {
    title: "Direccion",
    description: "Administra tu direccion de envio y facturacion.",
  },
  security: {
    title: "Seguridad",
    description: "Protege tu cuenta con opciones de seguridad avanzadas.",
  },
  preferences: {
    title: "Preferencias",
    description: "Personaliza como interactuas con la plataforma.",
  },
  billing: {
    title: "Facturacion",
    description: "Gestiona tus pagos y revisa tu historial de facturas.",
  },
}

export function ProfileScreen() {

  const [activeSection, setActiveSection] = useState("personal")

  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return <PersonalInfoSection />
      case "address":
        return <AddressSection />
      case "security":
        return <SecuritySection />
      case "preferences":
        return <PreferencesSection />
      default:
        return <PersonalInfoSection />
    }
  }

  const currentSection = sectionTitles[activeSection] ?? sectionTitles.personal

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background-700">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView className="flex-1">
        <Box className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
          <HStack className="gap-8">
              <Box className="w-64 shrink-0">
                <Box className="rounded-xl border border-gray-200">
                  <SettingsNav
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                  />
                </Box>
              </Box>

            <VStack className="flex-1 gap-6">
              <VStack className="gap-1">
                <Heading size="2xl" className="text-black">{currentSection.title}</Heading>
                <Text className="text-typography-500">
                  {currentSection.description}
                </Text>
              </VStack>

              {renderSection()}
            </VStack>
          </HStack>
        </Box>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}