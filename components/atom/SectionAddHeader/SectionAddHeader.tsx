import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Plus } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

export interface SectionAddHeaderProps {
  title: string;
  /** Texto accesible del botón, ej. "Agregar variante". */
  addLabel: string;
  onAdd: () => void;
}

/** Título de sección con un botón de solo icono (+) alineado a la derecha. */
export function SectionAddHeader({
  title,
  addLabel,
  onAdd,
}: SectionAddHeaderProps) {
  return (
    <HStack style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        onPress={onAdd}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={addLabel}
        style={styles.addButton}
      >
        <Icon as={Plus} size="sm" style={{ color: "#0C447C" }} />
      </Pressable>
    </HStack>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flex: 1,
    paddingRight: 12,
    fontWeight: "bold",
    color: "#555",
    fontSize: 13,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderColor: "#0EA5E9",
    borderWidth: 1,
    borderRadius: 7,
  },
});
