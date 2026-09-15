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
import React, { useMemo } from "react";
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
  const [selectedUomId, setSelectedUomId] = React.useState<number>(
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

  return (
    <Box className="m-1.5 min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
      <VStack space="xs" className="flex-grow">
        <HStack className="items-start justify-between" space="xs">
          <Box className="min-w-0 flex-1">
            <Text
              className="text-sm font-semibold text-gray-900"
              numberOfLines={2}
            >
              {product.name}
            </Text>
          </Box>
          <Badge
            size="sm"
            variant="solid"
            className={`shrink-0 rounded-full ${noStockAtAll ? "bg-red-500" : "bg-gray-400"}`}
          >
            <BadgeText className="text-white" numberOfLines={1}>
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
          numberOfLines={1}
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
              className={`flex-1 text-[10px] font-medium ${
                isWholesaleActive ? "text-green-600" : "text-blue-600"
              }`}
              numberOfLines={1}
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

        {wouldExceedStock && (
          <Text className="text-[10px] font-medium text-amber-600">
            Solo quedan {formatQty(remainingStock)} disponibles, no alcanza para
            una unidad de &quot;{unit.name}&quot;.
          </Text>
        )}

        {/* El select de unidades va en su propia fila a ancho completo:
            antes competía por espacio horizontal con el botón "Añadir" y en
            cards angostas (3-4 columnas) quedaba invisible/cortado. */}
        {product.units.length > 1 && (
          <Select
            key={`unit-select-${product.product_id}-${unit.uom_id}`}
            selectedValue={String(unit.uom_id)}
            onValueChange={(v) => setSelectedUomId(Number(v))}
          >
            <SelectTrigger
              variant="outline"
              size="sm"
              className="w-full justify-between border-gray-300 bg-white"
            >
              <SelectInput
                placeholder="Unidad"
                value={unit.name}
                className="flex-1 text-xs text-gray-900"
              />
              <Icon
                as={ChevronDown}
                size="xs"
                className="mr-2 shrink-0 text-gray-400"
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
      </VStack>
      <Button
        size="sm"
        variant="solid"
        isDisabled={soldOut}
        onPress={() => onAdd(unit)}
        className="w-full bg-blue-600 disabled:bg-gray-300 mt-3"
      >
        <ButtonIcon as={Plus} className="text-white" />
        <ButtonText className="text-white">Añadir</ButtonText>
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Grid del catálogo
// ---------------------------------------------------------------------------

// Mismo breakpoint que Pos.tsx para decidir layout desktop/tablet vs móvil.
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

// Sin medición de contenedor (onLayout): eso causaba que en móvil el
// FlatList a veces no llegara a pintar contenido (altura 0 durante el
// primer layout) y además generaba remounts al fluctuar la medición.
// Ahora las columnas se derivan solo de useWindowDimensions, igual que
// hace Pos.tsx para decidir isDesktop.
function computeNumColumns(windowWidth: number): number {
  if (windowWidth < MOBILE_BREAKPOINT) return 2; // teléfono: siempre 2
  if (windowWidth < TABLET_BREAKPOINT) return 3; // tablet / desktop angosto
  return 4; // desktop ancho
}

// Item real o "relleno" invisible para completar la última fila y que
// todas las cards del grid tengan siempre el mismo ancho (evita que la
// última fila, al tener menos elementos, se estire y se vea distinta).
type FillerItem = { __filler: true; product_id: string };
type GridItem = CatalogProduct | FillerItem;

function isFiller(item: GridItem): item is FillerItem {
  return "__filler" in item;
}

export function ProductCatalog({
  data,
  onAddToCart,
  onPress,
}: {
  data: ApiCatalogProduct[];
  onAddToCart?: (product: CatalogProduct, unit: SellUnit) => void;
  onPress: () => void;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const numColumns = computeNumColumns(windowWidth);

  const products = useMemo(() => {
    const mapped = data.map(mapApiProductToProduct);
    return [...mapped].sort((a, b) => {
      const aOut = a.stock_qty <= 0 ? 1 : 0;
      const bOut = b.stock_qty <= 0 ? 1 : 0;
      return aOut - bOut;
    });
  }, [data]);

  const dupSkus = useMemo(() => {
    const seen = new Map<string, number>();
    products.forEach((p) => seen.set(p.sku, (seen.get(p.sku) ?? 0) + 1));
    return new Set(
      [...seen].filter(([, count]) => count > 1).map(([sku]) => sku),
    );
  }, [products]);

  const gridItems = useMemo<GridItem[]>(() => {
    const remainder = products.length % numColumns;
    if (remainder === 0) return products;
    const fillersNeeded = numColumns - remainder;
    const fillers: FillerItem[] = Array.from(
      { length: fillersNeeded },
      (_, i) => ({ __filler: true, product_id: `filler-${i}` }),
    );
    return [...products, ...fillers];
  }, [products, numColumns]);

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
        data={gridItems}
        key={`catalog-grid-${numColumns}col`}
        numColumns={numColumns}
        keyExtractor={(item) =>
          isFiller(item) ? item.product_id : String(item.product_id)
        }
        renderItem={({ item }) =>
          isFiller(item) ? (
            <Box className="m-1.5 flex-1" />
          ) : (
            <ProductCard
              product={item}
              duplicatedSku={dupSkus.has(item.sku)}
              onAdd={(unit) => onAddToCart?.(item, unit)}
            />
          )
        }
      />
    </VStack>
  );
}
