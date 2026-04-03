import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Module } from "@/src/types";
import { usePathname } from "expo-router";
import { BarChart2, ChevronDown, ChevronRight, Grid2x2, LayoutDashboard } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { DrawerItem } from "../DrawerItem";
import { styles } from "./AccordionItem.style";

const iconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  bar_chart: BarChart2,
  '': Grid2x2,
};

export function AccordionItem({
  mod,
  onNavigate,
}: {
  mod: Module;
  onNavigate: (path: string) => void;
}) {
  const pathname = usePathname();
  const hasChildren = !!mod.children?.length;
  const isChildActive = mod.children?.some((c:any) => pathname === c.path) ?? false;
  const [open, setOpen] = useState(isChildActive);

  const IconComponent = iconMap[mod.icon] ?? iconMap[''];

  const handlePress = () => {
    if (hasChildren) {
      setOpen((o) => !o);
    } else if (mod.path) {
      onNavigate(mod.path);
    }
  };

  return (
    <VStack style={styles.accordionContainer}>
      <Pressable onPress={handlePress}>
        {({ pressed }: { pressed: boolean }) => (
          <HStack
            style={[
              styles.item,
              isChildActive && styles.itemActive,
              pressed && !isChildActive && styles.itemPressed,
            ]}
          >
            <IconComponent size={18} color={isChildActive ? '#6366f1' : '#94a3b8'} />
            <Text
              style={[
                styles.itemText,
                styles.itemTextFlex,
                isChildActive && styles.itemTextActive,
              ]}
            >
              {mod.name}
            </Text>
            {open ? (
                <ChevronDown size={16} color={isChildActive ? '#6366f1' : '#94a3b8'} />
            ) : (
                <ChevronRight size={16} color={isChildActive ? '#6366f1' : '#94a3b8'} />
            )}
          </HStack>
        )}
      </Pressable>

      {open && hasChildren && (
        <Box style={styles.childrenWrapper}>
          <VStack>
            {mod.children!.map((child) => (
              <DrawerItem
                key={child.id}
                mod={child}
                onNavigate={onNavigate}
                isChild
              />
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}
