import { useDimensions } from "@/src/utils/dimentions/dimentions";
import { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type AppButtonVariant = "black" | "primary" | "info";

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  isDisabled?: boolean;
  isLoading?: boolean;
  /** Ícono opcional a la izquierda del texto (de lucide-react-native). */
  icon?: LucideIcon;
  /** Ocupa el 100% del ancho disponible. Default: true. */
  fullWidth?: boolean;
  /** Fondo blanco, borde y texto del color de la variante (en vez de relleno). */
  outline?: boolean;
  /**
   * Solo aplica con `outline`. Overridea el color del borde en vez de
   * usar el color de la variante (ej. un gris neutro para botones
   * secundarios de toolbar).
   */
  outlineBorderColor?: string;
  /** Solo aplica con `outline`. Overridea el color del texto/ícono. */
  outlineTextColor?: string;
  /**
   * Si es true, fuera de desktop web (ver `useDimensions`) el botón se
   * encoge a un cuadrado que muestra solo el ícono (sin texto).
   * Requiere `icon` -- si no hay ícono, se ignora y se muestra el
   * botón normal igual. Default: false.
   */
  shrinkOnMobile?: boolean;
}

// Colores base por variante y su versión "desactivada" (más clara/apagada,
// pensada para mantenerse legible sobre texto blanco).
const VARIANT_COLORS: Record<
  AppButtonVariant,
  { base: string; disabled: string }
> = {
  black: { base: "#000000", disabled: "#9CA3AF" },
  primary: { base: "#8B5CF6", disabled: "#D8CBFB" },
  info: { base: "#0EA5E9", disabled: "#BAE6FD" },
};

export function AppButton({
  label,
  onPress,
  variant = "black",
  isDisabled = false,
  isLoading = false,
  icon: IconComponent,
  fullWidth = true,
  outline = false,
  outlineBorderColor,
  outlineTextColor,
  shrinkOnMobile = false,
}: AppButtonProps) {
  const isDesktopWeb = useDimensions();
  const iconOnly = shrinkOnMobile && !isDesktopWeb && !!IconComponent;

  const disabled = isDisabled || isLoading;
  const colors = VARIANT_COLORS[variant];
  const mainColor = disabled ? colors.disabled : colors.base;

  const backgroundColor = outline ? "#ffffff" : mainColor;
  const borderColor = outline ? (outlineBorderColor ?? mainColor) : mainColor;
  const contentColor = outline ? (outlineTextColor ?? mainColor) : "#ffffff";

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        fullWidth && !iconOnly && styles.fullWidth,
        iconOnly && styles.iconOnly,
        { backgroundColor, borderColor },
      ]}
      accessibilityLabel={iconOnly ? label : undefined}
    >
      {isLoading ? (
        <ActivityIndicator color={contentColor} size="small" />
      ) : (
        <View style={[styles.content, iconOnly && styles.contentIconOnly]}>
          {IconComponent && (
            <IconComponent
              size={16}
              color={contentColor}
              style={!iconOnly ? styles.icon : undefined}
            />
          )}
          {!iconOnly && (
            <Text style={[styles.label, { color: contentColor }]}>{label}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  iconOnly: {
    width: 40,
    height: 40,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  contentIconOnly: {
    flex: 1,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    minHeight: 10,
  },
});
