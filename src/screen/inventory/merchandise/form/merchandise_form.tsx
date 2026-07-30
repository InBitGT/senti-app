// merchandise_form.tsx
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
import { AlertCircleIcon, ArrowLeftIcon, Icon } from "@/components/ui/icon";
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
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useMerchandise } from "@/src/hooks/useMerchandise/useMerchandise";
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useUnitConversion } from "@/src/hooks/useUnitConvertion/useUnitConvertion";
import { useAuthStore } from "@/src/store";
import { useMerchandiseStore } from "@/src/store/useMerchandiseStore/useMerchandiseStore";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
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
  // Conversión manual (solo si la unidad elegida lo requiere)
  to_uom_id: string;
  conversion_factor: string;
}

export interface MerchandiseDetail {
  tenant_id: number;
  category_id: number;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string | null;
  type: string;
  unit_of_measure_id: number;
  average_cost: number;
  requires_batch: boolean;
  availability_status: string;
  picture: string | null;
  is_modifier: boolean;
}

const PRODUCT_TYPES = [
  { label: "Producto", value: "finished_product" },
  { label: "Servicio", value: "services" },
  { label: "Material de empaque", value: "packing" },
];

export default function MerchandiseForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useMerchandise();
  const { post: postConversion } = useUnitConversion();
  const { data: categorie } = useCategorie();
  const { data: units } = useUnit();
  const data = useMerchandiseStore((state) => state.data);
  const isEdit = useMerchandiseStore((state) => state.isEdit);
  const clearData = useMerchandiseStore((state) => state.clearData);
  const setIsEdit = useMerchandiseStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      category_id: data?.category_id ? String(data.category_id) : "",
      name: data?.name || "",
      description: data?.description || "",
      sku: data?.sku || "",
      barcode: data?.barcode || "",
      brand: data?.brand || "",
      type: data?.type || "finished_product",
      unit_of_measure_id: data?.unit_of_measure_id
        ? String(data.unit_of_measure_id)
        : "",
      average_cost: data?.average_cost ? String(data.average_cost) : "",
      requires_batch: data?.requires_batch ?? false,
      availability_status: data?.availability_status || "available",
      to_uom_id: "",
      conversion_factor: "",
    },
  });

  const selectedUnitId = watch("unit_of_measure_id");

  const selectedUnit = (units ?? []).find(
    (u) => String(u.id) === selectedUnitId,
  );
  const showConversion = !!selectedUnit?.is_conversion_manual;

  // opciones de "convertir a" excluyendo la unidad ya seleccionada
  const conversionTargetUnits = (units ?? []).filter(
    (u) => String(u.id) !== selectedUnitId,
  );

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
    };

    try {
      let productId: number | undefined = data?.id;

      if (!isEdit) {
        const created = await post.mutateAsync(payload);
        productId = created?.id; // ajustar según la forma real de la respuesta
        showToast({
          message: "Producto creado correctamente",
          type: "success",
        });
      } else {
        if (!data?.id) return;
        await put.mutateAsync({ id: data.id, data: payload });
        productId = data.id;
        showToast({
          message: "Producto editado correctamente",
          type: "success",
        });
        setIsEdit(false);
      }

      // Si la unidad requiere conversión manual, se crea el registro de conversión
      // usando el id del producto recién creado/editado.
      if (
        showConversion &&
        values.to_uom_id &&
        values.conversion_factor &&
        productId
      ) {
        await postConversion.mutateAsync({
          from_uom_id: parseInt(values.unit_of_measure_id),
          to_uom_id: parseInt(values.to_uom_id),
          factor: parseFloat(values.conversion_factor),
          product_id: productId,
        });
      }

      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el producto", type: "error" });
    }
  };

  const isPending = post.isPending || put.isPending || postConversion.isPending;

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
            <Box style={styles.card}>
              <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                {isEdit ? "Editar Producto" : "Nuevo Producto"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica los campos para editar el producto"
                  : "Llena los campos para crear un producto"}
              </Text>

              <VStack space="lg">
                {/* ── INFO GENERAL ── */}
                <Text style={styles.sectionLabel}>INFORMACIÓN GENERAL</Text>

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
                            <FormControlLabelText style={{ color: "#000" }}>
                              Nombre
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. Pan"
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

                {/* Descripción */}
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

                {/* SKU + Barcode */}
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
                              placeholder="Ej. PAN-001"
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

                {/* Brand + Costo promedio */}
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
                              placeholder="Ej. 0.50"
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

                {/* Tipo + Unidad de medida (real, desde useUnit) */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="type"
                      rules={{ required: "El tipo es obligatorio." }}
                      render={({ field: { onChange, value } }) => {
                        const selectedLabel =
                          PRODUCT_TYPES.find((t) => t.value === value)?.label ||
                          "";
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
                          <FormControl isInvalid={!!errors.unit_of_measure_id}>
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
                                  {(units ?? []).map((u) => (
                                    <SelectItem
                                      key={u.id}
                                      label={`${u.name} (${u.code})`}
                                      value={String(u.id)}
                                    />
                                  ))}
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

                {/* ── CONVERSIÓN MANUAL (condicional según la unidad elegida) ── */}
                {showConversion && (
                  <>
                    <Divider className="my-2" />
                    <Text style={styles.sectionLabel}>
                      CONVERSIÓN DE UNIDAD
                    </Text>
                    <Text size="xs" style={{ color: "#888" }}>
                      La unidad seleccionada ({selectedUnit?.name}) requiere
                      definir a qué unidad se convierte y el factor.
                    </Text>

                    <View style={row}>
                      <View style={half}>
                        <Controller
                          control={control}
                          name="to_uom_id"
                          rules={{
                            required: "Selecciona la unidad de destino.",
                          }}
                          render={({ field: { onChange, value } }) => {
                            const label =
                              conversionTargetUnits.find(
                                (u) => String(u.id) === value,
                              )?.name || "";
                            return (
                              <FormControl isInvalid={!!errors.to_uom_id}>
                                <FormControlLabel>
                                  <FormControlLabelText
                                    style={{ color: "#000" }}
                                  >
                                    Convertir a
                                  </FormControlLabelText>
                                </FormControlLabel>
                                <Select
                                  selectedValue={value}
                                  onValueChange={onChange}
                                >
                                  <SelectTrigger>
                                    <SelectInput
                                      style={{ color: "#000" }}
                                      placeholder="Selecciona unidad destino"
                                      value={label}
                                    />
                                  </SelectTrigger>
                                  <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                      <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                      </SelectDragIndicatorWrapper>
                                      {conversionTargetUnits.map((u) => (
                                        <SelectItem
                                          key={u.id}
                                          label={`${u.name} (${u.code})`}
                                          value={String(u.id)}
                                        />
                                      ))}
                                    </SelectContent>
                                  </SelectPortal>
                                </Select>
                                <FormControlError>
                                  <FormControlErrorIcon as={AlertCircleIcon} />
                                  <FormControlErrorText>
                                    {errors.to_uom_id?.message}
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
                          name="conversion_factor"
                          rules={{
                            required: "El factor de conversión es obligatorio.",
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl isInvalid={!!errors.conversion_factor}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Factor
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. 1000"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  keyboardType="decimal-pad"
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {errors.conversion_factor?.message}
                                </FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* Switch: requires_batch */}
                <View style={styles.switchRow}>
                  <Text style={{ color: "#000" }}>Requiere lote</Text>
                  <Controller
                    control={control}
                    name="requires_batch"
                    render={({ field: { onChange, value } }) => (
                      <Switch value={value} onToggle={onChange} />
                    )}
                  />
                </View>

                {/* Botones */}
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
});
