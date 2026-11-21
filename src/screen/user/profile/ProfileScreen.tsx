import {
  AddressSection,
  PreferencesSection,
  SecuritySection,
} from "@/components";
import { SettingsNav } from "@/components/molecules/SettingNav";
import { PersonalInfoSection } from "@/components/organisms/PersonalInfoSection";
import { PrinterSection } from "@/components/organisms/PrinterSection";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ProfileScreen() {
  // `?section=printer` permite abrir una sección directo (p. ej. desde el
  // aviso de impresora desconectada).
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [activeSection, setActiveSection] = useState(section ?? "personal");
  const [lastSection, setLastSection] = useState(section);
  if (section !== lastSection) {
    setLastSection(section);
    if (section) setActiveSection(section);
  }

  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return <PersonalInfoSection />;
      case "address":
        return <AddressSection />;
      case "security":
        return <SecuritySection />;
      case "preferences":
        return <PreferencesSection />;
      case "printer":
        return <PrinterSection />;
      default:
        return <PersonalInfoSection />;
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      className="bg-background-700"
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1">
          <Box className="mx-auto max-w-7xl w-full px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            <VStack className="gap-4 lg:gap-6">
              <Box className="rounded-xl border border-gray-200 overflow-hidden w-full">
                <SettingsNav
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </Box>

              <VStack className="gap-4 lg:gap-6">{renderSection()}</VStack>
            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
