import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import { Platform, View } from "react-native";

interface DesktopScrollViewProps {
  children: React.ReactNode;
  useWindowHeight?: boolean;
  // FIX: antes `overflowX` estaba fijo en "hidden" sin importar el caso
  // de uso, así que cualquier fila horizontal (ej. las categorías del
  // POS) quedaba con su contenido recortado y nunca llegaba a
  // "desbordar" — por eso no había nada que scrollear ni con mouse ni
  // con touch. Con `horizontal`, el eje que se deja scrollear cambia.
  horizontal?: boolean;
}

export function DesktopScrollView({
  children,
  useWindowHeight = false,
  horizontal = false,
}: DesktopScrollViewProps) {
  // Estado del drag-to-scroll. Va en un ref (no en useState) a propósito:
  // se actualiza en cada mousemove mientras se arrastra, y no necesitamos
  // re-renderizar por eso — solo mutamos `scrollLeft` del DOM directamente.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  // FIX: antes mousemove/mouseup solo se escuchaban en el propio
  // contenedor (onMouseMove/onMouseUp/onMouseLeave). La fila de
  // categorías es angosta (poca altura), así que con un arrastre rápido
  // el cursor se salía de esa franja apenas un poco y `onMouseLeave`
  // cortaba el drag ahí mismo — por eso se sentía "duro": solo
  // respondía mientras el mouse se mantuviera exactamente sobre la tira
  // delgada. Ahora, una vez que arranca el drag, se escucha en `window`
  // hasta soltar el botón, sin importar por dónde pase el cursor.
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

  // Por si el componente se desmonta a mitad de un arrastre (ej. se
  // cambia de categoría de golpe), no dejamos listeners colgados en window.
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [handleWindowMouseMove, handleWindowMouseUp]);

  if (Platform.OS === "web") {
    // El navegador no soporta "clic sostenido + arrastrar" para hacer
    // scroll de forma nativa (solo drag con touch, o arrastrando la
    // scrollbar). Este handler simula ese comportamiento a mano,
    // moviendo `scrollLeft` según el desplazamiento del mouse.
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
          // El scrollbar horizontal nativo se dibuja pegado al borde
          // inferior del contenedor. Sin este espacio, queda montado
          // justo donde termina la fila de pills y se ve "encima" del
          // contenido siguiente (el catálogo). Este padding le da lugar
          // propio a la barra, separándola visualmente de lo de abajo.
          paddingBottom: horizontal ? 10 : undefined,
        }}
      >
        {children}
      </div>
    );
  }

  return <View style={{ flex: 1 }}>{children}</View>;
}
