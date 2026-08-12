import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon, Icon } from "@/components/ui/icon";
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
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useCategorie } from "@/src/hooks";
import { useCustomerType } from "@/src/hooks/useCustomerType/useCustomerType";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useMerchandise } from "@/src/hooks/useMerchandise/useMerchandise";
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useAuthStore } from "@/src/store";
import { useMerchandiseStore } from "@/src/store/useMerchandiseStore/useMerchandiseStore";
import type {
  MerchandiseDetail,
  MerchandiseListItem,
} from "@/src/types/merchandise/merchandise.types";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, Plus, Trash2 } from "lucide-react-native";
import React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ConversionRow {
  from_uom_id: string;
  to_uom_id: string;
  factor: string;
  // Precio específico para esta conversión (opcional).
  has_price_per_uom: boolean;
  price_per_uom_amount: string;
  price_per_uom_currency: string;
  price_per_uom_wholesale_min_qty: string;
  price_per_uom_wholesale_amount: string;
}

interface CustomerTypePriceRow {
  customer_type_id: string;
  amount: string;
  currency: string;
}

interface FormValues {
  category_id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string;
  type: string;
  unit_of_measure_id: string;
  average_cost: string;
  requires_batch: boolean;
  availability_status: string;
  // Precio base
  price_amount: string;
  price_currency: string;
  // Conversiones de unidad (0..n), cada una con su propio precio opcional
  conversions: ConversionRow[];
  // Precios por tipo de cliente (0..n)
  customer_type_prices: CustomerTypePriceRow[];
  // Regla de mayoreo general del producto (única, opcional)
  has_wholesale_rule: boolean;
  wholesale_min_quantity: string;
  wholesale_discount_percentage: string;
}

const PRODUCT_TYPES = [
  { label: "Producto", value: "finished_product" },
  { label: "Servicio", value: "services" },
  { label: "Material de empaque", value: "packing" },
];

const CURRENCIES = [
  { label: "GTQ", value: "GTQ" },
  { label: "USD", value: "USD" },
];

// Extraída como función aparte para poder llamarla también desde reset(),
// no solo desde el defaultValues inicial de useForm.
function buildDefaultValues(data?: MerchandiseListItem | null): FormValues {
  const product = data?.product;

  return {
    category_id: product?.category_id ? String(product.category_id) : "",
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    brand: product?.brand || "",
    type: product?.type || "finished_product",
    unit_of_measure_id: product?.unit_of_measure_id
      ? String(product.unit_of_measure_id)
      : "",
    average_cost:
      product?.average_cost != null ? String(product.average_cost) : "",
    requires_batch: product?.requires_batch ?? false,
    availability_status: product?.availability_status || "available",
    price_amount: data?.price?.amount != null ? String(data.price.amount) : "",
    price_currency: data?.price?.currency || "GTQ",
    conversions: data?.conversions?.length
      ? data.conversions.map((c) => ({
          from_uom_id: String(c.from_uom_id),
          to_uom_id: String(c.to_uom_id),
          factor: String(c.factor),
          has_price_per_uom: !!c.price_per_uom,
          price_per_uom_amount:
            c.price_per_uom?.amount != null
              ? String(c.price_per_uom.amount)
              : "",
          price_per_uom_currency: c.price_per_uom?.currency || "GTQ",
          price_per_uom_wholesale_min_qty:
            c.price_per_uom?.wholesale_min_qty != null
              ? String(c.price_per_uom.wholesale_min_qty)
              : "",
          price_per_uom_wholesale_amount:
            c.price_per_uom?.wholesale_amount != null
              ? String(c.price_per_uom.wholesale_amount)
              : "",
        }))
      : [],
    customer_type_prices: data?.customer_type_prices?.length
      ? data.customer_type_prices.map((c) => ({
          customer_type_id: String(c.customer_type_id),
          amount: String(c.amount),
          currency: c.currency,
        }))
      : [],
    has_wholesale_rule: !!data?.wholesale_rule,
    wholesale_min_quantity: data?.wholesale_rule?.min_quantity
      ? String(data.wholesale_rule.min_quantity)
      : "",
    wholesale_discount_percentage: data?.wholesale_rule?.discount_percentage
      ? String(data.wholesale_rule.discount_percentage)
      : "",
  };
}

export default function MerchandiseForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useMerchandise();
  const { data: categorie } = useCategorie();
  const { data: units } = useUnit();
  const { data: customerTypes } = useCustomerType();
  // "data" es la respuesta completa del GET al editar:
  // { product, price, conversions, customer_type_prices, price_per_uom, wholesale_rule }
  // El store ya está tipado como MerchandiseListItem, así que no hace falta
  // ningún cast aquí.
  const data = useMerchandiseStore((state) => state.data);
  const isEdit = useMerchandiseStore((state) => state.isEdit);
  const clearData = useMerchandiseStore((state) => state.clearData);
  const setIsEdit = useMerchandiseStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const product = data?.product;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: buildDefaultValues(data),
  });

  // ⚠️ FIX CLAVE (edición): useForm's defaultValues solo se lee UNA VEZ, al
  // montar el componente. Si esta pantalla ya estaba montada (ej. quedó en el
  // stack de navegación de una visita anterior), cambiar de producto a editar
  // NO repuebla el formulario solo — hay que forzarlo con reset().
  //
  // Blindado para modo creación: si "data" es undefined (estamos creando un
  // producto nuevo, no editando), este efecto NO debe tocar el formulario en
  // absoluto — así nunca corre el riesgo de resetear conversiones que el
  // usuario ya agregó a mano con "Agregar conversión".
  React.useEffect(() => {
    if (!data) return;
    reset(buildDefaultValues(data));
  }, [data, reset]);

  const {
    fields: conversionFields,
    append: appendConversion,
    remove: removeConversion,
  } = useFieldArray({ control, name: "conversions" });

  const {
    fields: customerPriceFields,
    append: appendCustomerPrice,
    remove: removeCustomerPrice,
  } = useFieldArray({ control, name: "customer_type_prices" });

  const hasWholesaleRule = watch("has_wholesale_rule");
  const conversionsValue = watch("conversions");
  const priceCurrency = watch("price_currency");

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload: MerchandiseDetail = {
      tenant_id: claims.tenant_id,
      category_id: parseInt(values.category_id),
      name: values.name.trim(),
      description: values.description.trim(),
      sku: values.sku.trim(),
      barcode: values.barcode.trim(),
      brand: values.brand.trim() || null,
      type: values.type,
      unit_of_measure_id: parseInt(values.unit_of_measure_id),
      average_cost: parseFloat(values.average_cost),
      requires_batch: values.requires_batch,
      availability_status: values.availability_status,
      picture: null,
      is_modifier: false,
      price: {
        amount: parseFloat(values.price_amount),
        currency: values.price_currency,
      },
      conversions: values.conversions
        .filter((c) => c.from_uom_id && c.to_uom_id && c.factor)
        .map((c) => ({
          from_uom_id: parseInt(c.from_uom_id),
          to_uom_id: parseInt(c.to_uom_id),
          factor: parseFloat(c.factor),
          ...(c.has_price_per_uom && c.price_per_uom_amount
            ? {
                price_per_uom: {
                  amount: parseFloat(c.price_per_uom_amount),
                  currency: c.price_per_uom_currency || values.price_currency,
                  ...(c.price_per_uom_wholesale_min_qty
                    ? {
                        wholesale_min_qty: parseInt(
                          c.price_per_uom_wholesale_min_qty,
                        ),
                      }
                    : {}),
                  ...(c.price_per_uom_wholesale_amount
                    ? {
                        wholesale_amount: parseFloat(
                          c.price_per_uom_wholesale_amount,
                        ),
                      }
                    : {}),
                },
              }
            : {}),
        })),
      customer_type_prices: values.customer_type_prices
        .filter((c) => c.customer_type_id && c.amount)
        .map((c) => ({
          customer_type_id: parseInt(c.customer_type_id),
          amount: parseFloat(c.amount),
          currency: c.currency,
        })),
      wholesale_rule: values.has_wholesale_rule
        ? {
            min_quantity: parseInt(values.wholesale_min_quantity),
            discount_percentage: parseFloat(
              values.wholesale_discount_percentage,
            ),
          }
        : null,
    };

    console.log(JSON.stringify(payload), "valores de payload ");

    try {
      if (!isEdit) {
        await post.mutateAsync(payload);
        showToast({
          message: "Producto creado correctamente",
          type: "success",
        });
      } else {
        if (!product?.id) return;
        await put.mutateAsync({ id: product.id, data: payload });
        showToast({
          message: "Producto editado correctamente",
          type: "success",
        });
        setIsEdit(false);
      }

      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el producto", type: "error" });
    }
  };

  const isPending = post.isPending || put.isPending;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView edges={["top"]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <DesktopScrollView useWindowHeight>
            <Pressable
              onPress={() => {
                clearData();
                setIsEdit(false);
                router.back();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Icon as={ArrowLeftIcon} size="xl" style={{ color: "#000" }} />
              <Text style={{ color: "#000", marginLeft: 8, fontSize: 16 }}>
                Regresar
              </Text>
            </Pressable>

            <Center>
              <Box
                style={styles.card}
                className="w-full bg-white rounded-[20px] py-8 px-7"
              >
                <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                  {isEdit ? "Editar Producto" : "Nuevo Producto"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar el producto"
                    : "Llena los campos para crear un producto"}
                </Text>

                <VStack space="lg">
                  <Text style={styles.sectionLabel}>INFORMACIÓN GENERAL</Text>

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="name"
                        rules={{ required: "El nombre es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormControl isInvalid={!!errors.name}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                Nombre
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputField
                                style={{ color: "#171717" }}
                                placeholder="Ej. Lápiz b1"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                              />
                            </Input>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>
                                {errors.name?.message}
                              </FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        )}
                      />
                    </View>

                    <View style={half}>
                      <Controller
                        control={control}
                        name="category_id"
                        rules={{ required: "La categoría es obligatoria." }}
                        render={({ field: { onChange, value } }) => {
                          const selectedLabel =
                            categorie?.find((c) => String(c.id) === value)
                              ?.name || "";
                          return (
                            <FormControl isInvalid={!!errors.category_id}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Categoría
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Select
                                selectedValue={value}
                                onValueChange={onChange}
                              >
                                <SelectTrigger>
                                  <SelectInput
                                    style={{ color: "#000" }}
                                    placeholder="Selecciona categoría"
                                    value={selectedLabel}
                                  />
                                </SelectTrigger>
                                <SelectPortal>
                                  <SelectBackdrop />
                                  <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                      <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {(categorie ?? []).map((c) => (
                                      <SelectItem
                                        key={c.id}
                                        label={c.name}
                                        value={String(c.id)}
                                      />
                                    ))}
                                  </SelectContent>
                                </SelectPortal>
                              </Select>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {errors.category_id?.message}
                                </FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          );
                        }}
                      />
                    </View>
                  </View>

                  <Controller
                    control={control}
                    name="description"
                    rules={{
                      required: "La descripción es obligatoria.",
                      minLength: { value: 3, message: "Mínimo 3 caracteres." },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl isInvalid={!!errors.description}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>
                            Descripción
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Textarea>
                          <TextareaInput
                            style={{ color: "#171717" }}
                            placeholder="Describe el producto..."
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                          />
                        </Textarea>
                        <FormControlError>
                          <FormControlErrorIcon as={AlertCircleIcon} />
                          <FormControlErrorText>
                            {errors.description?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="sku"
                        rules={{ required: "El SKU es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormControl isInvalid={!!errors.sku}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                SKU
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputField
                                style={{ color: "#171717" }}
                                placeholder="Ej. LAP-001"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCapitalize="characters"
                              />
                            </Input>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>
                                {errors.sku?.message}
                              </FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        )}
                      />
                    </View>

                    <View style={half}>
                      <Controller
                        control={control}
                        name="barcode"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                Código de barras{" "}
                                <Text size="xs" style={{ color: "#999" }}>
                                  (opcional)
                                </Text>
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputField
                                style={{ color: "#171717" }}
                                placeholder="Ej. 123"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="number-pad"
                              />
                            </Input>
                          </FormControl>
                        )}
                      />
                    </View>
                  </View>

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="brand"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                Marca{" "}
                                <Text size="xs" style={{ color: "#999" }}>
                                  (opcional)
                                </Text>
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputField
                                style={{ color: "#171717" }}
                                placeholder="Ej. Del Monte"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                              />
                            </Input>
                          </FormControl>
                        )}
                      />
                    </View>

                    <View style={half}>
                      <Controller
                        control={control}
                        name="average_cost"
                        rules={{ required: "El costo es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormControl isInvalid={!!errors.average_cost}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                Costo promedio
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputField
                                style={{ color: "#171717" }}
                                placeholder="Ej. 0.60"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="decimal-pad"
                              />
                            </Input>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>
                                {errors.average_cost?.message}
                              </FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        )}
                      />
                    </View>
                  </View>

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="type"
                        rules={{ required: "El tipo es obligatorio." }}
                        render={({ field: { onChange, value } }) => {
                          const selectedLabel =
                            PRODUCT_TYPES.find((t) => t.value === value)
                              ?.label || "";
                          return (
                            <FormControl isInvalid={!!errors.type}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Tipo
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Select
                                selectedValue={value}
                                onValueChange={onChange}
                              >
                                <SelectTrigger>
                                  <SelectInput
                                    style={{ color: "#000" }}
                                    placeholder="Selecciona un tipo"
                                    value={selectedLabel}
                                  />
                                </SelectTrigger>
                                <SelectPortal>
                                  <SelectBackdrop />
                                  <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                      <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {PRODUCT_TYPES.map((t) => (
                                      <SelectItem
                                        key={t.value}
                                        label={t.label}
                                        value={t.value}
                                      />
                                    ))}
                                  </SelectContent>
                                </SelectPortal>
                              </Select>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {errors.type?.message}
                                </FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          );
                        }}
                      />
                    </View>

                    <View style={half}>
                      <Controller
                        control={control}
                        name="unit_of_measure_id"
                        rules={{ required: "La unidad es obligatoria." }}
                        render={({ field: { onChange, value } }) => {
                          const selectedLabel =
                            units?.find((u) => String(u.id) === value)?.name ||
                            "";
                          return (
                            <FormControl
                              isInvalid={!!errors.unit_of_measure_id}
                            >
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Unidad de medida
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Select
                                selectedValue={value}
                                onValueChange={onChange}
                              >
                                <SelectTrigger>
                                  <SelectInput
                                    style={{ color: "#000" }}
                                    placeholder="Selecciona unidad"
                                    value={selectedLabel}
                                  />
                                </SelectTrigger>
                                <SelectPortal>
                                  <SelectBackdrop />
                                  <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                      <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    <ScrollView
                                      style={{ maxHeight: 280, width: "100%" }}
                                      nestedScrollEnabled
                                    >
                                      {(units ?? []).map((u) => (
                                        <SelectItem
                                          key={u.id}
                                          label={`${u.name} (${u.code})`}
                                          value={String(u.id)}
                                        />
                                      ))}
                                    </ScrollView>
                                  </SelectContent>
                                </SelectPortal>
                              </Select>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {errors.unit_of_measure_id?.message}
                                </FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          );
                        }}
                      />
                    </View>
                  </View>

                  <Divider className="my-2" />
                  <Text style={styles.sectionLabel}>PRECIO</Text>

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="price_amount"
                        rules={{ required: "El precio es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormControl isInvalid={!!errors.price_amount}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                Precio de venta
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputField
                                style={{ color: "#171717" }}
                                placeholder="Ej. 1.00"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="decimal-pad"
                              />
                            </Input>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>
                                {errors.price_amount?.message}
                              </FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        )}
                      />
                    </View>

                    <View style={half}>
                      <Controller
                        control={control}
                        name="price_currency"
                        render={({ field: { onChange, value } }) => (
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                Moneda
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Select
                              selectedValue={value}
                              onValueChange={onChange}
                            >
                              <SelectTrigger>
                                <SelectInput
                                  style={{ color: "#000" }}
                                  placeholder="Selecciona moneda"
                                  value={value}
                                />
                              </SelectTrigger>
                              <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                  <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                  </SelectDragIndicatorWrapper>
                                  {CURRENCIES.map((c) => (
                                    <SelectItem
                                      key={c.value}
                                      label={c.label}
                                      value={c.value}
                                    />
                                  ))}
                                </SelectContent>
                              </SelectPortal>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </View>
                  </View>

                  <Divider className="my-2" />
                  <HStack
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.sectionLabel}>
                      CONVERSIONES DE UNIDAD{" "}
                      <Text size="xs" style={{ color: "#999" }}>
                        (opcional)
                      </Text>
                    </Text>
                    <Pressable
                      onPress={() =>
                        appendConversion({
                          from_uom_id: "",
                          to_uom_id: "",
                          factor: "",
                          has_price_per_uom: false,
                          price_per_uom_amount: "",
                          price_per_uom_currency: priceCurrency || "GTQ",
                          price_per_uom_wholesale_min_qty: "",
                          price_per_uom_wholesale_amount: "",
                        })
                      }
                      style={styles.addRowButton}
                    >
                      <Icon as={Plus} size="sm" style={{ color: "#0C447C" }} />
                      {/* <Text style={styles.addRowText}>Agregar conversión</Text> */}
                    </Pressable>
                  </HStack>

                  {conversionFields.length === 0 && (
                    <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                      Este producto no tiene conversiones de unidad.
                    </Text>
                  )}

                  {conversionFields.map((field, index) => {
                    const currentFromId =
                      conversionsValue?.[index]?.from_uom_id;
                    const toOptions = (units ?? []).filter(
                      (u) => String(u.id) !== currentFromId,
                    );
                    const rowHasPrice =
                      conversionsValue?.[index]?.has_price_per_uom;
                    return (
                      <View key={field.id} style={styles.dynamicRow}>
                        <View style={row}>
                          <View style={half}>
                            <Controller
                              control={control}
                              name={`conversions.${index}.from_uom_id`}
                              render={({ field: { onChange, value } }) => {
                                const label =
                                  units?.find((u) => String(u.id) === value)
                                    ?.name || "";
                                return (
                                  <FormControl>
                                    <FormControlLabel>
                                      <FormControlLabelText
                                        style={{ color: "#000" }}
                                      >
                                        De la unidad
                                      </FormControlLabelText>
                                    </FormControlLabel>
                                    <Select
                                      selectedValue={value}
                                      onValueChange={onChange}
                                    >
                                      <SelectTrigger>
                                        <SelectInput
                                          style={{ color: "#000" }}
                                          placeholder="Unidad origen"
                                          value={label}
                                        />
                                      </SelectTrigger>
                                      <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent
                                          style={{ maxHeight: "50%" }}
                                        >
                                          <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                          </SelectDragIndicatorWrapper>
                                          <ScrollView
                                            style={{ width: "100%" }}
                                            showsVerticalScrollIndicator={false}
                                          >
                                            {(units ?? []).map((u) => (
                                              <SelectItem
                                                key={u.id}
                                                label={`${u.name} (${u.code})`}
                                                value={String(u.id)}
                                              />
                                            ))}
                                          </ScrollView>
                                        </SelectContent>
                                      </SelectPortal>
                                    </Select>
                                  </FormControl>
                                );
                              }}
                            />
                          </View>

                          <View style={half}>
                            <Controller
                              control={control}
                              name={`conversions.${index}.to_uom_id`}
                              render={({ field: { onChange, value } }) => {
                                const label =
                                  units?.find((u) => String(u.id) === value)
                                    ?.name || "";
                                return (
                                  <FormControl>
                                    <FormControlLabel>
                                      <FormControlLabelText
                                        style={{ color: "#000" }}
                                      >
                                        A la unidad
                                      </FormControlLabelText>
                                    </FormControlLabel>
                                    <Select
                                      selectedValue={value}
                                      onValueChange={onChange}
                                    >
                                      <SelectTrigger>
                                        <SelectInput
                                          style={{ color: "#000" }}
                                          placeholder="Unidad destino"
                                          value={label}
                                        />
                                      </SelectTrigger>
                                      <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent
                                          style={{ maxHeight: "50%" }}
                                        >
                                          <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                          </SelectDragIndicatorWrapper>
                                          <ScrollView
                                            style={{ width: "100%" }}
                                            showsVerticalScrollIndicator={false}
                                          >
                                            {toOptions.map((u) => (
                                              <SelectItem
                                                key={u.id}
                                                label={`${u.name} (${u.code})`}
                                                value={String(u.id)}
                                              />
                                            ))}
                                          </ScrollView>
                                        </SelectContent>
                                      </SelectPortal>
                                    </Select>
                                  </FormControl>
                                );
                              }}
                            />
                          </View>
                        </View>

                        <Controller
                          control={control}
                          name={`conversions.${index}.factor`}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Factor
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. 10"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  keyboardType="decimal-pad"
                                />
                              </Input>
                            </FormControl>
                          )}
                        />

                        <View style={styles.switchRow}>
                          <Text style={{ color: "#000", fontSize: 13 }}>
                            Definir precio para esta unidad
                          </Text>
                          <Controller
                            control={control}
                            name={`conversions.${index}.has_price_per_uom`}
                            render={({ field: { onChange, value } }) => (
                              <Switch value={value} onValueChange={onChange} />
                            )}
                          />
                        </View>

                        {rowHasPrice && (
                          <>
                            <View style={row}>
                              <View style={half}>
                                <Controller
                                  control={control}
                                  name={`conversions.${index}.price_per_uom_amount`}
                                  render={({
                                    field: { onChange, onBlur, value },
                                  }) => (
                                    <FormControl>
                                      <FormControlLabel>
                                        <FormControlLabelText
                                          style={{ color: "#000" }}
                                        >
                                          Precio por unidad
                                        </FormControlLabelText>
                                      </FormControlLabel>
                                      <Input>
                                        <InputField
                                          style={{ color: "#171717" }}
                                          placeholder="Ej. 8.00"
                                          value={value}
                                          onChangeText={onChange}
                                          onBlur={onBlur}
                                          keyboardType="decimal-pad"
                                        />
                                      </Input>
                                    </FormControl>
                                  )}
                                />
                              </View>
                              <View style={half}>
                                <Controller
                                  control={control}
                                  name={`conversions.${index}.price_per_uom_currency`}
                                  render={({ field: { onChange, value } }) => (
                                    <FormControl>
                                      <FormControlLabel>
                                        <FormControlLabelText
                                          style={{ color: "#000" }}
                                        >
                                          Moneda
                                        </FormControlLabelText>
                                      </FormControlLabel>
                                      <Select
                                        selectedValue={value}
                                        onValueChange={onChange}
                                      >
                                        <SelectTrigger>
                                          <SelectInput
                                            style={{ color: "#000" }}
                                            placeholder="Moneda"
                                            value={value}
                                          />
                                        </SelectTrigger>
                                        <SelectPortal>
                                          <SelectBackdrop />
                                          <SelectContent>
                                            <SelectDragIndicatorWrapper>
                                              <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            {CURRENCIES.map((c) => (
                                              <SelectItem
                                                key={c.value}
                                                label={c.label}
                                                value={c.value}
                                              />
                                            ))}
                                          </SelectContent>
                                        </SelectPortal>
                                      </Select>
                                    </FormControl>
                                  )}
                                />
                              </View>
                            </View>

                            <View style={row}>
                              <View style={half}>
                                <Controller
                                  control={control}
                                  name={`conversions.${index}.price_per_uom_wholesale_min_qty`}
                                  render={({
                                    field: { onChange, onBlur, value },
                                  }) => (
                                    <FormControl>
                                      <FormControlLabel>
                                        <FormControlLabelText
                                          style={{ color: "#000" }}
                                        >
                                          Cant. mínima mayoreo{" "}
                                          <Text
                                            size="xs"
                                            style={{ color: "#999" }}
                                          >
                                            (opcional)
                                          </Text>
                                        </FormControlLabelText>
                                      </FormControlLabel>
                                      <Input>
                                        <InputField
                                          style={{ color: "#171717" }}
                                          placeholder="Ej. 5"
                                          value={value}
                                          onChangeText={onChange}
                                          onBlur={onBlur}
                                          keyboardType="number-pad"
                                        />
                                      </Input>
                                    </FormControl>
                                  )}
                                />
                              </View>
                              <View style={half}>
                                <Controller
                                  control={control}
                                  name={`conversions.${index}.price_per_uom_wholesale_amount`}
                                  render={({
                                    field: { onChange, onBlur, value },
                                  }) => (
                                    <FormControl>
                                      <FormControlLabel>
                                        <FormControlLabelText
                                          style={{ color: "#000" }}
                                        >
                                          Precio mayoreo{" "}
                                          <Text
                                            size="xs"
                                            style={{ color: "#999" }}
                                          >
                                            (opcional)
                                          </Text>
                                        </FormControlLabelText>
                                      </FormControlLabel>
                                      <Input>
                                        <InputField
                                          style={{ color: "#171717" }}
                                          placeholder="Ej. 7.50"
                                          value={value}
                                          onChangeText={onChange}
                                          onBlur={onBlur}
                                          keyboardType="decimal-pad"
                                        />
                                      </Input>
                                    </FormControl>
                                  )}
                                />
                              </View>
                            </View>
                          </>
                        )}

                        <Pressable
                          onPress={() => removeConversion(index)}
                          style={styles.removeRowButtonFull}
                        >
                          <Icon
                            as={Trash2}
                            size="sm"
                            style={{ color: "#7C1D1D" }}
                          />
                          <Text style={{ color: "#7C1D1D", fontSize: 12 }}>
                            Quitar conversión
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}

                  <Divider className="my-2" />
                  <HStack
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.sectionLabel}>
                      PRECIOS POR TIPO DE CLIENTE{" "}
                      <Text size="xs" style={{ color: "#999" }}>
                        (opcional)
                      </Text>
                    </Text>
                    <Pressable
                      onPress={() =>
                        appendCustomerPrice({
                          customer_type_id: "",
                          amount: "",
                          currency: priceCurrency || "GTQ",
                        })
                      }
                      style={styles.addRowButton}
                    >
                      <Icon as={Plus} size="sm" style={{ color: "#0C447C" }} />
                      {/* <Text style={styles.addRowText}>Agregar precio</Text> */}
                    </Pressable>
                  </HStack>

                  {customerPriceFields.map((field, index) => (
                    <View key={field.id} style={styles.dynamicRow}>
                      <HStack style={{ gap: 10 }}>
                        <View style={{ flex: 2 }}>
                          <Controller
                            control={control}
                            name={`customer_type_prices.${index}.customer_type_id`}
                            render={({ field: { onChange, value } }) => {
                              const label =
                                customerTypes?.find(
                                  (c) => String(c.id) === value,
                                )?.name || "";
                              return (
                                <FormControl>
                                  <FormControlLabel>
                                    <FormControlLabelText
                                      style={{ color: "#000" }}
                                    >
                                      Tipo de cliente
                                    </FormControlLabelText>
                                  </FormControlLabel>
                                  <Select
                                    selectedValue={value}
                                    onValueChange={onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectInput
                                        style={{ color: "#000" }}
                                        placeholder="Selecciona tipo"
                                        value={label}
                                      />
                                    </SelectTrigger>
                                    <SelectPortal>
                                      <SelectBackdrop />
                                      <SelectContent>
                                        <SelectDragIndicatorWrapper>
                                          <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        {(customerTypes ?? []).map((c) => (
                                          <SelectItem
                                            key={c.id}
                                            label={c.name}
                                            value={String(c.id)}
                                          />
                                        ))}
                                      </SelectContent>
                                    </SelectPortal>
                                  </Select>
                                </FormControl>
                              );
                            }}
                          />
                        </View>

                        <View style={{ flex: 1.3 }}>
                          <Controller
                            control={control}
                            name={`customer_type_prices.${index}.amount`}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <FormControl>
                                <FormControlLabel>
                                  <FormControlLabelText
                                    style={{ color: "#000" }}
                                  >
                                    Precio
                                  </FormControlLabelText>
                                </FormControlLabel>
                                <Input>
                                  <InputField
                                    style={{ color: "#171717" }}
                                    placeholder="Ej. 177.76"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="decimal-pad"
                                  />
                                </Input>
                              </FormControl>
                            )}
                          />
                        </View>

                        <Pressable
                          onPress={() => removeCustomerPrice(index)}
                          style={[styles.removeRowButton, { marginBottom: 2 }]}
                        >
                          <Icon
                            as={Trash2}
                            size="sm"
                            style={{ color: "#7C1D1D" }}
                          />
                        </Pressable>
                      </HStack>
                    </View>
                  ))}

                  <Divider className="my-2" />
                  <View style={styles.switchRow}>
                    <Text style={{ color: "#000" }}>
                      Aplica regla de mayoreo general
                    </Text>
                    <Controller
                      control={control}
                      name="has_wholesale_rule"
                      render={({ field: { onChange, value } }) => (
                        <Switch value={value} onValueChange={onChange} />
                      )}
                    />
                  </View>

                  {hasWholesaleRule && (
                    <View style={row}>
                      <View style={half}>
                        <Controller
                          control={control}
                          name="wholesale_min_quantity"
                          rules={{
                            required: hasWholesaleRule
                              ? "La cantidad mínima es obligatoria."
                              : false,
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl
                              isInvalid={!!errors.wholesale_min_quantity}
                            >
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Cantidad mínima
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. 10"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  keyboardType="number-pad"
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {errors.wholesale_min_quantity?.message}
                                </FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>

                      <View style={half}>
                        <Controller
                          control={control}
                          name="wholesale_discount_percentage"
                          rules={{
                            required: hasWholesaleRule
                              ? "El descuento es obligatorio."
                              : false,
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl
                              isInvalid={!!errors.wholesale_discount_percentage}
                            >
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Descuento (%)
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. 10"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  keyboardType="decimal-pad"
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {
                                    errors.wholesale_discount_percentage
                                      ?.message
                                  }
                                </FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.switchRow}>
                    <Text style={{ color: "#000" }}>Requiere lote</Text>
                    <Controller
                      control={control}
                      name="requires_batch"
                      render={({ field: { onChange, value } }) => (
                        <Switch value={value} onValueChange={onChange} />
                      )}
                    />
                  </View>

                  <HStack style={{ justifyContent: "flex-end" }}>
                    <Button
                      size="lg"
                      className="mt-4"
                      onPress={() => {
                        clearData();
                        setIsEdit(false);
                        router.back();
                      }}
                    >
                      <ButtonText>Cancelar</ButtonText>
                    </Button>
                    <Button
                      style={{ marginLeft: 10 }}
                      size="lg"
                      className="mt-4"
                      onPress={handleSubmit(onSubmit)}
                      disabled={isPending}
                    >
                      <ButtonText>
                        {isPending ? "Guardando..." : "Guardar"}
                      </ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Center>
          </DesktopScrollView>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

export const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionLabel: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 13,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingRight: 12,
  },
  dynamicRow: {
    gap: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  addRowButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addRowText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0C447C",
  },
  removeRowButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
  },
  removeRowButtonFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
  },
});
