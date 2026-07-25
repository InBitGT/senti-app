import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface FilterPillProps {
  label: string;
  active: boolean;
  color?: string;
  bg?: string;
  onPress: () => void;
  isGroup?: boolean;
}

export function FilterPill({
  label,
  active,
  color,
  bg,
  onPress,
  isGroup,
}: FilterPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        active && {
          backgroundColor: bg ?? "#EAF3DE",
          borderColor: color ?? "#27500A",
        },
      ]}
    >
      <Text
        style={[
          styles.pillText,
          active && { color: color ?? "#27500A", fontWeight: "600" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    backgroundColor: "#fff",
  },
  pillText: { fontSize: 12, color: "#666" },
});
