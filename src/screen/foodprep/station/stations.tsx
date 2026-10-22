import { AppButton } from "@/components/atom/AppButton/AppButton";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { EmptyHint } from "@/components/atom/EmptyHint/EmptyHint";
import { ResponsiveCardGrid } from "@/components/atom/ResponsiveCardGrid/ResponsiveCardGrid";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { usePrepStation } from "@/src/hooks/usePrepStation/usePrepStation";
import { useStationBoardStore } from "@/src/store/useStationBoardStore/useStationBoardStore";
import { PrepStation } from "@/src/types/prep_station/prep_station.types";
import { router } from "expo-router";
import {
    Check,
    ChefHat,
    ChevronRight,
    Layers,
    LucideIcon,
    UtensilsCrossed,
} from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

const BOARD_ROUTE = "/(drawer)/(foodprep)/station_board";
/** prep_station_ids=0 → productos sin estación (General). */
const GENERAL_STATION_ID = 0;

interface StationCardProps {
  title: string;
  subtitle: string;
  detail?: string;
  icon: LucideIcon;
  isSelected?: boolean;
  /** Si se manda, muestra el check para combinar estaciones. */
  onToggle?: () => void;
  onOpen: () => void;
}

function StationCard({
  title,
  subtitle,
  detail,
  icon,
  isSelected = false,
  onToggle,
  onOpen,
}: StationCardProps) {
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir tablero de ${title}`}
    >
      <View style={styles.cardIcon}>
        <Icon as={icon} size="md" style={{ color: "#0EA5E9" }} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        {!!detail && (
          <Text style={styles.cardDetail} numberOfLines={2}>
            {detail}
          </Text>
        )}
      </View>
      {onToggle && (
        <Pressable
          onPress={onToggle}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={`Seleccionar ${title}`}
          style={[styles.check, isSelected && styles.checkActive]}
        >
          {isSelected && (
            <Icon as={Check} size="xs" style={{ color: "#ffffff" }} />
          )}
        </Pressable>
      )}
      <Icon as={ChevronRight} size="sm" style={{ color: "#9ca3af" }} />
    </Pressable>
  );
}

function describeStation(station: PrepStation): string {
  const parts: string[] = [];
  if (station.categories.length) {
    parts.push(station.categories.map((c) => c.category_name).join(", "));
  }
  if (station.products.length) {
    parts.push(station.products.map((p) => p.product_name).join(", "));
  }
  return parts.join(" · ");
}

/**
 * Lista de estaciones de trabajo. Funciona con N estaciones: cada una
 * abre el mismo tablero (StationBoardScreen) filtrado por su id.
 * También se pueden marcar varias para verlas juntas (prep_station_ids=0,3).
 */
export function StationsScreen() {
  const { data: stations, isLoading } = usePrepStation();
  const [selected, setSelected] = useState<number[]>([]);

  const setStationIds = useStationBoardStore((state) => state.setStationIds);

  // Las estaciones se mandan por el store, no por la URL.
  const openBoard = (ids: number[] = []): void => {
    setStationIds(ids);
    router.push(BOARD_ROUTE);
  };

  const toggle = (id: number): void => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text>Cargando estaciones...</Text>
      </View>
    );
  }

  const activeStations = (stations ?? []).filter((station) => station.status);

  return (
    <ScrollView style={{ flex: 1 }}>
      <DesktopScrollView>
        <View style={styles.container}>
          <View>
            <Text style={styles.title}>Estaciones de trabajo</Text>
            <Text style={styles.subtitle}>
              Elige una estación para ver sus comandas en vivo, o marca varias
              para verlas juntas.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>ESTACIONES</Text>
          {activeStations.length === 0 ? (
            <EmptyHint
              icon={ChefHat}
              label="No hay estaciones configuradas"
              description="Créalas en Configuraciones → Estaciones de preparación."
            />
          ) : (
            <ResponsiveCardGrid>
              {activeStations.map((station) => (
                <StationCard
                  key={station.id}
                  title={station.name}
                  subtitle={`Código: ${station.code}`}
                  detail={describeStation(station)}
                  icon={ChefHat}
                  isSelected={selected.includes(station.id)}
                  onToggle={() => toggle(station.id)}
                  onOpen={() => openBoard([station.id])}
                />
              ))}
            </ResponsiveCardGrid>
          )}

          <Text style={styles.sectionLabel}>OTRAS VISTAS</Text>
          <ResponsiveCardGrid>
            <StationCard
              title="General"
              subtitle="Productos sin estación asignada"
              icon={UtensilsCrossed}
              isSelected={selected.includes(GENERAL_STATION_ID)}
              onToggle={() => toggle(GENERAL_STATION_ID)}
              onOpen={() => openBoard([GENERAL_STATION_ID])}
            />
            <StationCard
              title="Todas las estaciones"
              subtitle="Todas las comandas de la sucursal"
              icon={Layers}
              onOpen={() => openBoard()}
            />
          </ResponsiveCardGrid>

          {selected.length > 0 && (
            <View style={styles.actions}>
              <View style={styles.actionBtn}>
                <AppButton
                  label="Limpiar"
                  outline
                  onPress={() => setSelected([])}
                />
              </View>
              <View style={styles.actionBtn}>
                <AppButton
                  label={
                    selected.length === 1
                      ? "Abrir estación"
                      : `Abrir ${selected.length} estaciones`
                  }
                  variant="info"
                  onPress={() => openBoard(selected)}
                />
              </View>
            </View>
          )}
        </View>
      </DesktopScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  sectionLabel: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 13,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cardDetail: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
