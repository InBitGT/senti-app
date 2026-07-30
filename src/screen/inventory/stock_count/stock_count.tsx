import { ProductCountList } from "@/components/molecules/ProductCountList/ProductCountList";
import { ProductPicker } from "@/components/molecules/ProductPicker/ProductPicker";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useStockCount } from "@/src/hooks/useStockCount/useStockCount";
import { useAuthStore } from "@/src/store";
import {
  flattenStockCountProducts,
  StockCount,
  type CountLine,
} from "@/src/types/stock_count/stock_count.types";
import { router } from "expo-router";
import { ClipboardList, Send } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Genera un id único por línea/artículo en el cliente.
function newLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function CountScreen() {
  const { claims } = useAuthStore();
  const { showToast } = useCustomToast();

  const branches = claims?.branches ?? [];
  const hasMultipleBranches = branches.length > 1;

  // Si hay una sola sucursal, se usa automáticamente; si hay varias, el usuario elige.
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    !hasMultipleBranches ? String(branches[0]?.branch_id ?? "") : "",
  );

  const selectedBranch = branches.find(
    (b) => String(b.branch_id) === selectedBranchId,
  );

  const warehouses = selectedBranch?.warehouses ?? [];
  const hasMultipleWarehouses = warehouses.length > 1;

  // Si la sucursal elegida tiene una sola bodega, se usa automáticamente.
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  // Cuando cambia la sucursal (o se resuelve la única disponible), recalcular la bodega.
  useEffect(() => {
    if (warehouses.length === 1) {
      setSelectedWarehouseId(String(warehouses[0].warehouse_id));
    } else {
      setSelectedWarehouseId("");
    }
  }, [selectedBranchId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedWarehouse = warehouses.find(
    (w) => String(w.warehouse_id) === selectedWarehouseId,
  );

  const { isLoading, post, dataProduct } = useStockCount(
    selectedWarehouseId || undefined,
  );

  // "dataProduct" son los grupos StockCountProduct[]; los aplanamos para el picker/lista.
  const products = useMemo(
    () => flattenStockCountProducts(dataProduct),
    [dataProduct],
  );

  const [scopeNotes, setScopeNotes] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lines, setLines] = useState<Map<number, CountLine>>(new Map());

  const productById = useMemo(() => {
    const m = new Map<number, (typeof products)[number]>();
    for (const p of products) m.set(p.product_id, p);
    return m;
  }, [products]);

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => productById.get(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [selectedIds, productById],
  );

  const handleConfirmSelection = useCallback((ids: number[]) => {
    setSelectedIds(ids);
    setLines((prev) => {
      const next = new Map<number, CountLine>();
      for (const id of ids) {
        next.set(
          id,
          prev.get(id) ?? {
            line_id: newLineId(),
            product_id: id,
            counted_qty: 0,
            counted_by: null,
          },
        );
      }
      return next;
    });
  }, []);

  const handleStep = useCallback(
    (product: { product_id: number }, delta: number) => {
      setLines((prev) => {
        const next = new Map(prev);
        const existing = next.get(product.product_id);
        if (!existing) return prev;
        next.set(product.product_id, {
          ...existing,
          counted_qty: Math.max(0, existing.counted_qty + delta),
        });
        return next;
      });
    },
    [],
  );

  const handleSet = useCallback(
    (product: { product_id: number }, qty: number) => {
      setLines((prev) => {
        const next = new Map(prev);
        const existing = next.get(product.product_id);
        if (!existing) return prev;
        const safe = Number.isFinite(qty) ? Math.max(0, Math.floor(qty)) : 0;
        next.set(product.product_id, { ...existing, counted_qty: safe });
        return next;
      });
    },
    [],
  );

  const handleRemove = useCallback((product: { product_id: number }) => {
    setSelectedIds((prev) => prev.filter((id) => id !== product.product_id));
    setLines((prev) => {
      const next = new Map(prev);
      next.delete(product.product_id);
      return next;
    });
  }, []);

  const payload: StockCount = useMemo(
    () => ({
      tenant_id: claims?.tenant_id ?? 0,
      warehouse_id: selectedWarehouse?.warehouse_id ?? 0,
      user_id: claims?.sub ?? 0,
      scope_notes: scopeNotes,
      items: selectedIds
        .map((id) => lines.get(id))
        .filter((l): l is CountLine => Boolean(l))
        .map((l) => ({
          product_id: l.product_id,
          counted_qty: l.counted_qty,
          counted_by: l.counted_by,
        })),
    }),
    [scopeNotes, selectedIds, lines, claims, selectedWarehouse],
  );

  const totalUnits = useMemo(
    () => payload.items.reduce((sum, it) => sum + it.counted_qty, 0),
    [payload.items],
  );

  const handleSubmit = () => {
    if (!selectedWarehouseId) {
      showToast({
        type: "error",
        message: "No hay una bodega disponible para esta sucursal.",
      });
      return;
    }
    if (payload.items.length === 0) {
      showToast({
        type: "error",
        message: "Elige al menos un artículo para contar.",
      });
      return;
    }
    post.mutate(payload, {
      onSuccess: (data) => {
        router.navigate("/(drawer)/(inventory)/(form)/stock_count_form");
        showToast({
          type: "success",
          message: `Conteo enviado (${payload.items.length} artículos)`,
        });
      },
      onError: (err) => {
        showToast({
          type: "error",
          message:
            err instanceof Error ? err.message : "Error al enviar el conteo",
        });
      },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}
        contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
      >
        <HStack className="items-center gap-3">
          <View style={styles.headerIcon}>
            <ClipboardList size={18} color="#fff" />
          </View>
          <VStack>
            <Text style={styles.headerTitle}>Conteo de inventario</Text>
            <Text style={styles.headerSubtitle}>
              Elige qué artículos contar y captura las unidades.
            </Text>
          </VStack>
        </HStack>

        <VStack style={styles.card}>
          {hasMultipleBranches && (
            <VStack style={{ marginBottom: 3 }}>
              <Text style={styles.cardLabel}>Sucursal</Text>
              <Select
                selectedValue={selectedBranchId}
                onValueChange={setSelectedBranchId}
              >
                <SelectTrigger style={{ marginTop: 8 }}>
                  <SelectInput
                    style={{ color: "#000" }}
                    placeholder="Selecciona una sucursal"
                    value={selectedBranch?.branch_name ?? ""}
                  />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {branches.map((b) => (
                      <SelectItem
                        key={b.branch_id}
                        label={b.branch_name}
                        value={String(b.branch_id)}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>
          )}

          {selectedBranchId && hasMultipleWarehouses && (
            <VStack style={{ marginBottom: 2 }}>
              <Text style={styles.cardLabel}>Bodega</Text>
              <Select
                selectedValue={selectedWarehouseId}
                onValueChange={setSelectedWarehouseId}
              >
                <SelectTrigger style={{ marginTop: 8 }}>
                  <SelectInput
                    style={{ color: "#000" }}
                    placeholder="Selecciona una bodega"
                    value={selectedWarehouse?.warehouse_name ?? ""}
                  />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {warehouses.map((w) => (
                      <SelectItem
                        key={w.warehouse_id}
                        label={w.warehouse_name}
                        value={String(w.warehouse_id)}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>
          )}
          <VStack>
            <Text style={styles.cardLabel}>Notas de alcance</Text>
            <Input variant="outline" size="md" style={{ marginTop: 8 }}>
              <InputField
                style={{ color: "#000000" }}
                placeholder="Ej. Papelería zona A"
                value={scopeNotes}
                onChangeText={setScopeNotes}
              />
            </Input>
          </VStack>
        </VStack>

        <VStack style={styles.card}>
          <HStack className="items-center justify-between mb-4">
            <Text style={styles.cardTitle}>Artículos a contar</Text>
            <ProductPicker
              products={products}
              selectedIds={new Set(selectedIds)}
              onConfirm={handleConfirmSelection}
            />
          </HStack>

          {!selectedWarehouseId ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>
                {hasMultipleBranches && !selectedBranchId
                  ? "Selecciona una sucursal para continuar."
                  : "Selecciona una bodega para continuar."}
              </Text>
            </View>
          ) : isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Cargando artículos…</Text>
            </View>
          ) : (
            <ProductCountList
              selected={selectedProducts}
              lines={lines}
              onStep={handleStep}
              onSet={handleSet}
              onRemove={handleRemove}
            />
          )}
        </VStack>
      </ScrollView>

      <HStack style={styles.footerBar}>
        <Text style={styles.footerText}>
          <Text style={styles.footerCount}>{payload.items.length}</Text>
          <Text style={styles.footerMuted}> artículos · </Text>
          <Text style={styles.footerCount}>{totalUnits}</Text>
          <Text style={styles.footerMuted}> unidades</Text>
        </Text>
        <Button
          size="md"
          style={
            post.isPending || !payload.items.length
              ? styles.submitButtonDisabled
              : styles.submitButton
          }
          disabled={post.isPending || !payload.items.length}
          onPress={handleSubmit}
        >
          {post.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ButtonIcon as={Send} style={{ color: "#fff" }} />
          )}
          <ButtonText style={{ color: "#fff" }}>Enviar conteo</ButtonText>
        </Button>
      </HStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#0C447C",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  headerSubtitle: { fontSize: 13, color: "#888" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    padding: 16,
    gap: 10,
  },
  cardLabel: { fontSize: 13, fontWeight: "500", color: "#1a1a1a" },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 64,
  },
  loadingText: { fontSize: 13, color: "#888" },
  footerBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    backgroundColor: "#ffffffF2",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  footerText: { fontSize: 13 },
  footerCount: { fontWeight: "600", color: "#1a1a1a" },
  footerMuted: { color: "#888" },
  submitButton: { backgroundColor: "#0C447C" },
  submitButtonDisabled: { backgroundColor: "#d8d8d8" },
});
