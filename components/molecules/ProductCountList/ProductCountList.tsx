import { Text } from "@/components/ui/text";
import type {
  CountLine,
  FlatProduct,
} from "@/src/types/stock_count/stock_count.types";
import { Minus, Package, Plus, Trash2 } from "lucide-react-native";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";

const DIFF_CONFIG = {
  positive: { color: "#27500A", bg: "#EAF3DE" },
  negative: { color: "#7C1D1D", bg: "#FBE6E6" },
};

function DiffBadge({ diff }: { diff: number }) {
  if (diff === 0) return null;
  const cfg = diff > 0 ? DIFF_CONFIG.positive : DIFF_CONFIG.negative;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>
        {diff > 0 ? `+${diff}` : diff}
      </Text>
    </View>
  );
}

function CountRow({
  product,
  line,
  onStep,
  onSet,
  onRemove,
}: {
  product: FlatProduct;
  line: CountLine;
  onStep: (product: FlatProduct, delta: number) => void;
  onSet: (product: FlatProduct, qty: number) => void;
  onRemove: (product: FlatProduct) => void;
}) {
  const counted = line.counted_qty;
  const diff = counted - product.system_qty;

  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Package size={16} color="#888" />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.productName}>
          {product.product_name}
        </Text>
        <Text numberOfLines={1} style={styles.sku}>
          {product.sku} · sistema: {product.system_qty}
        </Text>
      </View>

      <DiffBadge diff={diff} />

      {/* Conteo por unidad: cada toque suma o resta 1 unidad. */}
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onStep(product, -1)}
          disabled={counted <= 0}
          style={[styles.stepButton, counted <= 0 && styles.stepButtonDisabled]}
        >
          <Minus size={16} color="#374151" />
        </Pressable>
        <TextInput
          value={String(counted)}
          onChangeText={(text) => {
            const parsed = Number(text.replace(/[^0-9]/g, ""));
            onSet(product, Number.isFinite(parsed) ? parsed : 0);
          }}
          keyboardType="number-pad"
          selectTextOnFocus
          style={styles.input}
        />
        <Pressable onPress={() => onStep(product, 1)} style={styles.stepButton}>
          <Plus size={16} color="#374151" />
        </Pressable>
      </View>

      <Pressable
        onPress={() => onRemove(product)}
        hitSlop={8}
        style={styles.removeButton}
      >
        <Trash2 size={16} color="#888" />
      </Pressable>
    </View>
  );
}

export function ProductCountList({
  selected,
  lines,
  onStep,
  onSet,
  onRemove,
}: {
  selected: FlatProduct[];
  lines: Map<number, CountLine>;
  onStep: (product: FlatProduct, delta: number) => void;
  onSet: (product: FlatProduct, qty: number) => void;
  onRemove: (product: FlatProduct) => void;
}) {
  if (selected.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Package size={28} color="#aaa" />
        <Text style={styles.emptyTitle}>Aún no eliges artículos</Text>
        <Text style={styles.emptyText}>
          Usa &quot;Elegir artículos&quot; para seleccionar qué contar. Solo
          aparecerán aquí los que elijas.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listBox}>
      <FlatList
        data={selected}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item: product }) => {
          const line = lines.get(product.product_id);
          if (!line) return null;
          return (
            <CountRow
              product={product}
              line={line}
              onStep={onStep}
              onSet={onSet}
              onRemove={onRemove}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listBox: {
    maxHeight: 420,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    overflow: "hidden",
    backgroundColor: "#fff",
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 4 },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonDisabled: { opacity: 0.4 },
  input: {
    height: "auto",
    width: 52,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    paddingVertical: 10,
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d4d4d4",
    paddingVertical: 64,
  },
  emptyTitle: { fontSize: 13, fontWeight: "500", color: "#1a1a1a" },
  emptyText: {
    maxWidth: 260,
    textAlign: "center",
    fontSize: 11,
    color: "#888",
  },
});
