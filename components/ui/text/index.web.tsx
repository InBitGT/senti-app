import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { StyleSheet } from "react-native";
import { textStyle } from "./styles";

type ITextProps = React.ComponentProps<"span"> & VariantProps<typeof textStyle>;

const Text = React.forwardRef<React.ComponentRef<"span">, ITextProps>(
  function Text(
    {
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      size = "md",
      sub,
      italic,
      highlight,
      style,
      ...props
    }: { className?: string } & ITextProps,
    ref,
  ) {
    return (
      <span
        className={textStyle({
          isTruncated: isTruncated as boolean,
          bold: bold as boolean,
          underline: underline as boolean,
          strikeThrough: strikeThrough as boolean,
          size,
          sub: sub as boolean,
          italic: italic as boolean,
          highlight: highlight as boolean,
          class: className,
        })}
        style={StyleSheet.flatten(style as any) as React.CSSProperties}
        {...props}
        ref={ref}
      />
    );
  },
);
Text.displayName = "Text";
export { Text };
