import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import {
  AppSelect,
  AppSelectOption,
} from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { DESKTOP_BREAKPOINT } from "@/const/Dimensions";
import { useCategorie } from "@/src/hooks";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useIngredient } from "@/src/hooks/useIngredient/useIngredient";
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useAuthStore } from "@/src/store";
import { useIngredientStore } from "@/src/store/useIngredientStore/useIngredientStore";
import { Category } from "@/src/types";
import {
  AVAILABILITY_OPTIONS,
  AvailabilityStatus,
  CreateIngredient,
  isAvailabilityStatus,
} from "@/src/types/ingredient/ingredient";
import {
  toNullable,
  toNumber,
  toText,
  validateDecimal,
  validateInteger,
} from "@/src/utils/form/formHelpers";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string;
  category_root_id: string;
  subcategory_id: string;
  unit_of_measure_id: string;
  average_cost: string;
  availability_status: AvailabilityStatus;
  is_modifier: boolean;
  modifier_name: string;
  modifier_quantity: string;
  modifier_min_selection: string;
  modifier_max_selection: string;
  modifier_price_adjustment: string;
  modifier_is_default: boolean;
}

// Validadores que solo aplican cuando el ingrediente es modificador
const validateModifierName = (
  value: string,
  formValues: FormValues,
): true | string =>
  !formValues.is_modifier ||
  value.trim().length > 0 ||
  "El nombre del extra es obligatorio.";

const validateModifierInteger = (
  value: string,
  formValues: FormValues,
): true | string => !formValues.is_modifier || validateInteger(value);

const validateModifierDecimal = (
  value: string,
  formValues: FormValues,
): true | string => !formValues.is_modifier || validateDecimal(value);

const validateModifierMax = (
  value: string,
  formValues: FormValues,
): true | string => {
  if (!formValues.is_modifier) return true;
  const integerResult = validateInteger(value);
  if (integerResult !== true) return integerResult;
  return (
    Number(value) >= Number(formValues.modifier_min_selection) ||
    "Debe ser mayor o igual al mínimo."
  );
};

function isRootCategory(c: Category): boolean {
  return c.parent_id == null || c.parent_id === c.id;
}

function sortCategories(a: Category, b: Category): number {
  return (
    (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)
  );
}

function buildPayload(values: FormValues, tenantId: number): CreateIngredient {
  const base: CreateIngredient = {
    tenant_id: tenantId,
    category_id: Number(values.subcategory_id || values.category_root_id),
    name: values.name.trim(),
    description: toNullable(values.description),
    sku: values.sku.trim(),
    barcode: toNullable(values.barcode),
    brand: toNullable(values.brand),
    type: "ingredient",
    unit_of_measure_id: Number(values.unit_of_measure_id),
    average_cost: toNumber(values.average_cost),
    availability_status: values.availability_status,
    is_modifier: values.is_modifier,
  };

  if (!values.is_modifier) return base;

  return {
    ...base,
    modifier_name: values.modifier_name.trim(),
    modifier_quantity: Number(values.modifier_quantity),
    modifier_min_selection: Number(values.modifier_min_selection),
    modifier_max_selection: Number(values.modifier_max_selection),
    modifier_price_adjustment: toNumber(values.modifier_price_adjustment),
    modifier_is_default: values.modifier_is_default,
  };
}

export default function IngredientForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useIngredient();
  const { data: categorie } = useCategorie();
  const { data: units } = useUnit();
  const data = useIngredientStore((state) => state.data);
  const isEdit = useIngredientStore((state) => state.isEdit);
  const clearData = useIngredientStore((state) => state.clearData);
  const { showToast } = useCustomToast();

  const { width } = useWindowDimensions();
  const isLarge = width >= DESKTOP_BREAKPOINT;
  const row: ViewStyle = isLarge ? { flexDirection: "row", gap: 16 } : {};
  const half: ViewStyle = isLarge ? { flex: 1, minWidth: 0 } : {};

  const isInSubcategory =
    !!data?.parent_category_id && data.parent_category_id !== data.category_id;

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      sku: data?.sku ?? "",
      barcode: data?.barcode ?? "",
      brand: data?.brand ?? "",
      category_root_id: isInSubcategory
        ? toText(data?.parent_category_id)
        : toText(data?.category_id),
      subcategory_id: isInSubcategory ? toText(data?.category_id) : "",
      unit_of_measure_id: toText(data?.unit_of_measure_id),
      average_cost: toText(data?.average_cost ?? 0),
      availability_status: data?.availability_status ?? "available",
      is_modifier: data?.is_modifier ?? false,
      modifier_name: data?.modifier_name ?? "",
      modifier_quantity: toText(data?.modifier_quantity ?? 1),
      modifier_min_selection: toText(data?.modifier_min_selection ?? 0),
      modifier_max_selection: toText(data?.modifier_max_selection ?? 1),
      modifier_price_adjustment: toText(data?.modifier_price_adjustment ?? 0),
      modifier_is_default: data?.modifier_is_default ?? false,
    },
  });

  const selectedRootId = useWatch({ control, name: "category_root_id" });
  const isModifier = useWatch({ control, name: "is_modifier" });
  const ingredientName = useWatch({ control, name: "name" });

  const categoryList = React.useMemo<Category[]>(
    () =>
      Array.isArray(categorie)
        ? categorie
        : ((categorie as unknown as { data?: Category[] })?.data ?? []),
    [categorie],
  );

  const rootCategoryOptions = React.useMemo<AppSelectOption[]>(
    () =>
      categoryList
        .filter(isRootCategory)
        .sort(sortCategories)
        .map((c) => ({ label: c.name, value: String(c.id) })),
    [categoryList],
  );

  const subcategoryOptions = React.useMemo<AppSelectOption[]>(
    () =>
      categoryList
        .filter(
          (c) => !isRootCategory(c) && String(c.parent_id) === selectedRootId,
        )
        .sort(sortCategories)
        .map((c) => ({ label: c.name, value: String(c.id) })),
    [categoryList, selectedRootId],
  );

  const unitOptions = React.useMemo<AppSelectOption[]>(
    () =>
      (units ?? []).map((u) => ({
        label: `${u.name} (${u.code})`,
        value: String(u.id),
      })),
    [units],
  );

  const handleBack = (): void => {
    clearData();
    router.back();
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!claims) return;

    const payload = buildPayload(values, claims.tenant_id);

    try {
      if (isEdit && data) {
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({
          message: "Ingrediente editado correctamente",
          type: "success",
        });
      } else {
        await post.mutateAsync(payload);
        showToast({
          message: "Ingrediente creado correctamente",
          type: "success",
        });
      }
      handleBack();
    } catch (error: unknown) {
      console.log(error);
      showToast({ message: "Error al guardar el ingrediente", type: "error" });
    }
  };

  const isPending = post.isPending || put.isPending;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <DesktopScrollView useWindowHeight>
            <Pressable onPress={handleBack} style={styles.backButton}>
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
                  {isEdit ? "Editar Ingrediente" : "Nuevo Ingrediente"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar el ingrediente"
                    : "Llena los campos para crear un ingrediente"}
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
                          <AppInput
                            label="Nombre"
                            placeholder="Ej. Queso cheddar"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorMessage={errors.name?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="sku"
                        rules={{ required: "El SKU es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="SKU"
                            placeholder="Ej. ING-001"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.toUpperCase())
                            }
                            onBlur={onBlur}
                            autoCapitalize="characters"
                            errorMessage={errors.sku?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Descripción (opcional)"
                        placeholder="Ej. Queso cheddar en lámina"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        textareaHeight={80}
                      />
                    )}
                  />

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="category_root_id"
                        rules={{ required: "La categoría es obligatoria." }}
                        render={({ field: { onChange, value } }) => (
                          <AppSelect
                            label="Categoría"
                            placeholder="Selecciona categoría"
                            searchable={rootCategoryOptions.length > 6}
                            options={rootCategoryOptions}
                            value={value}
                            onChange={(selected: string) => {
                              onChange(selected);
                              setValue("subcategory_id", "");
                            }}
                            errorMessage={errors.category_root_id?.message}
                          />
                        )}
                      />
                    </View>

                    {subcategoryOptions.length > 0 && (
                      <View style={half}>
                        <Controller
                          control={control}
                          name="subcategory_id"
                          render={({ field: { onChange, value } }) => (
                            <AppSelect
                              label="Subcategoría (opcional)"
                              placeholder="Selecciona subcategoría"
                              searchable={subcategoryOptions.length > 6}
                              options={subcategoryOptions}
                              value={value}
                              onChange={onChange}
                            />
                          )}
                        />
                      </View>
                    )}
                  </View>

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="unit_of_measure_id"
                        rules={{
                          required: "La unidad de medida es obligatoria.",
                        }}
                        render={({ field: { onChange, value } }) => (
                          <AppSelect
                            label="Unidad de medida"
                            placeholder="Selecciona unidad"
                            searchable={unitOptions.length > 6}
                            options={unitOptions}
                            value={value}
                            onChange={onChange}
                            errorMessage={errors.unit_of_measure_id?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="availability_status"
                        render={({ field: { onChange, value } }) => (
                          <AppSelect
                            label="Disponibilidad"
                            placeholder="Selecciona una opción"
                            searchable={false}
                            options={AVAILABILITY_OPTIONS}
                            value={value}
                            onChange={(selected: string) => {
                              if (isAvailabilityStatus(selected)) {
                                onChange(selected);
                              }
                            }}
                          />
                        )}
                      />
                    </View>
                  </View>

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="barcode"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Código de barras (opcional)"
                            placeholder="Ej. 7401234567890"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="brand"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Marca (opcional)"
                            placeholder="Ej. Queso Quezal"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </View>
                  </View>

                  <Divider className="my-2" />
                  <Text style={styles.sectionLabel}>COSTO</Text>

                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="average_cost"
                        rules={{
                          required: "El costo es obligatorio.",
                          validate: validateDecimal,
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Costo promedio"
                            placeholder="Ej. 0.50"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="decimal-pad"
                            errorMessage={errors.average_cost?.message}
                          />
                        )}
                      />
                    </View>
                    {isLarge && <View style={half} />}
                  </View>

                  {/* ---------- Modificador ---------- */}
                  <Divider className="my-2" />
                  <Text style={styles.sectionLabel}>VENTA COMO EXTRA</Text>

                  <Controller
                    control={control}
                    name="is_modifier"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.switchRow}>
                        <VStack style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={{ color: "#000" }}>
                            También se vende como extra (modificador)
                          </Text>
                          <Text size="xs" className="text-typography-400">
                            Ej. &quot;Extra queso&quot;: el cliente lo puede
                            agregar a una receta y se descuenta del inventario
                          </Text>
                        </VStack>
                        <Switch
                          value={value}
                          onValueChange={(next: boolean) => {
                            onChange(next);
                            if (next && !getValues("modifier_name").trim()) {
                              setValue(
                                "modifier_name",
                                ingredientName.trim()
                                  ? `Extra ${ingredientName.trim()}`
                                  : "",
                              );
                            }
                          }}
                        />
                      </View>
                    )}
                  />

                  {isModifier && (
                    <View style={styles.modifierBox}>
                      <View style={row}>
                        <View style={half}>
                          <Controller
                            control={control}
                            name="modifier_name"
                            rules={{ validate: validateModifierName }}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <AppInput
                                label="Nombre del extra"
                                placeholder="Ej. Extra queso"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                errorMessage={errors.modifier_name?.message}
                              />
                            )}
                          />
                        </View>
                        <View style={half}>
                          <Controller
                            control={control}
                            name="modifier_price_adjustment"
                            rules={{ validate: validateModifierDecimal }}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <AppInput
                                label="Precio extra"
                                placeholder="Ej. 5.00"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="decimal-pad"
                                errorMessage={
                                  errors.modifier_price_adjustment?.message
                                }
                              />
                            )}
                          />
                        </View>
                      </View>

                      <View style={row}>
                        <View style={half}>
                          <Controller
                            control={control}
                            name="modifier_quantity"
                            rules={{ validate: validateModifierInteger }}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <AppInput
                                label="Cantidad que se descuenta"
                                placeholder="Ej. 1"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="number-pad"
                                errorMessage={errors.modifier_quantity?.message}
                              />
                            )}
                          />
                        </View>
                        <View style={half}>
                          <View style={styles.pairRow}>
                            <View style={styles.pairItem}>
                              <Controller
                                control={control}
                                name="modifier_min_selection"
                                rules={{ validate: validateModifierInteger }}
                                render={({
                                  field: { onChange, onBlur, value },
                                }) => (
                                  <AppInput
                                    label="Mínimo"
                                    placeholder="Ej. 0"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="number-pad"
                                    errorMessage={
                                      errors.modifier_min_selection?.message
                                    }
                                  />
                                )}
                              />
                            </View>
                            <View style={styles.pairItem}>
                              <Controller
                                control={control}
                                name="modifier_max_selection"
                                rules={{ validate: validateModifierMax }}
                                render={({
                                  field: { onChange, onBlur, value },
                                }) => (
                                  <AppInput
                                    label="Máximo"
                                    placeholder="Ej. 3"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    keyboardType="number-pad"
                                    errorMessage={
                                      errors.modifier_max_selection?.message
                                    }
                                  />
                                )}
                              />
                            </View>
                          </View>
                        </View>
                      </View>

                      <Text size="xs" className="text-typography-400">
                        Mínimo y máximo: cuántas veces puede elegirlo el cliente
                        por pedido. Con mínimo 1 el extra es obligatorio.
                      </Text>

                      <Controller
                        control={control}
                        name="modifier_is_default"
                        render={({ field: { onChange, value } }) => (
                          <View style={styles.switchRow}>
                            <VStack style={{ flex: 1, paddingRight: 12 }}>
                              <Text style={{ color: "#000" }}>
                                Seleccionado por defecto
                              </Text>
                              <Text size="xs" className="text-typography-400">
                                Aparece marcado al agregar la receta al carrito
                              </Text>
                            </VStack>
                            <Switch value={value} onValueChange={onChange} />
                          </View>
                        )}
                      />
                    </View>
                  )}

                  <View
                    style={[styles.actions, isLarge && styles.actionsLarge]}
                  >
                    <View
                      style={isLarge ? styles.actionBtnLarge : styles.actionBtn}
                    >
                      <AppButton
                        label="Cancelar"
                        variant="black"
                        outline
                        onPress={handleBack}
                      />
                    </View>
                    <View
                      style={isLarge ? styles.actionBtnLarge : styles.actionBtn}
                    >
                      <AppButton
                        label="Guardar"
                        variant="black"
                        isLoading={isPending}
                        onPress={handleSubmit(onSubmit)}
                      />
                    </View>
                  </View>
                </VStack>
              </Box>
            </Center>
          </DesktopScrollView>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
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
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
  },
  // Mínimo y máximo son cortos: siempre van lado a lado, también en teléfono.
  pairRow: {
    flexDirection: "row",
    gap: 12,
  },
  pairItem: {
    flex: 1,
    minWidth: 0,
  },
  modifierBox: {
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionsLarge: {
    justifyContent: "flex-end",
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnLarge: {
    minWidth: 140,
  },
});
