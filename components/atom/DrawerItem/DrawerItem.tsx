import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Module } from '@/src/types';
import { usePathname } from 'expo-router';
import { BarChart2, Grid2x2, LayoutDashboard, LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { styles } from './DrawerItem.styles';


const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  bar_chart: BarChart2,
  '': Grid2x2,
};

export function DrawerItem({
  mod,
  onNavigate,
  isChild = false,
}: {
  mod: Module;
  onNavigate: (path: string) => void;
  isChild?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === mod.path;
  const IconComponent = iconMap[mod.icon] ?? iconMap[''];

  return (
    <Pressable onPress={() => onNavigate(mod.path)}>
      {({ pressed }) => (
        <HStack
          style={[
            styles.item,
            isChild && styles.itemChild,
            isActive && styles.itemActive,
            pressed && !isActive && styles.itemPressed,
          ]}
        >
          <IconComponent
            size={18}
            color={isActive ? '#6366f1' : '#94a3b8'}
            strokeWidth={isActive ? 2.5 : 1.8}
          />
          <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
            {mod.name}
          </Text>
        </HStack>
      )}
    </Pressable>
  );
}

