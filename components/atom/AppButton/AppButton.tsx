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

/**
 * Botón estándar de la app, construido solo con primitivos de React
 * Native (TouchableOpacity, Text, ActivityIndicator, StyleSheet).
 *
 * Mismo criterio que AppInput/AppSelect: no depende de gluestack-ui ni
 * de NativeWind/cssInterop.
 *
 * Uso básico:
 * <AppButton label="Guardar" variant="primary" onPress={handleSubmit} />
 *
 * Deshabilitado (usa automáticamente el color "disabled" de la variante):
 * <AppButton label="Guardar" variant="primary" isDisabled />
 */
export function AppButton({
  label,
  onPress,
  variant = "black",
  isDisabled = false,
  isLoading = false,
  icon: IconComponent,
  fullWidth = true,
}: AppButtonProps) {
  const disabled = isDisabled || isLoading;
  const colors = VARIANT_COLORS[variant];
  const backgroundColor = disabled ? colors.disabled : colors.base;

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        { backgroundColor },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View style={styles.content}>
          {IconComponent && (
            <IconComponent size={16} color="#fff" style={styles.icon} />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    minHeight: 20,
  },
});
