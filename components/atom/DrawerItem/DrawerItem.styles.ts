import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
  },
  itemChild: {
    marginVertical: 0,
  },
  itemActive: {
    backgroundColor: "#eef2ff",
  },
  itemPressed: {
    backgroundColor: "#f8fafc",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    letterSpacing: 0.1,
  },
  itemTextActive: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4f46e5",
  },
});
