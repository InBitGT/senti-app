import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { FlatProduct } from "@/src/types/stock_count/stock_count.types";
import { Package, Plus, SearchIcon, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { Checkbox } from "react-native-paper";

export function ProductPicker({
  products,
  selectedIds,
  onConfirm,
}: {
  products: FlatProduct[];
  selectedIds: Set<number>;
  onConfirm: (ids: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Set<number>>(new Set());

  // Al abrir, precargamos la selección actual.
  const handleOpen = () => {
    setDraft(new Set(selectedIds));
    setOpen(true);
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
    setOpen(false);
  };

  return (
    <>
      <Button
        size="md"
        variant="outline"
        style={styles.outlineButton}
        onPress={handleOpen}
      >
        <ButtonIcon as={Plus} style={{ color: "#000" }} />
        <ButtonText style={{ color: "#000" }}>Elegir artículos</ButtonText>
      </Button>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <VStack style={styles.modalContainer}>
          <HStack className="items-start justify-between mb-4">
            <VStack style={{ flex: 1 }}>
              <Text style={styles.title}>Elegir artículos a contar</Text>
              <Text style={styles.subtitle}>
                Selecciona solo los artículos que vas a contar. Los demás no se
                cargan.
              </Text>
            </VStack>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={8}
              style={{ padding: 4 }}
            >
              <X size={20} color="#888" />
            </Pressable>
          </HStack>

          <Input
            className="bg-white rounded-lg mb-4"
            variant="outline"
            size="md"
          >
            <InputSlot style={{ marginLeft: 10 }}>
              <InputIcon as={SearchIcon} size="sm" />
            </InputSlot>
            <InputField
              placeholder="Buscar por nombre, SKU o categoría…"
              value={query}
              onChangeText={setQuery}
            />
          </Input>

          <View style={styles.listBox}>
            {filtered.length === 0 ? (
              <Text style={styles.muted}>Sin resultados.</Text>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.product_id)}
                renderItem={({ item }) => {
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
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          <HStack style={styles.footer}>
            <Text style={styles.footerText}>
              <Text style={styles.footerCount}>{draft.size}</Text> seleccionados
            </Text>
            <Button size="md" style={styles.primaryButton} onPress={confirm}>
              <ButtonText style={{ color: "#fff" }}>
                Confirmar selección
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  outlineButton: { borderColor: "#949292", borderWidth: 1 },
  primaryButton: { backgroundColor: "#0C447C" },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 24,
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
  muted: { fontSize: 13, color: "#aaa", textAlign: "center", padding: 32 },
  footer: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#d4d4d4",
  },
  footerText: { fontSize: 13, color: "#888" },
  footerCount: { fontWeight: "600", color: "#1a1a1a" },
});
