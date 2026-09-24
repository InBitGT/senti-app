import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";

export const Badge = ({
  active,
  labels = ["Con crédito", "Sin crédito"],
}: {
  active: boolean;
  labels?: [string, string];
}) => (
  <View
    style={[styles.badge, { backgroundColor: active ? "#dcfce7" : "#fee2e2" }]}
  >
    <Text style={[styles.badgeText, { color: active ? "#16a34a" : "#dc2626" }]}>
      {active ? labels[0] : labels[1]}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "500" },
});
