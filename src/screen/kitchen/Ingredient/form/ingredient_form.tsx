import { AppInput } from "@/components/atom/AppInput/AppInput";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ChevronDownIcon, Icon } from "@/components/ui/icon";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useIngredient } from "@/src/hooks/useIngredient/useIngredient";
import { useAuthStore } from "@/src/store";
import { useIngredientStore } from "@/src/store/useIngredientStore/useIngredientStore";
import {
    AVAILABILITY_OPTIONS,
    AvailabilityStatus,
    CreateIngredient,
    CreateIngredientBase,
    getAvailabilityLabel,
    isAvailabilityStatus,
} from "@/src/types/ingredient/ingredient";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string;
  category_id: string;
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

// Validadores que solo aplican cuando el ingrediente es modificador
const validateModifierInteger = (
  value: string,
  formValues: FormValues,
): true | string => !formValues.is_modifier || validateInteger(value);

const validateModifierDecimal = (
  value: string,
  formValues: FormValues,
): true | string => !formValues.is_modifier || validateDecimal(value);

const validateModifierName = (
  value: string,
  formValues: FormValues,
): true | string =>
  !formValues.is_modifier ||
  value.trim().length > 0 ||
  "El nombre del modificador es obligatorio.";

const validateModifierMax = (
  value: string,
  formValues: FormValues,
): true | string => {
  if (!formValues.is_modifier) return true;
  const integerResult = validateInteger(value);
  if (integerResult !== true) return integerResult;
  return (
    Number(value) >= Number(formValues.modifier_min_selection) ||
    "Debe ser mayor o igual a la selección mínima."
  );
};

export default function IngredientForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useIngredient();
  const data = useIngredientStore((state) => state.data);
  const isEdit = useIngredientStore((state) => state.isEdit);
  const clearData = useIngredientStore((state) => state.clearData);
  const { showToast } = useCustomToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      sku: data?.sku ?? "",
      barcode: data?.barcode ?? "",
      brand: data?.brand ?? "",
      category_id: toText(data?.category_id),
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

  const isModifier = useWatch({ control, name: "is_modifier" });

  const handleBack = (): void => {
    clearData();
    router.back();
  };

  const buildPayload = (
    values: FormValues,
    tenantId: number,
  ): CreateIngredient => {
    const base: CreateIngredientBase = {
      tenant_id: tenantId,
      category_id: Number(values.category_id),
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

    if (!values.is_modifier) {
      return base;
    }

    return {
      ...base,
      modifier_name: values.modifier_name.trim(),
      modifier_quantity: Number(values.modifier_quantity),
      modifier_min_selection: Number(values.modifier_min_selection),
      modifier_max_selection: Number(values.modifier_max_selection),
      modifier_price_adjustment: toNumber(values.modifier_price_adjustment),
      modifier_is_default: values.modifier_is_default,
    };
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
    } catch (error) {
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
                  {isEdit ? "Editar Ingrediente" : "Nuevo Ingrediente"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar el ingrediente"
                    : "Llena los campos para crear un ingrediente"}
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
                        placeholder="Ej. Extra queso"
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
                        placeholder="Ej. Queso cheddar en lámina"
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
                        placeholder="Ej. MOD-001"
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
                        placeholder="Ej. Queso Quezal"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="category_id"
                    rules={{
                      required: "La categoría es obligatoria.",
                      validate: validateInteger,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="ID de categoría"
                        placeholder="Ej. 58"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        errorMessage={errors.category_id?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="unit_of_measure_id"
                    rules={{
                      required: "La unidad de medida es obligatoria.",
                      validate: validateInteger,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="ID de unidad de medida"
                        placeholder="Ej. 21"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
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
                        placeholder="Ej. 0.50"
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
                      <VStack space="xs">
                        <Text size="sm" style={{ color: "#000" }}>
                          Disponibilidad
                        </Text>
                        <Select
                          selectedValue={value}
                          initialLabel={getAvailabilityLabel(value)}
                          onValueChange={(selected: string) => {
                            if (isAvailabilityStatus(selected)) {
                              onChange(selected);
                            }
                          }}
                        >
                          <SelectTrigger variant="outline" size="md">
                            <SelectInput placeholder="Selecciona una opción" />
                            <SelectIcon className="mr-3" as={ChevronDownIcon} />
                          </SelectTrigger>
                          <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                              <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                              </SelectDragIndicatorWrapper>
                              {AVAILABILITY_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  label={option.label}
                                  value={option.value}
                                />
                              ))}
                            </SelectContent>
                          </SelectPortal>
                        </Select>
                      </VStack>
                    )}
                  />

                  <Controller
                    control={control}
                    name="is_modifier"
                    render={({ field: { onChange, value } }) => (
                      <HStack className="justify-between items-center">
                        <Text style={{ color: "#000" }}>
                          ¿Se usa como modificador?
                        </Text>
                        <Switch value={value} onValueChange={onChange} />
                      </HStack>
                    )}
                  />

                  {isModifier && (
                    <>
                      <Heading
                        size="sm"
                        style={{ color: "#000" }}
                        className="mt-2"
                      >
                        Modificador
                      </Heading>

                      <Controller
                        control={control}
                        name="modifier_name"
                        rules={{ validate: validateModifierName }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Nombre del modificador"
                            placeholder="Ej. Extra queso"
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
                        rules={{ validate: validateModifierInteger }}
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
                        rules={{ validate: validateModifierInteger }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Selección mínima"
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

                      <Controller
                        control={control}
                        name="modifier_max_selection"
                        rules={{ validate: validateModifierMax }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Selección máxima"
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

                      <Controller
                        control={control}
                        name="modifier_price_adjustment"
                        rules={{ validate: validateModifierDecimal }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Ajuste de precio"
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
                    </>
                  )}

                  <HStack style={{ justifyContent: "flex-end" }}>
                    <Button size="lg" className="mt-4" onPress={handleBack}>
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
