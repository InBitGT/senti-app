import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { ProductCountList } from "@/components/molecules/ProductCountList/ProductCountList";
import { ProductPicker } from "@/components/molecules/ProductPicker/ProductPicker";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useStockCount } from "@/src/hooks/useStockCount/useStockCount";
import { useCreateTransfer } from "@/src/hooks/useStockTransfer/useStockTransfer";
import { useWarehouse } from "@/src/hooks/useWarehouse/useWarehouse";
import { useAuthStore } from "@/src/store";
import { useStockTransferStore } from "@/src/store/useStockTransferStore/useStockTransferStore";
import {
  flattenStockCountProducts,
  type CountLine,
} from "@/src/types/stock_count/stock_count.types";
import { CreateTransferBody } from "@/src/types/stock_transfer/stock_transfer.types";
import { router } from "expo-router";
import { ArrowLeftRight, Send } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StockTransferForm() {
  const { claims } = useAuthStore();
  const { showToast } = useCustomToast();
  const setSelectedId = useStockTransferStore((s) => s.setSelectedId);
  const create = useCreateTransfer();

  const branches = claims?.branches ?? [];
  const hasMultipleBranches = branches.length > 1;

  // Si hay una sola sucursal, se usa automáticamente; si hay varias, el usuario elige.
  const [branchId, setBranchId] = useState<string>(
    !hasMultipleBranches ? String(branches[0]?.branch_id ?? "") : "",
  );
  const originWarehouses =
    branches.find((b) => String(b.branch_id) === branchId)?.warehouses ?? [];

  const [originEdit, setOriginEdit] = useState<string>("");
  // Si la sucursal tiene una sola bodega, se usa sin preguntar.
  const originId =
    originWarehouses.length === 1
      ? String(originWarehouses[0].warehouse_id)
      : originEdit;
  const [destinationId, setDestinationId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const handleBranchChange = (value: string) => {
    setBranchId(value);
    setOriginEdit("");
    setSelectedIds([]);
    setLines(new Map());
  };

  const handleOriginChange = (value: string) => {
    setOriginEdit(value);
    // El stock cambia con la bodega; se limpian los artículos elegidos.
    setSelectedIds([]);
    setLines(new Map());
    if (value === destinationId) setDestinationId("");
  };

  // El destino puede ser cualquier bodega del tenant, menos el origen.
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouse();
  const destinationOptions = (warehouses ?? [])
    .filter((w) => String(w.id) !== originId)
    .map((w) => ({
      label: w.branch?.name ? `${w.name} · ${w.branch.name}` : w.name,
      value: String(w.id),
    }));

  const { dataProduct, isLoadingProduct } = useStockCount(
    originId || undefined,
  );
  const products = useMemo(
    () => flattenStockCountProducts(dataProduct),
    [dataProduct],
  );

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

  // Se reutiliza la lista del conteo: counted_qty es la cantidad a trasladar.
  const handleConfirmSelection = useCallback((ids: number[]) => {
    setSelectedIds(ids);
    setLines((prev) => {
      const next = new Map<number, CountLine>();
      for (const id of ids) {
        next.set(
          id,
          prev.get(id) ?? {
            line_id: String(id),
            product_id: id,
            counted_qty: Math.min(1, productById.get(id)?.system_qty ?? 0),
            counted_by: null,
          },
        );
      }
      return next;
    });
  }, [productById]);

  // No se puede trasladar más de lo disponible en la bodega de origen.
  const handleStep = useCallback(
    (product: { product_id: number; system_qty: number }, delta: number) => {
      setLines((prev) => {
        const next = new Map(prev);
        const existing = next.get(product.product_id);
        if (!existing) return prev;
        next.set(product.product_id, {
          ...existing,
          counted_qty: Math.min(
            product.system_qty,
            Math.max(0, existing.counted_qty + delta),
          ),
        });
        return next;
      });
    },
    [],
  );

  const handleSet = useCallback(
    (product: { product_id: number; system_qty: number }, qty: number) => {
      setLines((prev) => {
        const next = new Map(prev);
        const existing = next.get(product.product_id);
        if (!existing) return prev;
        const safe = Number.isFinite(qty)
          ? Math.min(product.system_qty, Math.max(0, qty))
          : 0;
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

  const payload: CreateTransferBody = useMemo(
    () => ({
      tenant_id: claims?.tenant_id ?? 0,
      user_id: claims?.sub ?? 0,
      origin_warehouse_id: Number(originId),
      destination_warehouse_id: Number(destinationId),
      notes: notes.trim() || undefined,
      items: selectedIds
        .map((id) => lines.get(id))
        .filter((l): l is CountLine => Boolean(l))
        .map((l) => ({ product_id: l.product_id, quantity: l.counted_qty })),
    }),
    [claims, originId, destinationId, notes, selectedIds, lines],
  );

  const totalUnits = payload.items.reduce((sum, it) => sum + it.quantity, 0);

  const resetForm = () => {
    setBranchId(
      !hasMultipleBranches ? String(branches[0]?.branch_id ?? "") : "",
    );
    setOriginEdit("");
    setDestinationId("");
    setNotes("");
    setSelectedIds([]);
    setLines(new Map());
  };

  const handleSubmit = () => {
    if (!originId || !destinationId) {
      showToast({
        type: "error",
        message: "Elige la bodega de origen y la de destino.",
      });
      return;
    }
    if (payload.items.length === 0) {
      showToast({
        type: "error",
        message: "Elige al menos un artículo para trasladar.",
      });
      return;
    }
    const invalid = payload.items.find((it) => {
      const stock = productById.get(it.product_id)?.system_qty ?? 0;
      return it.quantity <= 0 || it.quantity > stock;
    });
    if (invalid) {
      const product = productById.get(invalid.product_id);
      showToast({
        type: "error",
        message: `${product?.product_name ?? "Artículo"}: la cantidad debe ser mayor a 0 y no superar el stock (${product?.system_qty ?? 0}).`,
      });
      return;
    }

    create.mutate(payload, {
      onSuccess: (data) => {
        showToast({
          type: "success",
          message: `Traslado ${data?.number ?? ""} creado como borrador`,
        });
        resetForm();
        if (data?.id) {
          setSelectedId(data.id);
          router.navigate("/(drawer)/(inventory)/(info)/stock_transfer_info");
        }
      },
      onError: (err) => {
        showToast({
          type: "error",
          message:
            err instanceof Error ? err.message : "Error al crear el traslado",
        });
      },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}
        contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
      >
        <DesktopScrollView>
          <HStack className="items-center gap-3">
            <View style={styles.headerIcon}>
              <ArrowLeftRight size={18} color="#fff" />
            </View>
            <VStack>
              <Text style={styles.headerTitle}>Nuevo traslado</Text>
              <Text style={styles.headerSubtitle}>
                Se guarda como borrador; el stock se mueve al despacharlo.
              </Text>
            </VStack>
          </HStack>

          <VStack style={styles.card}>
            {hasMultipleBranches && (
              <AppSelect
                label="Sucursal de origen"
                placeholder="Selecciona una sucursal"
                searchable={branches.length > 6}
                options={branches.map((b) => ({
                  label: b.branch_name,
                  value: String(b.branch_id),
                }))}
                value={branchId}
                onChange={handleBranchChange}
              />
            )}

            {branchId && originWarehouses.length > 1 && (
              <AppSelect
                label="Bodega de origen"
                placeholder="Selecciona una bodega"
                searchable={originWarehouses.length > 6}
                options={originWarehouses.map((w) => ({
                  label: w.warehouse_name,
                  value: String(w.warehouse_id),
                }))}
                value={originId}
                onChange={handleOriginChange}
              />
            )}

            <AppSelect
              label="Bodega de destino"
              placeholder="Selecciona una bodega"
              searchable={destinationOptions.length > 6}
              isLoading={isLoadingWarehouses}
              options={destinationOptions}
              value={destinationId}
              onChange={setDestinationId}
            />

            <AppInput
              label="Notas"
              placeholder="Ej. Reposición de papelería"
              value={notes}
              onChangeText={setNotes}
            />
          </VStack>

          <VStack style={styles.card}>
            <HStack className="items-center justify-between mb-4">
              <Text style={styles.cardTitle}>Artículos a trasladar</Text>
              <ProductPicker
                products={products}
                selectedIds={new Set(selectedIds)}
                onConfirm={handleConfirmSelection}
              />
            </HStack>

            {!originId ? (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingText}>
                  {hasMultipleBranches && !branchId
                    ? "Selecciona una sucursal para continuar."
                    : "Selecciona la bodega de origen para continuar."}
                </Text>
              </View>
            ) : isLoadingProduct ? (
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
                mode="transfer"
              />
            )}
          </VStack>
        </DesktopScrollView>
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
            create.isPending || !payload.items.length
              ? styles.submitButtonDisabled
              : styles.submitButton
          }
          disabled={create.isPending || !payload.items.length}
          onPress={handleSubmit}
        >
          {create.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ButtonIcon as={Send} style={{ color: "#fff" }} />
          )}
          <ButtonText style={{ color: "#fff" }}>Crear traslado</ButtonText>
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
    marginBottom: 10,
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
    marginTop: 10,
  },
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
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    backgroundColor: "#ffffffF2",
    margin: 10,
    padding: 15,
  },
  footerText: { fontSize: 13 },
  footerCount: { fontWeight: "600", color: "#1a1a1a" },
  footerMuted: { color: "#888" },
  submitButton: { backgroundColor: "#0C447C" },
  submitButtonDisabled: { backgroundColor: "#d8d8d8" },
});
