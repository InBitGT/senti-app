import { StyleSheet, View } from "react-native";

export const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
});
