import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { StyleSheet } from "react-native";
import { centerStyle } from "./styles";

type ICenterProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof centerStyle>;

const Center = React.forwardRef<HTMLDivElement, ICenterProps>(function Center(
  { className, style, ...props },
  ref,
) {
  return (
    <div
      className={centerStyle({ class: className })}
      style={StyleSheet.flatten(style as any) as React.CSSProperties}
      {...props}
      ref={ref}
    />
  );
});
Center.displayName = "Center";
export { Center };
