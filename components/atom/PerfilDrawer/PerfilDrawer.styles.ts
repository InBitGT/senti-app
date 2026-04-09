import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
     profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    backgroundColor: "#a7a3f0",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  profileInfo: {
    gap: 3,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: 0.1,
  },
  profileMeta: {
    alignItems: "center",
    gap: 4,
  },
  profileEmail: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "400",
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6366f1",
    letterSpacing: 0.3,
  },
})