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
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useEntryStock } from "@/src/hooks/useEntryStock/useEntryStock";
import { useProduct } from "@/src/hooks/useProduct/useProduct";
import { useSupplier } from "@/src/hooks/useSupplier/useSupplier";
import { useAuthStore } from "@/src/store";
import { InventoryDetail } from "@/src/types/entry_stock/entry_stock.types";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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

interface ItemFormValues {
  product_id: string;
  quantity: string;
  unit: string;
  unit_cost: string;
  expiration_date: string;
  batch_number: string;
  notes: string;
}

interface FormValues {
  warehouse_id: number;
  supplier_id: string;
  document_number: string;
  document_date: string;
  entry_status: string;
  notes: string;
  items: ItemFormValues[];
}

const EMPTY_ITEM: ItemFormValues = {
  product_id: "",
  quantity: "",
  unit: "unit",
  unit_cost: "",
  expiration_date: "",
  batch_number: "",
  notes: "",
};

// ── Item Row ──────────────────────────────────────────────────────────────────
function ItemRow({
  index,
  control,
  errors,
  remove,
  productData,
  isLarge,
}: {
  index: number;
  control: any;
  errors: any;
  remove: (i: number) => void;
  productData: any[];
  isLarge: boolean;
}) {
  const row = isLarge ? { flexDirection: "row" as const, gap: 12 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};
  const third = isLarge ? { flex: 1, minWidth: 0 } : {};

  const quantity = useWatch({ control, name: `items.${index}.quantity` });
  const unit_cost = useWatch({ control, name: `items.${index}.unit_cost` });
  const product_id = useWatch({ control, name: `items.${index}.product_id` });

  const selectedProduct = productData?.find((p) => String(p.id) === product_id);
  const requiresBatch = selectedProduct?.requires_batch ?? false;

  const subtotal =
    isNaN(parseFloat(quantity) * parseFloat(unit_cost))
      ? "0.00"
      : (parseFloat(quantity) * parseFloat(unit_cost)).toFixed(2);

  return (
    <Box style={styles.itemCard}>
      <HStack style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontWeight: "bold", color: "#333", fontSize: 14 }}>
          Producto #{index + 1}
        </Text>
        <Pressable onPress={() => remove(index)} style={styles.removeBtn}>
          <Icon as={TrashIcon} size="sm" style={{ color: "#ef4444" }} />
          <Text style={{ color: "#ef4444", fontSize: 13, marginLeft: 4 }}>Eliminar</Text>
        </Pressable>
      </HStack>

      <VStack space="md">
        {/* Producto */}
        <Controller
          control={control}
          name={`items.${index}.product_id`}
          rules={{ required: "Selecciona un producto." }}
          render={({ field: { onChange, value } }) => {
            const selectedLabel =
              productData?.find((p) => String(p.id) === value)?.name || "";
            return (
              <FormControl isInvalid={!!errors?.items?.[index]?.product_id}>
                <FormControlLabel>
                  <FormControlLabelText style={{ color: "#000" }}>Producto</FormControlLabelText>
                </FormControlLabel>
                <Select selectedValue={value} onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectInput
                      style={{ color: "#000" }}
                      placeholder="Selecciona producto"
                      value={selectedLabel}
                    />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {(productData ?? []).map((p) => (
                        <SelectItem key={p.id} label={p.name} value={String(p.id)} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {errors?.items?.[index]?.product_id?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            );
          }}
        />

        {/* Cantidad + Unidad + Costo unitario */}
        <View style={row}>
          <View style={third}>
            <Controller
              control={control}
              name={`items.${index}.quantity`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors?.items?.[index]?.quantity}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>Cantidad</FormControlLabelText>
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
                      {errors?.items?.[index]?.quantity?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>

          <View style={third}>
            <Controller
              control={control}
              name={`items.${index}.unit`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors?.items?.[index]?.unit}>
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
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
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
                      {errors?.items?.[index]?.unit?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>

          <View style={third}>
            <Controller
              control={control}
              name={`items.${index}.unit_cost`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors?.items?.[index]?.unit_cost}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>Costo unitario</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      style={{ color: "#171717" }}
                      placeholder="Ej. 5.50"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors?.items?.[index]?.unit_cost?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          </View>
        </View>

        {/* Subtotal (solo lectura) */}
        <View style={styles.subtotalRow}>
          <Text style={{ color: "#555", fontSize: 13 }}>Subtotal:</Text>
          <Text style={{ color: "#000", fontWeight: "bold", fontSize: 15 }}>
            Q {subtotal}
          </Text>
        </View>

        {/* Lote + Vencimiento — solo si requires_batch */}
        {requiresBatch && (
          <View style={row}>
            <View style={half}>
              <Controller
                control={control}
                name={`items.${index}.batch_number`}
                rules={{ required: "El lote es obligatorio." }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors?.items?.[index]?.batch_number}>
                    <FormControlLabel>
                      <FormControlLabelText style={{ color: "#000" }}>
                        Número de lote
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input>
                      <InputField
                        style={{ color: "#171717" }}
                        placeholder="Ej. LOTE-001"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="characters"
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>
                        {errors?.items?.[index]?.batch_number?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />
            </View>

            <View style={half}>
              <Controller
                control={control}
                name={`items.${index}.expiration_date`}
                rules={{
                    required: "La fecha es obligatoria.",
                    pattern: {
                    value: /^\d{4}-\d{2}-\d{2}$/,
                    message: "Formato inválido. Usa YYYY-MM-DD.",
                    },
                }}
                render={({ field: { onChange, onBlur, value } }) => {
                    const handleChange = (text: string) => {
                    const cleaned = text.replace(/[^0-9]/g, "");
                    let formatted = cleaned;
                    if (cleaned.length > 4) {
                        formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
                    }
                    if (cleaned.length > 6) {
                        formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
                    }
                    onChange(formatted);
                    };

                    return (
                    <FormControl isInvalid={!!errors?.items?.[index]?.expiration_date}>
                        <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                            Fecha de vencimiento
                        </FormControlLabelText>
                        </FormControlLabel>
                        <Input>
                        <InputField
                            style={{ color: "#171717" }}
                            placeholder="YYYY-MM-DD"
                            value={value}
                            onChangeText={handleChange}
                            onBlur={onBlur}
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                        </Input>
                        <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                            {errors?.items?.[index]?.expiration_date?.message}
                        </FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                    );
                }}
                />
            </View>
          </View>
        )}

        {/* Notas del item */}
        <Controller
          control={control}
          name={`items.${index}.notes`}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText style={{ color: "#000" }}>
                  Notas{" "}
                  <Text size="xs" style={{ color: "#999" }}>(opcional)</Text>
                </FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  style={{ color: "#171717" }}
                  placeholder="Observaciones del item..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            </FormControl>
          )}
        />
      </VStack>
    </Box>
  );
}

// ── Formulario principal ──────────────────────────────────────────────────────
export default function InventoryForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post } = useEntryStock();
  const { data: productData } = useProduct();
  const { data: supplierData } = useSupplier();
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      warehouse_id: claims?.warehouse_id ?? 0,
      supplier_id: "",
      document_number: "",
      document_date: new Date().toISOString().split("T")[0],
      entry_status: "confirmed",
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const allItems = useWatch({ control, name: "items" });
  const totalGeneral = allItems.reduce((acc, item) => {
    const q = parseFloat(item.quantity) || 0;
    const c = parseFloat(item.unit_cost) || 0;
    return acc + q * c;
  }, 0);

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload: InventoryDetail = {
      tenant_id: claims.tenant_id,
      warehouse_id: claims.warehouse_id,
      supplier_id: parseInt(values.supplier_id),
      user_id: claims.sub,
      document_number: values.document_number.trim(),
      document_date: values.document_date,
      entry_status: values.entry_status,
      notes: values.notes.trim(),
      items: values.items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        unit_cost: parseFloat(item.unit_cost),
        subtotal: parseFloat(item.quantity) * parseFloat(item.unit_cost),
        expiration_date: item.expiration_date || null,
        batch_number: item.batch_number || null,
        notes: item.notes.trim(),
      })),
    };

    try {
      await post.mutateAsync(payload);
      showToast({ message: "Ingreso creado correctamente", type: "success" });
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el ingreso", type: "error" });
    }
  };

  const isPending = post.isPending;

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
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
          >
            <Icon as={ArrowLeftIcon} size="xl" style={{ color: "#000" }} />
            <Text style={{ color: "#000", marginLeft: 8, fontSize: 16 }}>Regresar</Text>
          </Pressable>

          <Center>
            <Box style={styles.card}>
              <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                Nuevo Ingreso
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                Llena los campos para registrar un ingreso de inventario
              </Text>

              <VStack space="lg">
                {/* ── DATOS DEL DOCUMENTO ── */}
                <Text style={styles.sectionLabel}>DATOS DEL DOCUMENTO</Text>

                {/* Bodega + Proveedor */}
                <View style={row}>

                  <View style={half}>
                    <Controller
                      control={control}
                      name="supplier_id"
                      rules={{ required: "El proveedor es obligatorio." }}
                      render={({ field: { onChange, value } }) => {
                        const selectedLabel =
                          supplierData?.find((s: any) => String(s.id) === value)?.name || "";
                        return (
                          <FormControl isInvalid={!!errors.supplier_id}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>Proveedor</FormControlLabelText>
                            </FormControlLabel>
                            <Select selectedValue={value} onValueChange={onChange}>
                              <SelectTrigger>
                                <SelectInput
                                  style={{ color: "#000" }}
                                  placeholder="Selecciona proveedor"
                                  value={selectedLabel}
                                />
                              </SelectTrigger>
                              <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                  <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                  </SelectDragIndicatorWrapper>
                                  {(supplierData ?? []).map((s: any) => (
                                    <SelectItem key={s.id} label={s.name} value={String(s.id)} />
                                  ))}
                                </SelectContent>
                              </SelectPortal>
                            </Select>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>{errors.supplier_id?.message}</FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        );
                      }}
                    />
                  </View>
                                    <View style={half}>
                    <Controller
                      control={control}
                      name="document_number"
                      rules={{ required: "El número de documento es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.document_number}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>N° Documento</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. FAC-003"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCapitalize="characters"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.document_number?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* N° Documento + Fecha */}
                <View style={row}>

                  <View style={half}>
                    <Controller
                        control={control}
                        name="document_date"
                        rules={{
                            required: "La fecha es obligatoria.",
                            pattern: {
                            value: /^\d{4}-\d{2}-\d{2}$/,
                            message: "Formato inválido. Usa YYYY-MM-DD.",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => {
                            const handleChange = (text: string) => {
                            // Solo permitir números y guiones
                            const cleaned = text.replace(/[^0-9]/g, "");

                            // Insertar guiones automáticamente
                            let formatted = cleaned;
                            if (cleaned.length > 4) {
                                formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
                            }
                            if (cleaned.length > 6) {
                                formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
                            }

                            onChange(formatted);
                            };

                            return (
                            <FormControl isInvalid={!!errors.document_date}>
                                <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                    Fecha del documento
                                </FormControlLabelText>
                                </FormControlLabel>
                                <Input>
                                <InputField
                                    style={{ color: "#171717" }}
                                    placeholder="YYYY-MM-DD"
                                    value={value}
                                    onChangeText={handleChange}
                                    onBlur={onBlur}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                />
                                </Input>
                                <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.document_date?.message}</FormControlErrorText>
                                </FormControlError>
                            </FormControl>
                            );
                        }}
                        />
                  </View>
                  <View style={half}></View>
                </View>
               
                {/* Notas generales */}
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          Notas{" "}
                          <Text size="xs" style={{ color: "#999" }}>(opcional)</Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Textarea>
                        <TextareaInput
                          style={{ color: "#171717" }}
                          placeholder="Observaciones generales del ingreso..."
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Textarea>
                    </FormControl>
                  )}
                />

                <Divider className="my-2" />

                {/* ── PRODUCTOS ── */}
                <HStack style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.sectionLabel}>PRODUCTOS ({fields.length})</Text>
                  <Button size="sm" onPress={() => append(EMPTY_ITEM)}>
                    <Icon as={AddIcon} size="sm" style={{ color: "#fff", marginRight: 4 }} />
                    <ButtonText>Agregar</ButtonText>
                  </Button>
                </HStack>

                {fields.length === 0 && (
                  <Box style={styles.emptyBox}>
                    <Text style={{ color: "#999", textAlign: "center" }}>
                      No hay productos. Presiona Agregar para añadir uno.
                    </Text>
                  </Box>
                )}

                {fields.map((field, index) => (
                  <ItemRow
                    key={field.id}
                    index={index}
                    control={control}
                    errors={errors}
                    remove={remove}
                    productData={productData ?? []}
                    isLarge={isLarge}
                  />
                ))}

                {/* Total general */}
                {fields.length > 0 && (
                  <Box style={styles.totalBox}>
                    <Text style={{ color: "#555", fontSize: 14 }}>Total general</Text>
                    <Text style={{ color: "#000", fontWeight: "bold", fontSize: 20 }}>
                      Q {totalGeneral.toFixed(2)}
                    </Text>
                  </Box>
                )}

                {/* Botones */}
                <HStack style={{ justifyContent: "flex-end" }}>
                  <Button
                    size="lg"
                    className="mt-4"
                    onPress={() => router.back()}
                  >
                    <ButtonText>Cancelar</ButtonText>
                  </Button>
                  <Button
                    style={{ marginLeft: 10 }}
                    size="lg"
                    className="mt-4"
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending || fields.length === 0}
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
  itemCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fafafa",
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
  },
});