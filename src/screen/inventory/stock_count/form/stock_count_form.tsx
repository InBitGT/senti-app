// stock_count_adjustment.tsx (pantalla de diferencias / ajuste)
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useStockCounAdjustment } from "@/src/hooks/useStockCountAdjustment/useStockCountAdjustment";
import { useAuthStore } from "@/src/store";
import { useStockCountStore } from "@/src/store/useStockCountStore/useStockCountStore";
import {
  CreateAdjustmentCount,
  ItemCreateAdjustment,
} from "@/src/types/stock_adjustment/stock_adjustment.types";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StockCountDetail() {
  const { claims } = useAuthStore();
  const { showToast } = useCustomToast();
  const stockCountResult = useStockCountStore((s) => s.data); // DataResponse guardado tras crear el conteo
  const { post } = useStockCounAdjustment(stockCountResult?.warehouse_id);

  const [notes, setNotes] = useState("");

  // Solo diferencias reales (distinto de 0)
  const differences = useMemo(
    () =>
      (stockCountResult?.differences ?? []).filter((d) => d.difference !== 0),
    [stockCountResult],
  );

  const handleCreateAdjustment = async () => {
    if (!claims || !stockCountResult) return;

    if (differences.length === 0) {
      showToast({ type: "error", message: "No hay diferencias que ajustar." });
      return;
    }

    const payloadItems: ItemCreateAdjustment[] = differences.map((d) => ({
      product_id: d.product_id,
      stock_count_item_id: d.stock_count_item_id,
      qty_difference: d.difference,
    }));

    const payload: CreateAdjustmentCount = {
      tenant_id: claims.tenant_id,
      warehouse_id: stockCountResult.warehouse_id,
      requested_by: claims.sub,
      stock_count_id: stockCountResult.id,
      notes: notes.trim(),
      items: payloadItems,
    };

    try {
      await post.mutateAsync(payload);
      showToast({ type: "success", message: "Ajuste creado correctamente" });
      router.back();
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Error al crear el ajuste",
      });
    }
  };

  if (!stockCountResult) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20 }}>No hay datos del conteo.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["bottom", "left", "right", "top"]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
      >
        <DesktopScrollView>
          <VStack>
            <Text style={styles.title}>Diferencias encontradas</Text>
            <Text style={styles.subtitle}>
              Conteo #{stockCountResult.id} · {stockCountResult.count_status}
            </Text>
          </VStack>

          {differences.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ color: "#888" }}>
                No se encontraron diferencias en este conteo.
              </Text>
            </View>
          ) : (
            differences.map((d) => (
              <View key={d.product_id} style={styles.row}>
                <HStack className="items-center justify-between">
                  <VStack>
                    <Text style={styles.productName}>{d.product_name}</Text>
                    <Text style={styles.muted}>
                      Sistema: {d.system_qty} · Contado: {d.counted_qty}
                    </Text>
                  </VStack>
                  <Text
                    style={{
                      ...styles.diff,
                      color: d.difference < 0 ? "#dc2626" : "#16a34a",
                    }}
                  >
                    {d.difference > 0 ? "+" : ""}
                    {d.difference}
                  </Text>
                </HStack>
              </View>
            ))
          )}

          <VStack>
            <Text style={styles.label}>Notas del ajuste</Text>
            <Textarea>
              <TextareaInput
                style={{
                  color: "#000",
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#d4d4d4",
                  borderRadius: 10,
                }}
                placeholder="Ej. Diferencia encontrada en conteo del 01/07"
                value={notes}
                onChangeText={setNotes}
              />
            </Textarea>
          </VStack>
        </DesktopScrollView>
      </ScrollView>

      <Button
        style={{ marginHorizontal: 20, backgroundColor: "#0C447C" }}
        onPress={handleCreateAdjustment}
        disabled={post.isPending}
      >
        <ButtonText style={{ color: "#fff" }}>
          {post.isPending ? "Creando..." : "Crear ajuste"}
        </ButtonText>
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" },
  title: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  subtitle: { fontSize: 12, color: "#888", marginTop: 2 },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    padding: 20,
    alignItems: "center",
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    padding: 12,
  },
  productName: { fontSize: 14, fontWeight: "500", color: "#1a1a1a" },
  muted: { fontSize: 12, color: "#888" },
  diff: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "500", color: "#1a1a1a", marginBottom: 6 },
});
