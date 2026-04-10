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
import { AddIcon, AlertCircleIcon, ArrowLeftIcon, Icon, TrashIcon } from "@/components/ui/icon";
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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCategorie } from "@/src/hooks";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useMenuItem } from "@/src/hooks/useMenuItem/useMenuItem";
import { useAuthStore } from "@/src/store";
import { useMenuItemStore } from "@/src/store/useMenuItemStore/useMenuItemStore";
import { MenuItemDetail } from "@/src/types/menuItem/menuItem.types";
import { MenuIngredient } from "@/src/types/product/product.types";
import { useRouter } from "expo-router";
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface IngredientForm {
  ingredient_id: string;
  quantity: string;
  unit: string;
  waste_factor: string;
}

interface VariantForm {
  name: string;
  price_adjustment: string;
  adjustment_type: string;
}

interface FormValues {
  category_id: string;
  name: string;
  sku: string;
  unit_of_measure: string;
  availability_status: string;
  price: string;
  currency: string;
  recipe_version: string;
  ingredients: IngredientForm[];
  variants: VariantForm[];
  modifiers: { product_modifier_id: string }[];
}

const EMPTY_INGREDIENT: IngredientForm = {
  ingredient_id: "",
  quantity: "",
  unit: "unit",
  waste_factor: "0",
};

const EMPTY_VARIANT: VariantForm = {
  name: "",
  price_adjustment: "",
  adjustment_type: "fixed",
};

const EMPTY_MODIFIER = { product_modifier_id: "" };

// ── IngredientRow ─────────────────────────────────────────────────────────────
function IngredientRow({
  index,
  control,
  errors,
  remove,
  ingredientOptions,
  isLarge,
}: {
  index: number;
  control: any;
  errors: any;
  remove: (i: number) => void;
  ingredientOptions: any[];
  isLarge: boolean;
}) {
  const row = isLarge ? { flexDirection: "row" as const, gap: 12 } : {};
  const third = isLarge ? { flex: 1, minWidth: 0 } : {};

  return (
    <Box style={styles.subCard}>
      <HStack style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", color: "#333", fontSize: 13 }}>
          Ingrediente #{index + 1}
        </Text>
        <Pressable onPress={() => remove(index)} style={styles.removeBtn}>
          <Icon as={TrashIcon} size="sm" style={{ color: "#ef4444" }} />
          <Text style={{ color: "#ef4444", fontSize: 12, marginLeft: 4 }}>Eliminar</Text>
        </Pressable>
      </HStack>

      <VStack space="sm">
        {/* Ingrediente */}
        <Controller
          control={control}
          name={`ingredients.${index}.ingredient_id`}
          rules={{ required: "Selecciona un ingrediente." }}
          render={({ field: { onChange, value } }) => {
            const selectedLabel =
              ingredientOptions?.find((p) => String(p.id) === value)?.name || "";
            return (
              <FormControl isInvalid={!!errors?.ingredients?.[index]?.ingredient_id}>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: "#000" }}>Ingrediente</FormControlLabelText>
                </FormControlLabel>
                <Select selectedValue={value} onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectInput
                      style={{ color: "#000" }}
                      placeholder="Selecciona ingrediente"
                      value={selectedLabel}
                    />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {ingredientOptions.map((p) => (
                        <SelectItem key={p.id} label={p.name} value={String(p.id)} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {errors?.ingredients?.[index]?.ingredient_id?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            );
          }}
        />

        {/* Cantidad + Unidad + Merma */}
        <View style={row}>
          <View style={third}>
            <Controller
              control={control}
              name={`ingredients.${index}.quantity`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors?.ingredients?.[index]?.quantity}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>Cantidad</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      style={{ color: "#171717" }}
                      placeholder="Ej. 1"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors?.ingredients?.[index]?.quantity?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>

          <View style={third}>
            <Controller
              control={control}
              name={`ingredients.${index}.unit`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors?.ingredients?.[index]?.unit}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>Unidad</FormControlLabelText>
                  </FormControlLabel>
                  <Select selectedValue={value} onValueChange={onChange}>
                    <SelectTrigger>
                      <SelectInput style={{ color: "#000" }} placeholder="Unidad" value={value} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                        <SelectItem label="Unidad" value="unit" />
                        <SelectItem label="Kg" value="kg" />
                        <SelectItem label="g" value="g" />
                        <SelectItem label="L" value="l" />
                        <SelectItem label="ml" value="ml" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors?.ingredients?.[index]?.unit?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>

          <View style={third}>
            <Controller
              control={control}
              name={`ingredients.${index}.waste_factor`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors?.ingredients?.[index]?.waste_factor}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>Merma</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      style={{ color: "#171717" }}
                      placeholder="Ej. 0"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors?.ingredients?.[index]?.waste_factor?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>
        </View>
      </VStack>
    </Box>
  );
}

// ── VariantRow ────────────────────────────────────────────────────────────────
function VariantRow({
  index,
  control,
  errors,
  remove,
  isLarge,
}: {
  index: number;
  control: any;
  errors: any;
  remove: (i: number) => void;
  isLarge: boolean;
}) {
  const row = isLarge ? { flexDirection: "row" as const, gap: 12 } : {};
  const third = isLarge ? { flex: 1, minWidth: 0 } : {};

  return (
    <Box style={styles.subCard}>
      <HStack style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold", color: "#333", fontSize: 13 }}>
          Variante #{index + 1}
        </Text>
        <Pressable onPress={() => remove(index)} style={styles.removeBtn}>
          <Icon as={TrashIcon} size="sm" style={{ color: "#ef4444" }} />
          <Text style={{ color: "#ef4444", fontSize: 12, marginLeft: 4 }}>Eliminar</Text>
        </Pressable>
      </HStack>

      <VStack space="sm">
        <View style={row}>
          {/* Nombre */}
          <View style={third}>
            <Controller
              control={control}
              name={`variants.${index}.name`}
              rules={{ required: "El nombre es obligatorio." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors?.variants?.[index]?.name}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>Nombre</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      style={{ color: "#171717" }}
                      placeholder="Ej. Grande"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors?.variants?.[index]?.name?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>

          {/* Ajuste de precio */}
          <View style={third}>
            <Controller
              control={control}
              name={`variants.${index}.price_adjustment`}
              rules={{ required: "El ajuste es obligatorio." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors?.variants?.[index]?.price_adjustment}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>Ajuste de precio</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      style={{ color: "#171717" }}
                      placeholder="Ej. 5"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors?.variants?.[index]?.price_adjustment?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>

          {/* Tipo de ajuste */}
          <View style={third}>
            <Controller
              control={control}
              name={`variants.${index}.adjustment_type`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors?.variants?.[index]?.adjustment_type}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>Tipo</FormControlLabelText>
                  </FormControlLabel>
                  <Select selectedValue={value} onValueChange={onChange}>
                    <SelectTrigger>
                      <SelectInput style={{ color: "#000" }} placeholder="Tipo" value={value} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                        <SelectItem label="Fijo" value="fixed" />
                        <SelectItem label="Porcentaje" value="percentage" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors?.variants?.[index]?.adjustment_type?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>
        </View>
      </VStack>
    </Box>
  );
}

// ── ModifierRow ───────────────────────────────────────────────────────────────
function ModifierRow({
  index,
  control,
  errors,
  remove,
  modifierOptions,
}: {
  index: number;
  control: any;
  errors: any;
  remove: (i: number) => void;
  modifierOptions: MenuIngredient[];
}) {
  return (
    <HStack style={{ alignItems: "center", gap: 8 }}>
      <View style={{ flex: 1 }}>
        <Controller
          control={control}
          name={`modifiers.${index}.product_modifier_id`}
          rules={{ required: "Selecciona un modificador." }}
          render={({ field: { onChange, value } }) => {
              const selectedLabel =
              modifierOptions?.find((m) => String(m.id) === value)?.modifier_name ||
              modifierOptions?.find((m) => String(m.id) === value)?.name || "";            return (
              <FormControl isInvalid={!!errors?.modifiers?.[index]?.product_modifier_id}>
                <Select selectedValue={value} onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectInput
                      style={{ color: "#000" }}
                      placeholder="Selecciona modificador"
                      value={selectedLabel}
                    />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                      {modifierOptions.map((m) => (
                        <SelectItem
                          key={m.id}
                          label={m.modifier_name || ""}
                          value={String(m.product_modifier_id)}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {errors?.modifiers?.[index]?.product_modifier_id?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            );
          }}
        />
      </View>
      <Pressable onPress={() => remove(index)} style={[styles.removeBtn, { marginTop: 4 }]}>
        <Icon as={TrashIcon} size="sm" style={{ color: "#ef4444" }} />
      </Pressable>
    </HStack>
  );
}

// ── Formulario principal ──────────────────────────────────────────────────────
export default function MenuItemForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put, dataIngredient: productData } = useMenuItem();
  const { data: categorie } = useCategorie();
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const data = useMenuItemStore((state) => state.data);
  const isEdit = useMenuItemStore((state) => state.isEdit);
  const clearData = useMenuItemStore((state) => state.clearData);
  const setIsEdit = useMenuItemStore((state) => state.setIsEdit);

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const ingredientOptions = productData ?? [];
  const modifierOptions = (productData ?? []).filter((p: any) => p.is_modifier === true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      category_id: data?.product?.category_id ? String(data.product.category_id) : "",
      name: data?.product?.name || "",
      sku: data?.product?.sku || "",
      unit_of_measure: data?.product?.unit_of_measure || "unit",
      availability_status: data?.product?.availability_status || "available",
      price: data?.price?.amount ? String(data.price.amount) : "",
      currency: data?.price?.currency || "GTQ",
      recipe_version: data?.recipe?.version ? String(data.recipe.version) : "1",
      ingredients: data?.recipe?.ingredients?.map((ing) => ({
        ingredient_id: String(ing.ingredient_id),
        quantity: String(ing.quantity),
        unit: ing.unit,
        waste_factor: String(ing.waste_factor),
      })) ?? [EMPTY_INGREDIENT],
      variants: data?.variants?.map((v) => ({
        name: v.name,
        price_adjustment: String(v.price_adjustment),
        adjustment_type: v.adjustment_type,
      })) ?? [],
      modifiers: data?.modifiers?.map((id) => ({
        product_modifier_id: String(id.modifier_product_id),
      })) ?? [],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  const {
    fields: modifierFields,
    append: appendModifier,
    remove: removeModifier,
  } = useFieldArray({ control, name: "modifiers" });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload: MenuItemDetail = {
      product: {
        tenant_id: claims.tenant_id,
        category_id: parseInt(values.category_id),
        name: values.name.trim(),
        sku: values.sku.trim(),
        type: "menu_item",
        unit_of_measure: values.unit_of_measure,
        availability_status: values.availability_status,
        price: parseFloat(values.price),
        currency: values.currency,
      },
      recipe: {
        version: parseInt(values.recipe_version),
        ingredients: values.ingredients.map((ing) => ({
          ingredient_id: parseInt(ing.ingredient_id),
          quantity: parseFloat(ing.quantity),
          unit: ing.unit,
          waste_factor: parseFloat(ing.waste_factor),
        })),
      },
      variants: values.variants.map((v) => ({
        name: v.name.trim(),
        price_adjustment: parseFloat(v.price_adjustment),
        adjustment_type: v.adjustment_type,
      })),
      modifiers: values.modifiers.map((m) => parseInt(m.product_modifier_id)),
    };

    try {
      if (!isEdit) {
        await post.mutateAsync(payload);
        showToast({ message: "Ítem creado correctamente", type: "success" });
      } else {
        if (!data?.product?.id) return;
        await put.mutateAsync({ id: data.product.id, data: payload });
        showToast({ message: "Ítem editado correctamente", type: "success" });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el ítem", type: "error" });
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
          <Pressable
            onPress={() => { clearData(); setIsEdit(false); router.back(); }}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
          >
            <Icon as={ArrowLeftIcon} size="xl" style={{ color: "#000" }} />
            <Text style={{ color: "#000", marginLeft: 8, fontSize: 16 }}>Regresar</Text>
          </Pressable>

          <Center>
            <Box style={styles.card}>
              <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                {isEdit ? "Editar Ítem de Menú" : "Nuevo Ítem de Menú"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica los campos para editar el ítem"
                  : "Llena los campos para crear un ítem del menú"}
              </Text>

              <VStack space="lg">
                <Text style={styles.sectionLabel}>DATOS DEL PRODUCTO</Text>

                {/* Nombre + Categoría */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="name"
                      rules={{ required: "El nombre es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.name}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Nombre</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. Capuchino"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.name?.message}</FormControlErrorText>
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
                          categorie?.find((c) => String(c.id) === value)?.name || "";
                        return (
                          <FormControl isInvalid={!!errors.category_id}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>Categoría</FormControlLabelText>
                            </FormControlLabel>
                            <Select selectedValue={value} onValueChange={onChange}>
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
                                  <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                  {(categorie ?? []).map((c) => (
                                    <SelectItem key={c.id} label={c.name} value={String(c.id)} />
                                  ))}
                                </SelectContent>
                              </SelectPortal>
                            </Select>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>{errors.category_id?.message}</FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        );
                      }}
                    />
                  </View>
                </View>

                {/* SKU + Precio */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="sku"
                      rules={{ required: "El SKU es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.sku}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>SKU</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. MENU-CAP-001"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCapitalize="characters"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.sku?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>

                  <View style={half}>
                    <Controller
                      control={control}
                      name="price"
                      rules={{ required: "El precio es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.price}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Precio</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. 25"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="decimal-pad"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.price?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* Unidad + Estado */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="unit_of_measure"
                      rules={{ required: "La unidad es obligatoria." }}
                      render={({ field: { onChange, value } }) => (
                        <FormControl isInvalid={!!errors.unit_of_measure}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Unidad de medida</FormControlLabelText>
                          </FormControlLabel>
                          <Select selectedValue={value} onValueChange={onChange}>
                            <SelectTrigger>
                              <SelectInput style={{ color: "#000" }} placeholder="Unidad" value={value} />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                <SelectItem label="Unidad" value="unit" />
                                <SelectItem label="Porción" value="portion" />
                              </SelectContent>
                            </SelectPortal>
                          </Select>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.unit_of_measure?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>

                  <View style={half}>
                    <Controller
                      control={control}
                      name="availability_status"
                      rules={{ required: "El estado es obligatorio." }}
                      render={({ field: { onChange, value } }) => (
                        <FormControl isInvalid={!!errors.availability_status}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Estado</FormControlLabelText>
                          </FormControlLabel>
                          <Select selectedValue={value} onValueChange={onChange}>
                            <SelectTrigger>
                              <SelectInput style={{ color: "#000" }} placeholder="Estado" value={value} />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                <SelectItem label="Disponible" value="available" />
                                <SelectItem label="No disponible" value="unavailable" />
                              </SelectContent>
                            </SelectPortal>
                          </Select>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.availability_status?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                <Divider className="my-2" />

                {/* ── INGREDIENTES ── */}
                <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.sectionLabel}>INGREDIENTES ({ingredientFields.length})</Text>
                  <Button size="sm" onPress={() => appendIngredient(EMPTY_INGREDIENT)}>
                    <Icon as={AddIcon} size="sm" style={{ color: "#000", marginRight: 4 }} />
                    <ButtonText>Agregar</ButtonText>
                  </Button>
                </HStack>

                {ingredientFields.length === 0 && (
                  <Box style={styles.emptyBox}>
                    <Text style={{ color: "#999", textAlign: "center" }}>
                      Sin ingredientes. Presiona Agregar para añadir uno.
                    </Text>
                  </Box>
                )}

                <VStack space="sm">
                  {ingredientFields.map((field, index) => (
                    <IngredientRow
                      key={field.id}
                      index={index}
                      control={control}
                      errors={errors}
                      remove={removeIngredient}
                      ingredientOptions={ingredientOptions}
                      isLarge={isLarge}
                    />
                  ))}
                </VStack>

                <Divider className="my-2" />

                {/* ── VARIANTES ── */}
                <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.sectionLabel}>VARIANTES ({variantFields.length})</Text>
                  <Button size="sm" onPress={() => appendVariant(EMPTY_VARIANT)}>
                    <Icon as={AddIcon} size="sm" style={{ color: "#000", marginRight: 4 }} />
                    <ButtonText>Agregar</ButtonText>
                  </Button>
                </HStack>

                {variantFields.length === 0 && (
                  <Box style={styles.emptyBox}>
                    <Text style={{ color: "#999", textAlign: "center" }}>
                      Sin variantes. Presiona Agregar para añadir una.
                    </Text>
                  </Box>
                )}

                <VStack space="sm">
                  {variantFields.map((field, index) => (
                    <VariantRow
                      key={field.id}
                      index={index}
                      control={control}
                      errors={errors}
                      remove={removeVariant}
                      isLarge={isLarge}
                    />
                  ))}
                </VStack>

                <Divider className="my-2" />

                {/* ── MODIFICADORES ── */}
                <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.sectionLabel}>MODIFICADORES ({modifierFields.length})</Text>
                  <Button size="sm" onPress={() => appendModifier(EMPTY_MODIFIER)}>
                    <Icon as={AddIcon} size="sm" style={{ color: "#000", marginRight: 4 }} />
                    <ButtonText>Agregar</ButtonText>
                  </Button>
                </HStack>

                {modifierFields.length === 0 && (
                  <Box style={styles.emptyBox}>
                    <Text style={{ color: "#999", textAlign: "center" }}>
                      Sin modificadores. Presiona Agregar para añadir uno.
                    </Text>
                  </Box>
                )}

                <VStack space="sm">
                  {modifierFields.map((field, index) => (
                    <ModifierRow
                      key={field.id}
                      index={index}
                      control={control}
                      errors={errors}
                      remove={removeModifier}
                      modifierOptions={modifierOptions}
                    />
                  ))}
                </VStack>

                {/* Botones */}
                <HStack style={{ justifyContent: "flex-end" }}>
                  <Button
                    size="lg"
                    className="mt-4"
                    onPress={() => { clearData(); setIsEdit(false); router.back(); }}
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
                    <ButtonText>{isPending ? "Guardando..." : "Guardar"}</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Center>
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
  subCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fafafa",
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
  },
});