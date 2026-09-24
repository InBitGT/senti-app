import { DESKTOP_BREAKPOINT } from "@/const/Dimensions";
import { Platform, useWindowDimensions } from "react-native";

export function useDimensions(): boolean {
  const { width } = useWindowDimensions();

  const isDesktopWeb = Platform.OS === "web" && width >= DESKTOP_BREAKPOINT;
  return isDesktopWeb;
}
