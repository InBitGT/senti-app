import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { StyleSheet } from "react-native";
import { boxStyle } from "./styles";

type IBoxProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof boxStyle> & { className?: string };

const Box = React.forwardRef<HTMLDivElement, IBoxProps>(function Box(
  { className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={boxStyle({ class: className })}
      style={StyleSheet.flatten(style as any) as React.CSSProperties}
      {...props}
    />
  );
});
Box.displayName = "Box";
export { Box };
