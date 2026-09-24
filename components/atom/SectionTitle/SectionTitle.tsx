import { Text } from "@/components/ui/text";
import { StyleSheet } from "react-native";

export const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
});
