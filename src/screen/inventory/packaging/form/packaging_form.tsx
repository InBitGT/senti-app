import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
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
import { usePackaging } from "@/src/hooks/usePackaging/usePackaging";
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useAuthStore } from "@/src/store";
import { usePackagingStore } from "@/src/store/usePackagingStore/usePackagingStore";
import { Category } from "@/src/types";
import {
    AVAILABILITY_OPTIONS,
    AvailabilityStatus,
    CreatePackaging,
    isAvailabilityStatus,
} from "@/src/types/packaging/packaging";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
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
  modifier_name: string;
  modifier_quantity: string;
  modifier_min_selection: string;
  modifier_max_selection: string;
  modifier_price_adjustment: string;
  modifier_is_default: boolean;
}

const INTEGER_REGEX = /^\d+$/;
const DECIMAL_REGEX = /^-?\d+([.,]\d+)?$/;

const toText = (value: number | null | undefined): string =>
  value === null || value === undefined ? "" : String(value);

const toNumber = (value: string): number => Number(value.replace(",", "."));

const toNullable = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const validateInteger = (value: string): true | string =>
  INTEGER_REGEX.test(value.trim()) || "Ingresa un número entero válido.";

const validateDecimal = (value: string): true | string =>
  DECIMAL_REGEX.test(value.trim()) || "Ingresa un número válido.";

function isRootCategory(c: Category) {
  return c.parent_id == null || c.parent_id === c.id;
}

function sortCategories(a: Category, b: Category) {
  return (
    (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name)
  );
}

export default function PackagingForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = usePackaging();
  const { data: categorie } = useCategorie();
  const { data: units } = useUnit();
  const data = usePackagingStore((state) => state.data);
  const isEdit = usePackagingStore((state) => state.isEdit);
  const clearData = usePackagingStore((state) => state.clearData);
  const { showToast } = useCustomToast();

  const isInSubcategory =
    !!data?.parent_category_id &&
    data.parent_category_id !== data.category_id;

  const {
    control,
    handleSubmit,
    watch,
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
      modifier_name: data?.modifier_name ?? "",
      modifier_quantity: toText(data?.modifier_quantity ?? 1),
      modifier_min_selection: toText(data?.modifier_min_selection ?? 0),
      modifier_max_selection: toText(data?.modifier_max_selection ?? 1),
      modifier_price_adjustment: toText(data?.modifier_price_adjustment ?? 0),
      modifier_is_default: data?.modifier_is_default ?? false,
    },
  });

  const selectedRootId = watch("category_root_id");

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

  const handleBack = (): void => {
    clearData();
    router.back();
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!claims) return;

    const payload: CreatePackaging = {
      tenant_id: claims.tenant_id,
      category_id: Number(values.subcategory_id || values.category_root_id),
      name: values.name.trim(),
      description: toNullable(values.description),
      sku: values.sku.trim(),
      barcode: toNullable(values.barcode),
      brand: toNullable(values.brand),
      type: "packaging",
      unit_of_measure_id: Number(values.unit_of_measure_id),
      average_cost: toNumber(values.average_cost),
      availability_status: values.availability_status,
      is_modifier: true,
      modifier_name: values.modifier_name.trim(),
      modifier_quantity: Number(values.modifier_quantity),
      modifier_min_selection: Number(values.modifier_min_selection),
      modifier_max_selection: Number(values.modifier_max_selection),
      modifier_price_adjustment: toNumber(values.modifier_price_adjustment),
      modifier_is_default: values.modifier_is_default,
      modifier_type: "packing",
    };

    try {
      if (isEdit && data) {
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({
          message: "Empaque editado correctamente",
          type: "success",
        });
      } else {
        await post.mutateAsync(payload);
        showToast({ message: "Empaque creado correctamente", type: "success" });
      }
      handleBack();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el empaque", type: "error" });
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
                  {isEdit ? "Editar Empaque" : "Nuevo Empaque"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar el empaque"
                    : "Llena los campos para crear un empaque"}
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
                        placeholder="Ej. Bolsa plástica"
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
                        placeholder="Ej. Bolsa plástica principal"
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
                        placeholder="Ej. BOLSA-001"
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
                        placeholder="Ej. Bolsas del Montón"
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
                        placeholder="Ej. 0.10"
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

                  <Heading size="sm" style={{ color: "#000" }} className="mt-2">
                    Modificador
                  </Heading>

                  <Controller
                    control={control}
                    name="modifier_name"
                    rules={{
                      required: "El nombre del modificador es obligatorio.",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Nombre del modificador"
                        placeholder="Ej. Bolsa"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorMessage={errors.modifier_name?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="modifier_quantity"
                    rules={{
                      required: "La cantidad es obligatoria.",
                      validate: validateInteger,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Cantidad"
                        placeholder="Ej. 1"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        errorMessage={errors.modifier_quantity?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="modifier_min_selection"
                    rules={{
                      required: "La selección mínima es obligatoria.",
                      validate: validateInteger,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Selección mínima"
                        placeholder="Ej. 0"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        errorMessage={errors.modifier_min_selection?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="modifier_max_selection"
                    rules={{
                      required: "La selección máxima es obligatoria.",
                      validate: (value: string, formValues: FormValues) => {
                        const integerResult = validateInteger(value);
                        if (integerResult !== true) return integerResult;
                        return (
                          Number(value) >=
                            Number(formValues.modifier_min_selection) ||
                          "Debe ser mayor o igual a la selección mínima."
                        );
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Selección máxima"
                        placeholder="Ej. 1"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        errorMessage={errors.modifier_max_selection?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="modifier_price_adjustment"
                    rules={{
                      required: "El ajuste de precio es obligatorio.",
                      validate: validateDecimal,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Ajuste de precio"
                        placeholder="Ej. 1.50"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                        errorMessage={errors.modifier_price_adjustment?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="modifier_is_default"
                    render={({ field: { onChange, value } }) => (
                      <HStack className="justify-between items-center">
                        <Text style={{ color: "#000" }}>
                          Seleccionado por defecto
                        </Text>
                        <Switch value={value} onValueChange={onChange} />
                      </HStack>
                    )}
                  />

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
