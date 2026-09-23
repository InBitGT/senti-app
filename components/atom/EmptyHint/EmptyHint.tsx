import { LucideIcon } from "lucide-react-native";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface EmptyHintProps {
  /** Texto principal. */
  label: string;
  /** Texto secundario opcional, debajo del label. */
  description?: string;
  /** Ícono opcional arriba del texto (de lucide-react-native). */
  icon?: LucideIcon;
  /** Tamaño del ícono. Default: 40. */
  iconSize?: number;
  /** Color del ícono. Default: gris claro. */
  iconColor?: string;
  /** Contenido extra debajo del texto, por ejemplo un botón. */
  children?: React.ReactNode;
  /** Override del contenedor. */
  style?: StyleProp<ViewStyle>;
}

export const EmptyHint = ({
  label,
  description,
  icon: IconComponent,
  iconSize = 40,
  iconColor = "#d1d5db",
  children,
  style,
}: EmptyHintProps) => (
  <View style={[styles.container, style]}>
    {IconComponent && (
      <IconComponent size={iconSize} color={iconColor} style={styles.icon} />
    )}

    <Text style={styles.label}>{label}</Text>

    {!!description && <Text style={styles.description}>{description}</Text>}

    {children && <View style={styles.action}>{children}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 16,
    paddingRight: 16,
  },
  icon: {
    marginBottom: 8,
  },
  label: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  description: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  action: {
    marginTop: 12,
  },
});
