import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
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
import {
  ApiCatalogProduct,
  CatalogProduct,
  SellUnit,
} from "@/src/types/pos/pos";
import {
  AlertTriangle,
  ChevronDown,
  Package,
  Plus,
  Tag,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { FlatList, useWindowDimensions } from "react-native";

// ---------------------------------------------------------------------------
// Coerción defensiva: el backend a veces manda los montos como string
// ("15.50") o con separador de miles.
// ---------------------------------------------------------------------------
function toNumber(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Adaptador: JSON de la API -> CatalogProduct
// ---------------------------------------------------------------------------
export function mapApiProductToProduct(api: ApiCatalogProduct): CatalogProduct {
  const baseUnit: SellUnit = {
    uom_id: api.unit_of_measure_id,
    code: api.unit_of_measure_code,
    name: api.unit_of_measure_name,
    factorToBase: 1,
  };
  const conversionUnits: SellUnit[] = (api.conversions ?? []).map((c) => ({
    uom_id: c.from_uom_id,
    code: c.from_uom_code,
    name: c.from_uom_name,
    factorToBase: c.factor,
  }));

  const finalPrice = toNumber(api.final_price);
  const basePrice = toNumber(api.base_price);
  const customerTypePrice = toNumber(api.customer_type_price);

  const price =
    finalPrice > 0
      ? finalPrice
      : api.has_customer_type_price && customerTypePrice > 0
        ? customerTypePrice
        : basePrice;

  if (__DEV__ && price === 0) {
    console.warn(
      `[POS] "${api.name}" (id ${api.product_id}) llegó sin precio utilizable. base_price=${api.base_price} final_price=${api.final_price} customer_type_price=${api.customer_type_price}`,
      api,
    );
  }

  const units = [baseUnit, ...conversionUnits];

  if (__DEV__ && conversionUnits.length > 0) {
    console.warn(
      `[POS] unidades de "${api.name}" (id ${api.product_id}):`,
      units.map((u) => `${u.name} = ${u.factorToBase} ${baseUnit.name}(s)`),
      "conversions crudo del API:",
      api.conversions,
    );
  }

  // Si no hay categoría "padre" real (parent_category_id null/vacío, como
  // pasa con varios productos), la categoría de nivel superior cae hacia
  // la categoría normal — así category_id/name nunca queda en null y lo
  // que se manda al backend en el checkout sigue siendo válido.
  const hasParent =
    !!api.parent_category_id && !!api.parent_category_name?.trim();

  return {
    product_id: api.product_id,
    name: api.name,
    sku: api.sku,
    category_id: hasParent ? api.parent_category_id : api.category_id,
    category_name: hasParent ? api.parent_category_name : api.category_name,
    subcategory_id: api.category_id,
    subcategory_name: api.category_name,
    stock_qty: api.stock_qty,
    units,
    price,
    hasPrice: price > 0,
    has_wholesale: api.has_wholesale,
    wholesale_min_qty: api.wholesale_min_qty ?? null,
    wholesale_discount_pct: api.wholesale_discount_pct ?? 0,
  };
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(n);
}
function formatQty(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

// ---------------------------------------------------------------------------
// Tarjeta de producto
// ---------------------------------------------------------------------------
// FIX: la unidad seleccionada ahora vive como useState LOCAL de la tarjeta,
// no como un Record<product_id, uom_id> en el padre. Antes, dentro del
// FlatList, el mapa `unitSel` del padre podía quedar un render atrás del
// Select (o el onAdd cerraba sobre un `unitSel` viejo), así que al tocar
// "Añadir" se usaba el fallback `item.units[0]` (la unidad base) en vez de
// la unidad realmente elegida. Con estado local, `unit` y `onAdd` siempre
// leen el mismo valor, en el mismo render, sin desfase posible.
function ProductCard({
  product,
  onAdd,
  duplicatedSku,
}: {
  product: CatalogProduct;
  onAdd: (unit: SellUnit) => void;
  duplicatedSku: boolean;
}) {
  const [selectedUomId, setSelectedUomId] = useState<number>(
    product.units[0].uom_id,
  );
  const unit =
    product.units.find((u) => u.uom_id === selectedUomId) ?? product.units[0];
  const soldOut = product.stock_qty <= 0;

  return (
    <Box className="m-1.5 flex-1 rounded-xl border border-gray-200 bg-white p-3">
      <VStack space="xs">
        <HStack className="items-start justify-between">
          <Text
            className="flex-1 text-sm font-semibold text-gray-900"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <Badge
            size="sm"
            variant="solid"
            className={`ml-1.5 rounded-full ${soldOut ? "bg-red-500" : "bg-gray-400"}`}
          >
            <BadgeText className="text-white">
              {soldOut ? "Agotado" : formatQty(product.stock_qty)}
            </BadgeText>
          </Badge>
        </HStack>

        <Text
          className={`font-mono text-[10px] ${duplicatedSku ? "text-amber-600" : "text-gray-400"}`}
        >
          {product.sku}
          {duplicatedSku ? "  ⚠ SKU duplicado" : ""}
        </Text>

        {product.has_wholesale && (
          <HStack space="xs" className="items-center">
            <Icon as={Tag} size="xs" className="text-blue-600" />
            <Text className="text-[10px] font-medium text-blue-600">
              mayoreo x{product.wholesale_min_qty} (-
              {product.wholesale_discount_pct}%)
            </Text>
          </HStack>
        )}

        <HStack className="items-baseline">
          {product.hasPrice ? (
            <>
              <Text className="text-base font-semibold text-gray-900">
                {formatCurrency(product.price * unit.factorToBase)}
              </Text>
              <Text className="ml-1 text-[10px] text-gray-400">
                /{unit.code}
              </Text>
            </>
          ) : (
            <Text className="text-xs font-medium text-gray-400">
              Sin precio
            </Text>
          )}
        </HStack>

        <HStack space="xs" className="items-center">
          {product.units.length > 1 && (
            <Select
              selectedValue={String(unit.uom_id)}
              onValueChange={(v) => setSelectedUomId(Number(v))}
              className="flex-1"
            >
              <SelectTrigger
                variant="outline"
                size="sm"
                className="justify-between border-gray-300 bg-white"
              >
                <SelectInput
                  placeholder="Unidad"
                  value={unit.name}
                  className="text-xs text-gray-900"
                />
                <Icon
                  as={ChevronDown}
                  size="xs"
                  className="mr-2 text-gray-400"
                />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent className="bg-white">
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {product.units.map((u) => (
                    <SelectItem
                      key={u.uom_id}
                      label={
                        u.factorToBase !== 1
                          ? `${u.name} (=${u.factorToBase})`
                          : u.name
                      }
                      value={String(u.uom_id)}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          )}
          <Button
            size="sm"
            variant="solid"
            isDisabled={soldOut}
            onPress={() => {
              if (__DEV__) {
                console.warn(
                  `[POS] Añadir "${product.name}" con unidad:`,
                  unit,
                );
              }
              onAdd(unit);
            }}
            className="shrink-0 bg-blue-600 disabled:bg-gray-300"
          >
            <ButtonIcon as={Plus} className="text-white" />
            <ButtonText className="text-white">Añadir</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

// Mismo breakpoint que Pos.tsx para decidir layout desktop/tablet vs móvil.
const DESKTOP_BREAKPOINT = 768;

// ---------------------------------------------------------------------------
// Grid del catálogo
// ---------------------------------------------------------------------------
export function ProductCatalog({
  data,
  onAddToCart,
  onPress,
}: {
  data: ApiCatalogProduct[];
  onAddToCart?: (product: CatalogProduct, unit: SellUnit) => void;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  const numColumns = width >= DESKTOP_BREAKPOINT ? 4 : 2;

  const products = useMemo(() => data.map(mapApiProductToProduct), [data]);

  const dupSkus = useMemo(() => {
    const seen = new Map<string, number>();
    products.forEach((p) => seen.set(p.sku, (seen.get(p.sku) ?? 0) + 1));
    return new Set(
      [...seen].filter(([, count]) => count > 1).map(([sku]) => sku),
    );
  }, [products]);

  if (products.length === 0) {
    return (
      <VStack className="items-center justify-center py-16" space="sm">
        <Icon as={Package} size="xl" className="text-gray-300" />
        <Text className="text-gray-400">Sin resultados</Text>
        <Button onPress={onPress}>
          <Text className="text-center text-base font-medium text-gray-700">
            Recargar información
          </Text>
        </Button>
      </VStack>
    );
  }

  return (
    <VStack space="sm" className="flex-1">
      {dupSkus.size > 0 && (
        <HStack
          space="xs"
          className="items-center rounded-lg border border-amber-300 bg-amber-50 p-2"
        >
          <Icon as={AlertTriangle} size="xs" className="text-amber-700" />
          <Text className="flex-1 text-xs text-amber-700">
            Hay productos con el mismo SKU. Verifica el catálogo en el backend.
          </Text>
        </HStack>
      )}

      <FlatList
        data={products}
        // La key debe cambiar junto con numColumns — FlatList no puede
        // recalcular el layout de columnas en caliente sin remontarse.
        key={`catalog-grid-${numColumns}col`}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            duplicatedSku={dupSkus.has(item.sku)}
            onAdd={(unit) => onAddToCart?.(item, unit)}
          />
        )}
      />
    </VStack>
  );
}
