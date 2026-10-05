import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { ServiceIngredientsFieldArray } from "@/components/molecules/ServiceIngredientsFieldArray/ServiceIngredientsFieldArray";
import { ServiceModifiersSelector } from "@/components/molecules/ServiceModifiersSelector/ServiceModifiersSelector";
import { ServiceVariantsFieldArray } from "@/components/molecules/ServiceRecipeFieldArray/ServiceRecipeFieldArray";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCategorie } from "@/src/hooks";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useIngredient } from "@/src/hooks/useIngredient/useIngredient";
import { useMerchandise } from "@/src/hooks/useMerchandise/useMerchandise";
import { usePackaging } from "@/src/hooks/usePackaging/usePackaging";
import { useServiceProduct } from "@/src/hooks/useServiceProduct/useServiceProduct";
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useAuthStore } from "@/src/store";
import { useServiceProductStore } from "@/src/store/useServiceProductStore/useServiceProductStore";
import { Category } from "@/src/types";
import {
  isServiceAvailabilityStatus,
  SERVICE_AVAILABILITY_OPTIONS,
  ServiceModifierOption,
} from "@/src/types/service/service";
import {
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  toServiceProductFormValues,
  toServiceProductPayload,
} from "./service_product.mapper";
import { ServiceProductFormValues } from "./service_product_form";

function isRootCategory(c: Category) {
  return c.parent_id == null || c.parent_id === c.id;
}

function sortCategories(a: Category, b: Category) {
  return (
    (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)
  );
}

export default function ServiceForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useServiceProduct();
  const { data: categorie } = useCategorie();
  const { data: units } = useUnit();
  const { data: ingredients } = useIngredient();
  const { data: packagings } = usePackaging();
  const { data: merchandise } = useMerchandise();
  const data = useServiceProductStore((state) => state.data);
  const isEdit = useServiceProductStore((state) => state.isEdit);
  const clearData = useServiceProductStore((state) => state.clearData);
  const { showToast } = useCustomToast();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceProductFormValues>({
    defaultValues: toServiceProductFormValues(data),
  });

  const selectedRootId = watch("category_root_id");
  const watchedVariants = useWatch({ control, name: "variants" });
  const hasRecipe = useWatch({ control, name: "has_recipe" });

  const categoryList = React.useMemo<Category[]>(
    () =>
      Array.isArray(categorie)
        ? categorie
        : ((categorie as unknown as { data?: Category[] })?.data ?? []),
    [categorie],
  );

  const rootCategoryOptions = React.useMemo(
    () =>
      categoryList
        .filter(isRootCategory)
        .sort(sortCategories)
        .map((c) => ({ label: c.name, value: String(c.id) })),
    [categoryList],
  );

  const subcategoryOptions = React.useMemo(
    () =>
      categoryList
        .filter(
          (c) => !isRootCategory(c) && String(c.parent_id) === selectedRootId,
        )
        .sort(sortCategories)
        .map((c) => ({ label: c.name, value: String(c.id) })),
    [categoryList, selectedRootId],
  );

  const unitOptions = React.useMemo(
    () =>
      (units ?? []).map((u) => ({
        label: `${u.name} (${u.code})`,
        value: String(u.id),
      })),
    [units],
  );

  const supplyOptions = React.useMemo(
    () =>
      (merchandise ?? [])
        .filter((item) => !("recipe" in item) || item.recipe == null)
        .map((item) => ({
          label: item.product.name,
          value: String(item.product.id),
        })),
    [merchandise],
  );

  const supplyUnits = React.useMemo(() => {
    const result: Record<string, string> = {};
    (merchandise ?? []).forEach((item) => {
      const unit = (units ?? []).find(
        (u) => u.id === item.product.unit_of_measure_id,
      );
      if (unit) result[String(item.product.id)] = unit.code;
    });
    return result;
  }, [merchandise, units]);

  const variantOptions = React.useMemo(
    () =>
      (watchedVariants ?? [])
        .map((variant) => variant.name.trim())
        .filter((name) => name.length > 0)
        .map((name) => ({ label: name, value: name })),
    [watchedVariants],
  );

  const modifierOptions = React.useMemo<ServiceModifierOption[]>(() => {
    const ingredientModifiers = (ingredients ?? [])
      .filter((item) => item.is_modifier && item.product_modifier_id !== null)
      .map((item) => ({
        product_modifier_id: Number(item.product_modifier_id),
        name: item.modifier_name || item.name,
        price_adjustment: item.modifier_price_adjustment ?? 0,
      }));
    const packagingModifiers = (packagings ?? [])
      .filter((item) => item.product_modifier_id !== null)
      .map((item) => ({
        product_modifier_id: item.product_modifier_id,
        name: item.modifier_name || item.name,
        price_adjustment: item.modifier_price_adjustment ?? 0,
      }));
    return [...ingredientModifiers, ...packagingModifiers];
  }, [ingredients, packagings]);

  const handleBack = (): void => {
    clearData();
    router.back();
  };

  const onSubmit = async (values: ServiceProductFormValues): Promise<void> => {
    if (!claims) return;

    if (values.has_recipe && values.recipe_ingredients.length === 0) {
      showToast({
        message: "Agrega al menos un insumo a la receta",
        type: "error",
      });
      return;
    }

    const payload = toServiceProductPayload(values, claims.tenant_id);

    if (isEdit && data?.recipe && !values.has_recipe) {
      payload.recipe = { ingredients: [] };
    }

    try {
      if (isEdit && data) {
        await put.mutateAsync({ id: data.product.id, data: payload });
        showToast({
          message: "Servicio editado correctamente",
          type: "success",
        });
      } else {
        await post.mutateAsync(payload);
        showToast({
          message: "Servicio creado correctamente",
          type: "success",
        });
      }
      handleBack();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el servicio", type: "error" });
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
          <DesktopScrollView>
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
                  {isEdit ? "Editar Servicio" : "Nuevo Servicio"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar el servicio"
                    : "Llena los campos para crear un servicio"}
                </Text>

                <VStack space="lg">
                  <Heading size="sm" style={{ color: "#000" }}>
                    Producto
                  </Heading>

                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "El nombre es obligatorio." }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Nombre"
                        placeholder="Ej. Corte de cabello"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorMessage={errors.name?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Descripción (opcional)"
                        placeholder="Ej. Corte con lavado incluido"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="sku"
                    rules={{ required: "El SKU es obligatorio." }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="SKU"
                        placeholder="Ej. SRV-001"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorMessage={errors.sku?.message}
                      />
                    )}
                  />

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

                  <Controller
                    control={control}
                    name="brand"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Marca (opcional)"
                        placeholder="Ej. Casa"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

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
                        onChange={(v) => {
                          onChange(v);
                          setValue("subcategory_id", "");
                        }}
                        errorMessage={errors.category_root_id?.message}
                      />
                    )}
                  />

                  {subcategoryOptions.length > 0 && (
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
                  )}

                  <Controller
                    control={control}
                    name="unit_of_measure_id"
                    rules={{ required: "La unidad de medida es obligatoria." }}
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
                        placeholder="Ej. 15.00"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                        errorMessage={errors.average_cost?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="availability_status"
                    render={({ field: { onChange, value } }) => (
                      <AppSelect
                        label="Disponibilidad"
                        placeholder="Selecciona una opción"
                        searchable={false}
                        options={SERVICE_AVAILABILITY_OPTIONS}
                        value={value}
                        onChange={(selected: string) => {
                          if (isServiceAvailabilityStatus(selected)) {
                            onChange(selected);
                          }
                        }}
                      />
                    )}
                  />

                  <Heading size="sm" style={{ color: "#000" }} className="mt-2">
                    Precio
                  </Heading>

                  <Controller
                    control={control}
                    name="price_amount"
                    rules={{
                      required: "El precio es obligatorio.",
                      validate: validateDecimal,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Precio base"
                        placeholder="Ej. 45.00"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                        errorMessage={errors.price_amount?.message}
                      />
                    )}
                  />

                  <Heading size="sm" style={{ color: "#000" }} className="mt-2">
                    Variantes
                  </Heading>

                  <ServiceVariantsFieldArray control={control} errors={errors} />

                  <Heading size="sm" style={{ color: "#000" }} className="mt-2">
                    Modificadores
                  </Heading>

                  <Controller
                    control={control}
                    name="product_modifier_ids"
                    render={({ field: { onChange, value } }) => (
                      <ServiceModifiersSelector
                        options={modifierOptions}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />

                  <Heading size="sm" style={{ color: "#000" }} className="mt-2">
                    Receta
                  </Heading>

                  <Controller
                    control={control}
                    name="has_recipe"
                    render={({ field: { onChange, value } }) => (
                      <HStack className="justify-between items-center">
                        <Text style={{ color: "#000" }}>¿Tiene receta?</Text>
                        <Switch value={value} onValueChange={onChange} />
                      </HStack>
                    )}
                  />

                  {hasRecipe && (
                    <>
                      <Controller
                        control={control}
                        name="recipe_name"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Nombre de la receta (opcional)"
                            placeholder="Ej. Receta base"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="recipe_version"
                        rules={{
                          validate: (value: string, formValues) =>
                            !formValues.has_recipe ||
                            value.trim().length === 0 ||
                            validateInteger(value),
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Versión (opcional)"
                            placeholder="Ej. 1"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="number-pad"
                            errorMessage={errors.recipe_version?.message}
                          />
                        )}
                      />

                      <ServiceIngredientsFieldArray
                        control={control}
                        errors={errors}
                        supplyOptions={supplyOptions}
                        supplyUnits={supplyUnits}
                        variantOptions={variantOptions}
                      />
                    </>
                  )}

                  <HStack className="mt-4" style={{ justifyContent: "flex-end" }}>
                    <AppButton
                      label="Cancelar"
                      variant="black"
                      outline
                      fullWidth={false}
                      onPress={handleBack}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <AppButton
                        label="Guardar"
                        variant="black"
                        fullWidth={false}
                        isLoading={isPending}
                        onPress={handleSubmit(onSubmit)}
                      />
                    </View>
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
});
