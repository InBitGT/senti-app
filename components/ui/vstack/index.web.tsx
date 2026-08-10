import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { StyleSheet } from "react-native";
import { vstackStyle } from "./styles";

type IVStackProps = React.ComponentProps<"div"> &
  VariantProps<typeof vstackStyle>;

const VStack = React.forwardRef<React.ComponentRef<"div">, IVStackProps>(
  function VStack({ className, space, reversed, style, ...props }, ref) {
    return (
      <div
        className={vstackStyle({
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
VStack.displayName = "VStack";
export { VStack };
