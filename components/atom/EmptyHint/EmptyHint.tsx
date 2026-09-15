import { Text } from "@/components/ui/text";
import { StyleSheet } from "react-native";

export const EmptyHint = ({ label }: { label: string }) => (
  <Text style={styles.emptyHint}>{label}</Text>
);

const styles = StyleSheet.create({
  emptyHint: {
    color: "#9ca3af",
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 4,
  },
});
