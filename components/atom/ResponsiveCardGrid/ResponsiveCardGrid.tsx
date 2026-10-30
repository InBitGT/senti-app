import { DESKTOP_BREAKPOINT } from "@/const/Dimensions";
import React from "react";
import {
    LayoutChangeEvent,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

/** A partir de este ancho de pantalla caben 3 tarjetas por fila. */
const WIDE_DESKTOP_BREAKPOINT = 1200;
const DEFAULT_GAP = 12;

export interface ResponsiveCardGridProps {
  children: React.ReactNode;
  gap?: number;
}

function getColumns(screenWidth: number): number {
  if (screenWidth >= WIDE_DESKTOP_BREAKPOINT) return 3;
  if (screenWidth >= DESKTOP_BREAKPOINT) return 2;
  return 1;
}

/**
 * Acomoda tarjetas pequeñas según el dispositivo:
 * teléfono → 1 por fila, tablet → 2, escritorio ancho → 3.
 */
export function ResponsiveCardGrid({
  children,
  gap = DEFAULT_GAP,
}: ResponsiveCardGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = React.useState<number>(0);

  const columns = getColumns(screenWidth);
  const items = React.Children.toArray(children);

  const handleLayout = (event: LayoutChangeEvent): void => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth !== containerWidth) setContainerWidth(nextWidth);
  };

  const itemWidth =
    columns === 1 || containerWidth === 0
      ? "100%"
      : (containerWidth - gap * (columns - 1)) / columns;

  if (items.length === 0) return null;

  return (
    <View onLayout={handleLayout} style={[styles.grid, { gap }]}>
      {items.map((child, index) => (
        <View
          key={React.isValidElement(child) && child.key ? child.key : index}
          style={{ width: itemWidth }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
});
