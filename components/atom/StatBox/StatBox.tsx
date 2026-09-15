import { Text } from "@/components/ui/text";
import { useDimensions } from "@/src/utils/dimentions/dimentions";
import { StyleSheet, View } from "react-native";

export const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => {
  const isDesktopWeb = useDimensions();

  return (
    <View style={[styles.statBox, { margin: isDesktopWeb ? 1 : 0 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
