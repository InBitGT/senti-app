import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";

export const Pill = ({
  label,
  color = "#e0e7ff",
  textColor = "#4338ca",
}: {
  label: string;
  color?: string;
  textColor?: string;
}) => (
  <View style={[styles.pill, { backgroundColor: color }]}>
    <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: "500" },
});
