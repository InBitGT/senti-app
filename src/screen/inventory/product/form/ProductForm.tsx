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
import { useProduct } from "@/src/hooks/useProduct/useProduct";
import { useAuthStore } from "@/src/store";
import { useProductStore } from "@/src/store/useProductStore/useProductStore";
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
  // Base
  category_id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string;
  type: string;
  unit_of_measure: string;
  average_cost: string;
  requires_batch: boolean;
  availability_status: string;
  is_modifier: boolean;
  // Modifier (solo si is_modifier = true)
  modifier_group: string;
  modifier_name: string;
  modifier_quantity: string;
  modifier_min_selection: string;
  modifier_max_selection: string;
  modifier_price_adjustment: string;
  modifier_is_default: boolean;
}

export interface ProductDetail {
  tenant_id: number;
  category_id: number;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  brand: string | null;
  type: string;
  unit_of_measure: string;
  average_cost: number;
  requires_batch: boolean;
  availability_status: string;
  picture: string | null;
  is_modifier: boolean;
  // Modifier (opcional)
  modifier_group?: string;
  modifier_name?: string;
  modifier_quantity?: number;
  modifier_min_selection?: number;
  modifier_max_selection?: number;
  modifier_price_adjustment?: number;
  modifier_is_default?: boolean;
}

export default function ProductForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useProduct();
  const { data: categorie } = useCategorie();
  const data = useProductStore((state) => state.data);
  const isEdit = useProductStore((state) => state.isEdit);
  const clearData = useProductStore((state) => state.clearData);
  const setIsEdit = useProductStore((state) => state.setIsEdit);
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
      type: "ingredient",
      unit_of_measure: data?.unit_of_measure || "unit",
      average_cost: data?.average_cost ? String(data.average_cost) : "",
      requires_batch: data?.requires_batch ?? false,
      availability_status: data?.availability_status || "available",
      is_modifier: data?.is_modifier ?? false,
      // Modifier
      modifier_group: data?.modifier_group || "",
      modifier_name: data?.modifier_name || "",
      modifier_quantity: data?.modifier_quantity ? String(data.modifier_quantity) : "1",
      modifier_min_selection: data?.modifier_min_selection ? String(data.modifier_min_selection) : "0",
      modifier_max_selection: data?.modifier_max_selection ? String(data.modifier_max_selection) : "1",
      modifier_price_adjustment: data?.modifier_price_adjustment ? String(data.modifier_price_adjustment) : "0",
      modifier_is_default: data?.modifier_is_default ?? false,
    },
  });

  const isModifier = watch("is_modifier");

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload: ProductDetail = {
      tenant_id: claims.tenant_id,
      category_id: parseInt(values.category_id),
      name: values.name.trim(),
      description: values.description.trim(),
      sku: values.sku.trim(),
      barcode: values.barcode.trim(),
      brand: values.brand.trim() || null,
      type: values.type,
      unit_of_measure: values.unit_of_measure,
      average_cost: parseFloat(values.average_cost),
      requires_batch: values.requires_batch,
      availability_status: values.availability_status,
      picture: null,
      is_modifier: values.is_modifier,
      // Solo incluir campos de modificador si aplica
      ...(values.is_modifier && {
        modifier_group: values.modifier_group.trim(),
        modifier_name: values.modifier_name.trim(),
        modifier_quantity: parseInt(values.modifier_quantity),
        modifier_min_selection: parseInt(values.modifier_min_selection),
        modifier_max_selection: parseInt(values.modifier_max_selection),
        modifier_price_adjustment: parseFloat(values.modifier_price_adjustment),
        modifier_is_default: values.modifier_is_default,
      }),
    };

    try {
      if (!isEdit) {
        await post.mutateAsync(payload);
        showToast({ message: "Producto creado correctamente", type: "success" });
      } else {
        if (!data?.id) return;
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({ message: "Producto editado correctamente", type: "success" });
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
                            <FormControlLabelText style={{ color: "#000" }}>Nombre</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. Lechuga"
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
                                  <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                  </SelectDragIndicatorWrapper>
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

                {/* Descripción */}
                <Controller
                  control={control}
                  name="description"
                  rules={{ required: "La descripción es obligatoria.", minLength: { value: 3, message: "Mínimo 3 caracteres." } }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.description}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>Descripción</FormControlLabelText>
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
                        <FormControlErrorText>{errors.description?.message}</FormControlErrorText>
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
                            <FormControlLabelText style={{ color: "#000" }}>SKU</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. MOD-LCH-001"
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
                      name="barcode"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Código de barras{" "}
                              <Text size="xs" style={{ color: "#999" }}>(opcional)</Text>
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. 322"
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
                              <Text size="xs" style={{ color: "#999" }}>(opcional)</Text>
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
                            <FormControlLabelText style={{ color: "#000" }}>Costo promedio</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. 0.25"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="decimal-pad"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.average_cost?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* Tipo + Unidad de medida */}
                <View style={row}>
                  <View style={half}>
                     {/* Estado de disponibilidad */}
                    <Controller
                    control={control}
                    name="availability_status"
                    rules={{ required: "El estado es obligatorio." }}
                    render={({ field: { onChange, value } }) => (
                        <FormControl isInvalid={!!errors.availability_status}>
                        <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Estado de disponibilidad</FormControlLabelText>
                        </FormControlLabel>
                        <Select selectedValue={value} onValueChange={onChange}>
                            <SelectTrigger>
                            <SelectInput style={{ color: "#000" }} placeholder="Selecciona estado" value={value} />
                            </SelectTrigger>
                            <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                                <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                <SelectItem label="Disponible" value="available" />
                                <SelectItem label="No disponible" value="unavailable" />
                                <SelectItem label="Agotado" value="out_of_stock" />
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
                              <SelectInput style={{ color: "#000" }} placeholder="Selecciona unidad" value={value} />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                <SelectItem label="Unidad" value="unit" />
                                <SelectItem label="Kilogramo" value="kg" />
                                <SelectItem label="Gramo" value="g" />
                                <SelectItem label="Litro" value="l" />
                                <SelectItem label="Mililitro" value="ml" />
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
                </View>

                {/* Switches: requires_batch + is_modifier */}
                <View style={row}>
                  <View style={[half, styles.switchRow]}>
                    <Text style={{ color: "#000" }}>Requiere lote</Text>
                    <Controller
                      control={control}
                      name="requires_batch"
                      render={({ field: { onChange, value } }) => (
                        <Switch value={value} onToggle={onChange} />
                      )}
                    />
                  </View>

                  <View style={[half, styles.switchRow]}>
                    <Text style={{ color: "#000" }}>Es modificador</Text>
                    <Controller
                      control={control}
                      name="is_modifier"
                      render={({ field: { onChange, value } }) => (
                        <Switch value={value} onToggle={onChange} />
                      )}
                    />
                  </View>
                </View>

                {/* ── SECCIÓN MODIFICADOR (condicional) ── */}
                {isModifier && (
                  <>
                    <Divider className="my-2" />
                    <Text style={styles.sectionLabel}>CONFIGURACIÓN DE MODIFICADOR</Text>

                    {/* Grupo + Nombre del modificador */}
                    <View style={row}>
                      <View style={half}>
                        <Controller
                          control={control}
                          name="modifier_group"
                          rules={{ required: "El grupo es obligatorio." }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl isInvalid={!!errors.modifier_group}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>Grupo</FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. vegetales"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.modifier_group?.message}</FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>

                      <View style={half}>
                        <Controller
                          control={control}
                          name="modifier_name"
                          rules={{ required: "El nombre del modificador es obligatorio." }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl isInvalid={!!errors.modifier_name}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>Nombre del modificador</FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. Lechuga"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.modifier_name?.message}</FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>
                    </View>

                    {/* Cantidad + Ajuste de precio */}
                    <View style={row}>
                      <View style={half}>
                        <Controller
                          control={control}
                          name="modifier_quantity"
                          rules={{ required: "La cantidad es obligatoria." }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl isInvalid={!!errors.modifier_quantity}>
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
                                  keyboardType="number-pad"
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.modifier_quantity?.message}</FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>

                      <View style={half}>
                        <Controller
                          control={control}
                          name="modifier_price_adjustment"
                          rules={{ required: "El ajuste de precio es obligatorio." }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl isInvalid={!!errors.modifier_price_adjustment}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>Ajuste de precio</FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. 0.00"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  keyboardType="decimal-pad"
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.modifier_price_adjustment?.message}</FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>
                    </View>

                    {/* Selección mínima + máxima */}
                    <View style={row}>
                      <View style={half}>
                        <Controller
                          control={control}
                          name="modifier_min_selection"
                          rules={{ required: "La selección mínima es obligatoria." }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl isInvalid={!!errors.modifier_min_selection}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>Selección mínima</FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. 0"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  keyboardType="number-pad"
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.modifier_min_selection?.message}</FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>

                      <View style={half}>
                        <Controller
                          control={control}
                          name="modifier_max_selection"
                          rules={{ required: "La selección máxima es obligatoria." }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <FormControl isInvalid={!!errors.modifier_max_selection}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>Selección máxima</FormControlLabelText>
                              </FormControlLabel>
                              <Input>
                                <InputField
                                  style={{ color: "#171717" }}
                                  placeholder="Ej. 3"
                                  value={value}
                                  onChangeText={onChange}
                                  onBlur={onBlur}
                                  keyboardType="number-pad"
                                />
                              </Input>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.modifier_max_selection?.message}</FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          )}
                        />
                      </View>
                    </View>

                    {/* modifier_is_default */}
                    <View style={styles.switchRow}>
                      <Text style={{ color: "#000" }}>Seleccionado por defecto</Text>
                      <Controller
                        control={control}
                        name="modifier_is_default"
                        render={({ field: { onChange, value } }) => (
                          <Switch value={value} onToggle={onChange} />
                        )}
                      />
                    </View>
                  </>
                )}

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