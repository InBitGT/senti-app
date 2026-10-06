import { AppButton } from "@/components/atom/AppButton/AppButton";
import { formatCurrency } from "@/components/templates/PosCatalog/PosCatalog";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ApiRecipeCatalogProduct } from "@/src/types/recipe_pos/recipe_pos";
import { Package, Plus, Tag } from "lucide-react-native";
import { useMemo } from "react";
import { FlatList, useWindowDimensions } from "react-native";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function computeNumColumns(windowWidth: number): number {
  if (windowWidth < MOBILE_BREAKPOINT) return 2;
  if (windowWidth < TABLET_BREAKPOINT) return 3;
  return 4;
}

function startingPrice(product: ApiRecipeCatalogProduct): number {
  if (product.variants.length === 0) return product.base_price;
  const minAdjustment = Math.min(
    ...product.variants.map((variant) => variant.price_adjustment),
  );
  return product.base_price + minAdjustment;
}

function RecipeCard({
  product,
  remaining,
  onAdd,
}: {
  product: ApiRecipeCatalogProduct;
  remaining: number;
  onAdd: () => void;
}) {
  const soldOut = remaining <= 0;
  const hasVariants = product.variants.length > 0;
  const hasModifiers = product.modifiers.length > 0;

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
            className={`shrink-0 rounded-full ${soldOut ? "bg-red-500" : "bg-gray-400"}`}
          >
            <BadgeText className="text-white" numberOfLines={1}>
              {soldOut ? "Agotado" : `${remaining} disp.`}
            </BadgeText>
          </Badge>
        </HStack>

        <Text className="font-mono text-[10px] text-gray-400" numberOfLines={1}>
          {product.sku}
        </Text>

        {product.has_wholesale && (
          <HStack space="xs" className="items-center">
            <Icon as={Tag} size="xs" className="text-blue-600" />
            <Text
              className="flex-1 text-[10px] font-medium text-blue-600"
              numberOfLines={1}
            >
              mayoreo x{product.wholesale_min_qty} (-
              {product.wholesale_discount_pct}%)
            </Text>
          </HStack>
        )}

        {(hasVariants || hasModifiers) && (
          <HStack space="xs" className="flex-wrap">
            {hasVariants && (
              <Badge className="rounded-full bg-purple-100">
                <BadgeText className="text-purple-700">
                  {product.variants.length} variantes
                </BadgeText>
              </Badge>
            )}
            {hasModifiers && (
              <Badge className="rounded-full bg-amber-100">
                <BadgeText className="text-amber-700">
                  {product.modifiers.length} extras
                </BadgeText>
              </Badge>
            )}
          </HStack>
        )}

        <HStack className="items-baseline">
          {product.base_price > 0 ? (
            <>
              {hasVariants && (
                <Text className="mr-1 text-[10px] text-gray-400">Desde</Text>
              )}
              <Text className="text-base font-semibold text-gray-900">
                {formatCurrency(startingPrice(product))}
              </Text>
            </>
          ) : (
            <Text className="text-xs font-medium text-gray-400">
              Sin precio
            </Text>
          )}
        </HStack>
      </VStack>

      <Box className="mt-3">
        <AppButton
          label="Agregar"
          variant="info"
          icon={Plus}
          isDisabled={soldOut || product.base_price <= 0}
          onPress={onAdd}
        />
      </Box>
    </Box>
  );
}

type FillerItem = { __filler: true; product_id: string };
type GridItem = ApiRecipeCatalogProduct | FillerItem;

function isFiller(item: GridItem): item is FillerItem {
  return "__filler" in item;
}

export function RecipePosCatalog({
  data,
  getRemaining,
  onAdd,
}: {
  data: ApiRecipeCatalogProduct[];
  getRemaining: (product: ApiRecipeCatalogProduct) => number;
  onAdd: (product: ApiRecipeCatalogProduct) => void;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const numColumns = computeNumColumns(windowWidth);

  const products = useMemo(
    () =>
      [...data].sort((a, b) => {
        const aOut = a.stock_qty <= 0 ? 1 : 0;
        const bOut = b.stock_qty <= 0 ? 1 : 0;
        return aOut - bOut;
      }),
    [data],
  );

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
    <FlatList
      data={gridItems}
      key={`recipe-grid-${numColumns}col`}
      numColumns={numColumns}
      keyExtractor={(item) =>
        isFiller(item) ? item.product_id : String(item.product_id)
      }
      renderItem={({ item }) =>
        isFiller(item) ? (
          <Box className="m-1.5 flex-1" />
        ) : (
          <RecipeCard
            product={item}
            remaining={getRemaining(item)}
            onAdd={() => onAdd(item)}
          />
        )
      }
    />
  );
}
