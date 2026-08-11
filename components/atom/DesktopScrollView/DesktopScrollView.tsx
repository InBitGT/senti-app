import { Platform, View } from "react-native";

export function DesktopScrollView({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          // height: window.innerHeight,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {children}
      </div>
    );
  }

  return <View style={{ flex: 1 }}>{children}</View>;
}
