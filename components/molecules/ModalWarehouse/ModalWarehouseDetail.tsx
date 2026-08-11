import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import {
  WarehouseDetail,
  WarehouseZone,
} from "@/src/types/warehouse/warehouse.types";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: WarehouseDetail;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean;
}) => {
  const display =
    typeof value === "boolean" ? (value ? "Sí" : "No") : (value ?? "—");

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(display)}</Text>
    </View>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const Divider = () => <View style={styles.divider} />;

const Avatar = ({ name }: { name: string }) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
  </View>
);

const Badge = ({
  active,
  labels = ["Predeterminada", "Adicional"],
}: {
  active: boolean;
  labels?: [string, string];
}) => (
  <View
    style={[styles.badge, { backgroundColor: active ? "#dcfce7" : "#fee2e2" }]}
  >
    <Text style={[styles.badgeText, { color: active ? "#16a34a" : "#dc2626" }]}>
      {active ? labels[0] : labels[1]}
    </Text>
  </View>
);

const ZONE_TYPE_LABELS: Record<string, string> = {
  zone: "Zona",
  aisle: "Pasillo",
  shelf: "Estante",
  rack: "Rack",
  bin: "Contenedor",
};

// Arma el árbol a partir de la lista plana (n niveles vía parent_zone_id) y lo aplana
// de nuevo en orden de profundidad para renderizar filas con indentación.
const buildZoneRows = (
  zones: WarehouseZone[],
): { zone: WarehouseZone; depth: number }[] => {
  const byParent = new Map<number | null, WarehouseZone[]>();
  zones.forEach((z) => {
    const key = z.parent_zone_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(z);
  });

  const rows: { zone: WarehouseZone; depth: number }[] = [];
  const visit = (parentId: number | null, depth: number) => {
    const children = byParent.get(parentId) ?? [];
    children.forEach((z) => {
      rows.push({ zone: z, depth });
      visit(z.id, depth + 1);
    });
  };
  visit(null, 0);

  // Por si hay huérfanos (parent_zone_id apunta a algo que no llegó en la lista)
  const visitedIds = new Set(rows.map((r) => r.zone.id));
  zones.forEach((z) => {
    if (!visitedIds.has(z.id)) rows.push({ zone: z, depth: 0 });
  });

  return rows;
};

const ZoneRow = ({ zone, depth }: { zone: WarehouseZone; depth: number }) => (
  <View style={[styles.zoneRow, { paddingLeft: 8 + depth * 18 }]}>
    <View style={styles.zoneBullet} />
    <View style={{ flex: 1 }}>
      <Text style={styles.zoneName}>{zone.name}</Text>
      <Text style={styles.zoneMeta}>
        {zone.code} · {ZONE_TYPE_LABELS[zone.zone_type] ?? zone.zone_type}
      </Text>
    </View>
    {!zone.status && (
      <View style={[styles.badge, { backgroundColor: "#fee2e2" }]}>
        <Text style={[styles.badgeText, { color: "#dc2626" }]}>Inactiva</Text>
      </View>
    )}
  </View>
);

export const ModalWarehouseDetail: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
}) => {
  const zoneRows =
    data?.zones && data.zones.length > 0 ? buildZoneRows(data.zones) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <Avatar name={data?.name ?? "?"} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>
                {data?.name || "—"}
              </Heading>
              <Text style={styles.code}>{data?.code ?? "Sin código"}</Text>
            </View>
            <Badge active={data?.is_default ?? false} />
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DesktopScrollView>
              <SectionTitle title="Información generalu" />
              <InfoRow label="Código" value={data?.code ?? "—"} />
              <InfoRow label="Nombre" value={data?.name} />
              <InfoRow label="Tipo" value={data?.type} />
              <InfoRow label="Descripción" value={data?.description} />

              <Divider />

              <SectionTitle title="Sucursal" />
              <InfoRow label="Nombre" value={data?.branch?.name} />
              <InfoRow label="Descripción" value={data?.branch?.description} />
              {data?.branch?.address && (
                <InfoRow
                  label="Dirección"
                  value={[
                    data.branch.address.line1,
                    data.branch.address.line2,
                    data.branch.address.city,
                    data.branch.address.state,
                    data.branch.address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              )}

              <Divider />

              <SectionTitle title="Configuración" />
              <InfoRow label="Por defecto" value={data?.is_default} />
              <InfoRow label="Usa zonas" value={data?.uses_zones} />

              {data?.uses_zones && (
                <>
                  <Divider />
                  <SectionTitle title={`Zonas (${data.zones?.length ?? 0})`} />
                  {zoneRows.length === 0 ? (
                    <Text style={{ color: "#9ca3af", fontSize: 13 }}>
                      Esta bodega usa zonas pero aún no tiene ninguna
                      registrada.
                    </Text>
                  ) : (
                    <View style={styles.zoneList}>
                      {zoneRows.map(({ zone, depth }) => (
                        <ZoneRow key={zone.id} zone={zone} depth={depth} />
                      ))}
                    </View>
                  )}
                </>
              )}
            </DesktopScrollView>
          </ScrollView>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" size="sm" onPress={onClose}>
            <ButtonText>Cerrar</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", maxHeight: "85%" },
  header: { paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "600", color: "#4338ca" },
  name: { color: "#111827", fontWeight: "600" },
  code: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "500" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  label: { color: "#6b7280", fontSize: 13, flex: 1 },
  value: { color: "#111827", fontSize: 13, flex: 1.5, textAlign: "right" },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 12 },
  zoneList: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 10,
    overflow: "hidden",
  },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  zoneBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#c4b5fd",
    marginRight: 8,
  },
  zoneName: { fontSize: 13, color: "#111827", fontWeight: "500" },
  zoneMeta: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
});
