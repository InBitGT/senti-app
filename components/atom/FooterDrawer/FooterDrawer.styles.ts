import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  divider: {
    backgroundColor: "#f1f5f9",
  },
  footer: {
    paddingBottom: 32,
    backgroundColor: "#ffffff",
  },
  logoutButton: {
    alignItems: "center",
    gap: 12,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutPressed: {
    backgroundColor: "#fef2f2",
  },
  logoutIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#910909",
  },
  logoutSub: {
    fontSize: 11,
    color: "#862a2a",
    fontWeight: "400",
  },
})