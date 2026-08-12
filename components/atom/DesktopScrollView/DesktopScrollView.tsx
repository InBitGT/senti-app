import { Platform, View } from "react-native";

interface DesktopScrollViewProps {
  children: React.ReactNode;
  useWindowHeight?: boolean;
}

export function DesktopScrollView({
  children,
  useWindowHeight = false,
}: DesktopScrollViewProps) {
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          ...(useWindowHeight ? { height: window.innerHeight } : {}),
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
