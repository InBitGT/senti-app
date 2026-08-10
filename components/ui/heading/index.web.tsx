import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React, { forwardRef, memo } from "react";
import { StyleSheet } from "react-native";
import { headingStyle } from "./styles";
type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<"h1"> & {
    as?: React.ElementType;
  };

const MappedHeading = memo(
  forwardRef<HTMLHeadingElement, IHeadingProps>(function MappedHeading(
    {
      size,
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      sub,
      italic,
      highlight,
      style,
      ...props
    },
    ref,
  ) {
    const flatStyle = StyleSheet.flatten(style as any) as React.CSSProperties;
    const sharedProps = {
      className: headingStyle({
        size,
        isTruncated: isTruncated as boolean,
        bold: bold as boolean,
        underline: underline as boolean,
        strikeThrough: strikeThrough as boolean,
        sub: sub as boolean,
        italic: italic as boolean,
        highlight: highlight as boolean,
        class: className,
      }),
      style: flatStyle,
      ...props,
    };

    switch (size) {
      case "5xl":
      case "4xl":
      case "3xl":
        return <h1 {...sharedProps} ref={ref} />;
      case "2xl":
        return <h2 {...sharedProps} ref={ref} />;
      case "xl":
        return <h3 {...sharedProps} ref={ref} />;
      case "lg":
        return <h4 {...sharedProps} ref={ref} />;
      case "md":
        return <h5 {...sharedProps} ref={ref} />;
      case "sm":
      case "xs":
        return <h6 {...sharedProps} ref={ref} />;
      default:
        return <h4 {...sharedProps} ref={ref} />;
    }
  }),
);

const Heading = memo(
  forwardRef<HTMLHeadingElement, IHeadingProps>(function Heading(
    { className, size = "lg", as: AsComp, style, ...props },
    ref,
  ) {
    const {
      isTruncated,
      bold,
      underline,
      strikeThrough,
      sub,
      italic,
      highlight,
    } = props;

    const flatStyle = StyleSheet.flatten(style as any) as React.CSSProperties;

    if (AsComp) {
      return (
        <AsComp
          className={headingStyle({
            size,
            isTruncated: isTruncated as boolean,
            bold: bold as boolean,
            underline: underline as boolean,
            strikeThrough: strikeThrough as boolean,
            sub: sub as boolean,
            italic: italic as boolean,
            highlight: highlight as boolean,
            class: className,
          })}
          style={flatStyle}
          {...props}
          ref={ref}
        />
      );
    }

    return (
      <MappedHeading
        className={className}
        size={size}
        style={style}
        ref={ref}
        {...props}
      />
    );
  }),
);

Heading.displayName = "Heading";

export { Heading };
