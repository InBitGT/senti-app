import {
  AddressSection,
  PreferencesSection,
  SecuritySection,
} from "@/components";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { SettingsNav } from "@/components/molecules/SettingNav";
import { PersonalInfoSection } from "@/components/organisms/PersonalInfoSection";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ProfileScreen() {
  const [activeSection, setActiveSection] = useState("personal");

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
      default:
        return <PersonalInfoSection />;
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      className="bg-background-700"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1">
          <DesktopScrollView>
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
          </DesktopScrollView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
