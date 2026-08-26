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
import { useCartStore } from "@/src/store/useCartStore/useCartStore";
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

function toNumber(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function mapApiProductToProduct(api: ApiCatalogProduct): CatalogProduct {
  const basePrice = toNumber(api.base_price);
  const finalPrice = toNumber(api.final_price);
  const customerTypePrice = toNumber(api.customer_type_price);

  const normalPrice =
    api.has_customer_type_price && customerTypePrice > 0
      ? customerTypePrice
      : basePrice;

  const wholesalePrice = finalPrice > 0 ? finalPrice : normalPrice;

  if (__DEV__ && normalPrice === 0) {
    console.warn(
      `[POS] "${api.name}" (id ${api.product_id}) llegó sin precio normal utilizable. base_price=${api.base_price} customer_type_price=${api.customer_type_price}`,
      api,
    );
  }

  const baseUnit: SellUnit = {
    uom_id: Number(api.unit_of_measure_id),
    code: api.unit_of_measure_code,
    name: api.unit_of_measure_name,
    factorToBase: 1,
    unitPrice: normalPrice,
    wholesaleUnitPrice: wholesalePrice,
  };

  const conversionUnits: SellUnit[] = (api.conversions ?? []).map((c) => {
    const specialPrice = toNumber(c.price_per_uom_amount);
    const unitPrice = specialPrice > 0 ? specialPrice : normalPrice * c.factor;
    const wholesaleUnitPrice = wholesalePrice * c.factor;

    if (__DEV__ && specialPrice > 0) {
      console.warn(
        `[POS] "${api.name}": la unidad "${c.from_uom_name}" tiene precio especial de conversión Q${specialPrice} ` +
          `(en vez de Q${normalPrice * c.factor} que daría normalPrice * factor).`,
      );
    }

    return {
      uom_id: Number(c.id),
      code: c.from_uom_code,
      name: c.from_uom_name,
      factorToBase: c.factor,
      unitPrice,
      wholesaleUnitPrice,
    };
  });

  const units = [baseUnit, ...conversionUnits];

  if (__DEV__ && conversionUnits.length > 0) {
    console.warn(
      `[POS] unidades de "${api.name}" (id ${api.product_id}):`,
      units.map(
        (u) =>
          `${u.name} (uom_id=${u.uom_id}) = ${u.factorToBase} ${baseUnit.name}(s), ` +
          `normal=Q${u.unitPrice}, mayoreo=Q${u.wholesaleUnitPrice}`,
      ),
      "conversions crudo del API:",
      api.conversions,
    );
  }

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
    price: normalPrice,
    wholesalePrice,
    hasPrice: normalPrice > 0,
    has_wholesale: api.has_wholesale,
    wholesale_min_qty: api.wholesale_min_qty ?? null,
    wholesale_discount_pct: api.wholesale_discount_pct ?? 0,
    brand: api.brand,
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
    Number(product.units[0].uom_id),
  );
  const unit =
    product.units.find((u) => u.uom_id === selectedUomId) ?? product.units[0];

  const cart = useCartStore((s) => s.cart);
  const qtyInCart = useMemo(
    () =>
      cart.reduce(
        (sum, l) =>
          l.product.product_id === product.product_id ? sum + l.quantity : sum,
        0,
      ),
    [cart, product.product_id],
  );
  const remainingStock = Math.max(0, product.stock_qty - qtyInCart);

  const noStockAtAll = product.stock_qty <= 0;
  const wouldExceedStock = !noStockAtAll && unit.factorToBase > remainingStock;
  const soldOut = noStockAtAll || wouldExceedStock;
  const isWholesaleActive =
    product.has_wholesale &&
    product.wholesale_min_qty != null &&
    qtyInCart >= product.wholesale_min_qty;
  const displayUnitPrice = isWholesaleActive
    ? unit.wholesaleUnitPrice
    : unit.unitPrice;

  console.log("product card", product);
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
            className={`ml-1.5 rounded-full ${noStockAtAll ? "bg-red-500" : "bg-gray-400"}`}
          >
            <BadgeText className="text-white">
              {noStockAtAll
                ? "Agotado"
                : qtyInCart > 0
                  ? `${formatQty(remainingStock)} disp.`
                  : formatQty(product.stock_qty)}
            </BadgeText>
          </Badge>
        </HStack>

        <Text
          className={`font-mono text-[10px] ${duplicatedSku ? "text-amber-600" : "text-gray-400"}`}
        >
          {product.sku} - {product?.brand}
          {duplicatedSku ? "  ⚠ SKU duplicado" : ""}
        </Text>

        {product.has_wholesale && (
          <HStack space="xs" className="items-center">
            <Icon
              as={Tag}
              size="xs"
              className={isWholesaleActive ? "text-green-600" : "text-blue-600"}
            />
            <Text
              className={`text-[10px] font-medium ${
                isWholesaleActive ? "text-green-600" : "text-blue-600"
              }`}
            >
              mayoreo x{product.wholesale_min_qty} (-
              {product.wholesale_discount_pct}%)
              {isWholesaleActive ? " · activo" : ""}
            </Text>
          </HStack>
        )}

        <HStack className="items-baseline">
          {product.hasPrice ? (
            <>
              {/* Muestra el precio de mayoreo solo si ya se alcanzó la
                  cantidad mínima en el carrito; si no, el precio normal. */}
              <Text className="text-base font-semibold text-gray-900">
                {formatCurrency(displayUnitPrice)}
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

        {/* Aviso cuando la unidad elegida no entra en lo que queda de stock */}
        {wouldExceedStock && (
          <Text className="text-[10px] font-medium text-amber-600">
            Solo quedan {formatQty(remainingStock)} disponibles, no alcanza para
            una unidad de &quot;{unit.name}&quot;.
          </Text>
        )}

        <HStack space="xs" className="items-center">
          {product.units.length > 1 && (
            <Select
              // Forzamos remount del Select cada vez que cambia la unidad
              // elegida, para que el SelectInput siempre refleje
              // `unit.name` actual y no se quede mostrando texto viejo.
              key={`unit-select-${product.product_id}-${unit.uom_id}`}
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
                          ? `${u.name} (=${u.factorToBase}) — ${formatCurrency(isWholesaleActive ? u.wholesaleUnitPrice : u.unitPrice)}`
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
                  `remainingStock=${remainingStock}`,
                  `isWholesaleActive=${isWholesaleActive}`,
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
          <Text className="text-center text-base font-medium text-white">
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
