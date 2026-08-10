import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { StyleSheet } from "react-native";
import { hstackStyle } from "./styles";

type IHStackProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof hstackStyle>;

const HStack = React.forwardRef<React.ComponentRef<"div">, IHStackProps>(
  function HStack({ className, space, reversed, style, ...props }, ref) {
    return (
      <div
        className={hstackStyle({
          space,
          reversed: reversed as boolean,
          class: className,
        })}
        style={StyleSheet.flatten(style as any) as React.CSSProperties}
        {...props}
        ref={ref}
      />
    );
  },
);
HStack.displayName = "HStack";
export { HStack };
