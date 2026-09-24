import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { FlatProduct } from "@/src/types/stock_count/stock_count.types";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Package, Plus, SearchIcon, X } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Checkbox } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ProductPicker({
  products,
  selectedIds,
  onConfirm,
}: {
  products: FlatProduct[];
  selectedIds: Set<number>;
  onConfirm: (ids: number[]) => void;
}) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["90%"], []);

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Set<number>>(new Set());

  // Al abrir, precargamos la selección actual.
  const handleOpen = () => {
    setDraft(new Set(selectedIds));
    sheetRef.current?.present();
  };

  const handleClose = () => {
    sheetRef.current?.dismiss();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q),
    );
  }, [products, query]);

  const toggle = (id: number) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirm = () => {
    onConfirm(Array.from(draft));
    handleClose();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <>
      <AppButton
        label="Elegir artículos"
        icon={Plus}
        outline
        outlineBorderColor="#949292"
        outlineTextColor="#000000"
        fullWidth={false}
        onPress={handleOpen}
      />

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onDismiss={() => setQuery("")}
      >
        {/* View normal (no BottomSheetView): BottomSheetView envuelve el
            contenido para medirlo y eso rompe el scroll del FlatList interno. */}
        <View style={styles.sheetContainer}>
          <HStack className="items-start justify-between mb-4">
            <VStack style={{ flex: 1 }}>
              <Text style={styles.title}>Elegir artículos a contar</Text>
              <Text style={styles.subtitle}>
                Selecciona solo los artículos que vas a contar. Los demás no se
                cargan.
              </Text>
            </VStack>
            <Pressable onPress={handleClose} hitSlop={8} style={{ padding: 4 }}>
              <X size={20} color="#888" />
            </Pressable>
          </HStack>

          <View style={{ marginBottom: 16 }}>
            <AppInput
              placeholder="Buscar por nombre, SKU o categoría…"
              value={query}
              onChangeText={setQuery}
              leftIcon={<SearchIcon size={16} color="#9ca3af" />}
              inputStyle={{ color: "#000" }}
              TextInputComponent={BottomSheetTextInput}
            />
          </View>

          <View style={styles.listBox}>
            {filtered.length === 0 ? (
              <Text style={styles.muted}>Sin resultados.</Text>
            ) : (
              <BottomSheetFlatList
                data={filtered}
                keyExtractor={(item: FlatProduct) => String(item.product_id)}
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
                showsVerticalScrollIndicator
                renderItem={({ item }: { item: FlatProduct }) => {
                  const checked = draft.has(item.product_id);
                  return (
                    <Pressable
                      onPress={() => toggle(item.product_id)}
                      style={styles.row}
                    >
                      <View style={{ transform: [{ scale: 0.9 }] }}>
                        <Checkbox
                          status={checked ? "checked" : "unchecked"}
                          onPress={() => toggle(item.product_id)}
                        />
                      </View>
                      <View style={styles.iconBox}>
                        <Package size={16} color="#888" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={styles.productName}>
                          {item.product_name}
                        </Text>
                        <Text numberOfLines={1} style={styles.sku}>
                          {item.sku} · {item.category_name}
                        </Text>
                      </View>
                      <View style={styles.stockBadge}>
                        <Text style={styles.stockBadgeText}>
                          Stock: {item.system_qty}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          <HStack
            style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}
          >
            <Text style={styles.footerText}>
              <Text style={styles.footerCount}>{draft.size}</Text> seleccionados
            </Text>
            <AppButton
              label="Confirmar selección"
              variant="info"
              fullWidth={false}
              onPress={confirm}
            />
          </HStack>
        </View>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: { fontSize: 17, fontWeight: "600", color: "#1a1a1a" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  listBox: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    overflow: "hidden",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d4d4d4",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  productName: { fontSize: 13, fontWeight: "500", color: "#1a1a1a" },
  sku: { fontSize: 11, color: "#888" },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  stockBadgeText: { fontSize: 11, fontWeight: "500", color: "#374151" },
  muted: { fontSize: 13, color: "#aaa", textAlign: "center", padding: 32 },
  footer: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#d4d4d4",
  },
  footerText: { fontSize: 13, color: "#888" },
  footerCount: { fontWeight: "600", color: "#1a1a1a" },
});
