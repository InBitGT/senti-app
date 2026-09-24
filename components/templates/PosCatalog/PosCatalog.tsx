import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCartStore } from "@/src/store/useCartStore/useCartStore";
import {
  ApiCatalogProduct,
  CatalogProduct,
  SellUnit,
} from "@/src/types/pos/pos";
import { AlertTriangle, Package, Plus, Tag } from "lucide-react-native";
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

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Precio del producto para un tipo de cliente, tomado de
// `customer_type_prices`. Si el mismo tipo tiene varios precios, se usa el
// más reciente (id mayor). Devuelve 0 cuando no aplica.
function pickCustomerTypePrice(
  api: ApiCatalogProduct,
  customerTypeId?: number | null,
): number {
  if (customerTypeId == null) return 0;
  const matches = (api.customer_type_prices ?? []).filter(
    (p) =>
      Number(p.customer_type_id) === Number(customerTypeId) &&
      toNumber(p.amount) > 0,
  );
  if (matches.length === 0) return 0;
  const latest = matches.reduce((a, b) =>
    Number(b.id) > Number(a.id) ? b : a,
  );
  return toNumber(latest.amount);
}

export function mapApiProductToProduct(
  api: ApiCatalogProduct,
  customerTypeId?: number | null,
): CatalogProduct {
  const basePrice = toNumber(api.base_price);
  const finalPrice = toNumber(api.final_price);

  const typePrice = pickCustomerTypePrice(api, customerTypeId);
  const legacyTypePrice = api.has_customer_type_price
    ? toNumber(api.customer_type_price)
    : 0;
  const appliedTypePrice = typePrice > 0 ? typePrice : legacyTypePrice;
  const hasTypePrice = appliedTypePrice > 0;

  const normalPrice = hasTypePrice ? appliedTypePrice : basePrice;

  // Con precio de tipo, el mayoreo se calcula sobre ese precio. Sin precio
  // de tipo, se usa final_price como antes.
  const wholesalePct = toNumber(api.wholesale_discount_pct);
  const wholesalePrice = hasTypePrice
    ? api.has_wholesale
      ? round2(normalPrice * (1 - wholesalePct / 100))
      : normalPrice
    : finalPrice > 0
      ? finalPrice
      : normalPrice;

  // Algunos productos vienen sin unit_of_measure_* (null/"") cuando no
  // tienen una unidad configurada en el backend. Sin este fallback, esos
  // productos -si tampoco tienen conversiones- terminan con una sola
  // unidad "vacía": no se ve el AppSelect (solo aparece con >1 unidad) y
  // el precio se muestra como "10.00/" sin código.
  const baseUnit: SellUnit = {
    uom_id: Number(api.unit_of_measure_id) || 0,
    code: api.unit_of_measure_code?.trim() || "UNI",
    name: api.unit_of_measure_name?.trim() || "Unidad",
    factorToBase: 1,
    unitPrice: normalPrice,
    wholesaleUnitPrice: wholesalePrice,
  };

  const conversionUnits: SellUnit[] = (api.conversions ?? []).map((c) => {
    const specialPrice = toNumber(c.price_per_uom_amount);
    const byTypeOrBase = normalPrice * c.factor;
    const unitPrice =
      specialPrice > 0
        ? hasTypePrice
          ? Math.min(specialPrice, byTypeOrBase)
          : specialPrice
        : byTypeOrBase;

    return {
      uom_id: Number(c.id),
      code: c.from_uom_code,
      name: c.from_uom_name,
      factorToBase: c.factor,
      unitPrice,
      wholesaleUnitPrice: wholesalePrice * c.factor,
    };
  });

  const hasParent =
    api.parent_category_id != null && !!api.parent_category_name?.trim();

  return {
    product_id: api.product_id,
    name: api.name,
    sku: api.sku,
    category_id: hasParent
      ? (api.parent_category_id ?? api.category_id)
      : api.category_id,
    category_name: hasParent ? api.parent_category_name : api.category_name,
    subcategory_id: api.category_id,
    subcategory_name: api.category_name,
    stock_qty: api.stock_qty,
    units: [baseUnit, ...conversionUnits],
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

  const unitOptions = useMemo(
    () =>
      product.units.map((u) => ({
        label:
          u.factorToBase !== 1
            ? `${u.name} (=${u.factorToBase}) — ${formatCurrency(isWholesaleActive ? u.wholesaleUnitPrice : u.unitPrice)}`
            : u.name,
        value: String(u.uom_id),
      })),
    [product.units, isWholesaleActive],
  );

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
          <AppSelect
            label="Unidad"
            placeholder="Selecciona una unidad"
            searchable={false}
            options={unitOptions}
            value={String(unit.uom_id)}
            onChange={(v) => setSelectedUomId(Number(v))}
          />
        )}
      </VStack>

      <Box className="mt-3 ">
        <AppButton
          label="Añadir"
          variant="info"
          icon={Plus}
          isDisabled={soldOut}
          onPress={() => onAdd(unit)}
        />
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Grid del catálogo
// ---------------------------------------------------------------------------

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function computeNumColumns(windowWidth: number): number {
  if (windowWidth < MOBILE_BREAKPOINT) return 2;
  if (windowWidth < TABLET_BREAKPOINT) return 3;
  return 4;
}

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
    // Arrow explícita: `data.map(mapApiProductToProduct)` le pasaría el
    // índice como segundo argumento y lo tomaría como customerTypeId.
    const mapped = data.map((p) => mapApiProductToProduct(p));
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
            Hay productos con el mismo SKU. Verifica el catálogo.
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
