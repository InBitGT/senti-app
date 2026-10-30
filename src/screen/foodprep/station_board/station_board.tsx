import {
    usePrepStation,
    usePrepStationById,
} from "@/src/hooks/usePrepStation/usePrepStation";
import { KitchenBoardScreen } from "@/src/screen/foodprep/kitchen/kitchen";
import { useStationBoardStore } from "@/src/store/useStationBoardStore/useStationBoardStore";
import { router } from "expo-router";
import { useMemo } from "react";

const GENERAL_STATION_ID = 0;

/**
 * Tablero de una o varias estaciones. Reutiliza el tablero de cocina
 * pasándole `stationIds`, que filtra el GET del board y el WebSocket.
 * Las estaciones llegan por useStationBoardStore (las pone StationsScreen).
 */
export function StationBoardScreen() {
  const ids = useStationBoardStore((state) => state.stationIds);
  const clearStationIds = useStationBoardStore(
    (state) => state.clearStationIds,
  );

  // "3", "0" o "0,3"; sin estaciones = toda la sucursal.
  const stationIds = ids.length ? ids.join(",") : undefined;

  // Una sola estación: se consulta su detalle por id (prep-station/full/{id}).
  const singleId =
    ids.length === 1 && ids[0] !== GENERAL_STATION_ID ? ids[0] : null;
  const { data: station } = usePrepStationById(singleId);
  // Varias estaciones: se toman los nombres del listado.
  const { data: stations } = usePrepStation();

  const title = useMemo<string>(() => {
    if (ids.length === 0) return "Todas las estaciones";
    if (singleId !== null) return station?.name ?? "Estación";
    return ids
      .map((id) =>
        id === GENERAL_STATION_ID
          ? "General"
          : (stations?.find((item) => item.id === id)?.name ?? `#${id}`),
      )
      .join(" + ");
  }, [ids, singleId, station, stations]);

  const handleBack = (): void => {
    clearStationIds();
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(drawer)/(foodprep)/station");
  };

  return (
    <KitchenBoardScreen
      key={stationIds ?? "all"}
      stationIds={stationIds}
      title={title}
      onBack={handleBack}
    />
  );
}
