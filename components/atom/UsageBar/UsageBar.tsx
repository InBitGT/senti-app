import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";

export const UsageBar = ({ used, limit }: { used: number; limit: number }) => {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = pct >= 90 ? "#dc2626" : pct >= 60 ? "#d97706" : "#16a34a";

  return (
    <View style={{ marginTop: 4, marginBottom: 4 }}>
      <View style={styles.usageTrack}>
        <View
          style={[
            styles.usageFill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
        {pct}% del límite utilizado
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  usageTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  usageFill: { height: 8, borderRadius: 4 },
});
