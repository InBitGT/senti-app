import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";

export const MovementBadge = ({ type }: { type: string }) => {
  const isCharge = type === "charge";
  const bg = isCharge ? "#fee2e2" : "#dcfce7";
  const color = isCharge ? "#dc2626" : "#16a34a";
  const label = isCharge ? "Cargo" : "Pago";

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "500" },
});
