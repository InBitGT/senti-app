import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";

export const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  label: {
    color: "#6b7280",
    fontSize: 13,
    flex: 1,
  },
  value: {
    color: "#111827",
    fontSize: 13,
    flex: 1.5,
    textAlign: "right",
  },
});
