import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import { Platform, View } from "react-native";

interface DesktopScrollViewProps {
  children: React.ReactNode;
  useWindowHeight?: boolean;
  horizontal?: boolean;
}

export function DesktopScrollView({
  children,
  useWindowHeight = false,
  horizontal = false,
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
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [handleWindowMouseMove, handleWindowMouseUp]);

  if (Platform.OS === "web") {
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
        style={{
          ...(useWindowHeight ? { height: window.innerHeight } : {}),
          overflowY: horizontal ? "hidden" : "auto",
          overflowX: horizontal ? "auto" : "hidden",
          cursor: horizontal ? "grab" : undefined,
          userSelect: horizontal ? "none" : undefined,
          WebkitUserSelect: horizontal ? "none" : undefined,
          paddingBottom: horizontal ? 10 : undefined,
        }}
      >
        {children}
      </div>
    );
  }

  return <View style={{ flex: 1 }}>{children}</View>;
}
