import * as LucideIcons from 'lucide-react-native';
import { Grid2x2, LucideIcon } from 'lucide-react-native';

// Convierte snake_case a PascalCase para matchear con lucide-react-native
// Ejemplo: "bar_chart" -> "BarChart", "layout_dashboard" -> "LayoutDashboard"
const toPascalCase = (str: string): string =>
  str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export const getIcon = (iconName: string): LucideIcon => {
  const pascalName = toPascalCase(iconName);
  const Icon = (LucideIcons as Record<string, unknown>)[pascalName];
  return (Icon as LucideIcon) ?? Grid2x2;
};