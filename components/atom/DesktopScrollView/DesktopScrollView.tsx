import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface DesktopScrollViewProps extends Omit<
  ScrollViewProps,
  "style" | "contentContainerStyle" | "children"
> {
  children: React.ReactNode;
  useWindowHeight?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  webProps?: Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "style">;
  className?: string;
}

function flattenStyleForWeb(style?: StyleProp<ViewStyle>): CSSProperties {
  return (StyleSheet.flatten(style) || {}) as unknown as CSSProperties;
}

let scrollbarStyleInjected = false;
function injectHideScrollbarStyle() {
  if (scrollbarStyleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `
    .dsv-hide-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .dsv-hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
  scrollbarStyleInjected = true;
}

// NUEVO: sin esto, ningún flex:1 dentro del árbol tiene un límite real
// de altura que respetar — html/body/#root crecen con el contenido en
// vez de quedarse fijos al viewport, y el "overflow: auto" nunca se activa.
let baseHeightStyleInjected = false;
function injectBaseHeightResetStyle() {
  if (baseHeightStyleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `
    html, body, #root, #root > div {
      height: 100%;
    }
    body {
      overflow: hidden; /* el scroll real lo maneja cada DesktopScrollView, no la página */
      margin: 0;
    }
    #root {
      display: flex;
      flex-direction: column;
    }
  `;
  document.head.appendChild(style);
  baseHeightStyleInjected = true;
}

export function DesktopScrollView({
  children,
  useWindowHeight = false,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  bounces = true,
  style,
  contentContainerStyle,
  webProps,
  className,
  ...rest
}: DesktopScrollViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const handleWindowMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = x - dragState.current.startX;
    containerRef.current.scrollLeft = dragState.current.scrollLeft + walk;
  }, []);

  const handleWindowMouseUp = useCallback(() => {
    dragState.current.isDown = false;
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
  }, [handleWindowMouseMove]);

  useEffect(() => {
    return () => {
      if (Platform.OS === "web") {
        window.removeEventListener("mousemove", handleWindowMouseMove);
        window.removeEventListener("mouseup", handleWindowMouseUp);
      }
    };
  }, [handleWindowMouseMove, handleWindowMouseUp]);

  if (Platform.OS === "web") {
    injectBaseHeightResetStyle(); // siempre, no solo cuando se oculta el scrollbar

    const hideScrollbar =
      !showsVerticalScrollIndicator || !showsHorizontalScrollIndicator;
    if (hideScrollbar) injectHideScrollbarStyle();

    const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!horizontal || !containerRef.current) return;
      dragState.current.isDown = true;
      dragState.current.startX = e.pageX - containerRef.current.offsetLeft;
      dragState.current.scrollLeft = containerRef.current.scrollLeft;
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleWindowMouseUp);
    };

    return (
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        {...webProps}
        className={[hideScrollbar ? "dsv-hide-scrollbar" : "", className]
          .filter(Boolean)
          .join(" ")}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          ...(useWindowHeight ? { height: "100%", flex: undefined } : {}),
          overflowY: horizontal ? "hidden" : "auto",
          overflowX: horizontal ? "auto" : "hidden",
          overscrollBehavior: bounces ? "auto" : "contain",
          cursor: horizontal ? "grab" : undefined,
          userSelect: horizontal ? "none" : undefined,
          WebkitUserSelect: horizontal ? "none" : undefined,
          paddingBottom: horizontal ? 10 : undefined,
          ...flattenStyleForWeb(style),
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: horizontal ? "row" : "column",
            minHeight: horizontal ? undefined : "100%",
            minWidth: horizontal ? "100%" : undefined,
            boxSizing: "border-box",
            ...flattenStyleForWeb(contentContainerStyle),
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <ScrollView
      className={className}
      horizontal={horizontal}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      bounces={bounces}
      style={[
        { flex: 1 },
        useWindowHeight
          ? { height: Dimensions.get("window").height }
          : undefined,
        style,
      ]}
      contentContainerStyle={[
        { flexGrow: 1 },
        horizontal ? { paddingBottom: 10 } : undefined,
        contentContainerStyle,
      ]}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
