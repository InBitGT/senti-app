import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";

export const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  statBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    margin: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});
