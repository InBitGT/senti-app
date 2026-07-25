import { StyleSheet, Text, View } from "react-native";

export function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 11, color: "#888", marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
});
