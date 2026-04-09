import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
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
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useEntryStock } from "@/src/hooks/useEntryStock/useEntryStock";
import { useProduct } from "@/src/hooks/useProduct/useProduct";
import { useAuthStore } from "@/src/store";
import { Adjustment } from "@/src/types/entry_stock/entry_stock.types";
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
  warehouse_id: string;
  product_id: string;
  batch_id: string;
  movement_type: string;
  reason: string;
  notes: string;
  qty: string;
  unit_cost: string;
  reference_number: string;
}

export default function AdjustmentForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { data: productData } = useProduct();
  const {postAdjustment}= useEntryStock()
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
      warehouse_id: "",
      product_id: "",
      batch_id: "",
      movement_type: "",
      reason: "",
      notes: "",
      qty: "",
      unit_cost: "",
      reference_number: "",
    },
  });

  // El batch_id solo aplica si el producto seleccionado requiere lote
  const product_id = watch("product_id");
  const selectedProduct = productData?.find((p: any) => String(p.id) === product_id);
  const requiresBatch = selectedProduct?.requires_batch ?? false;

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload: Adjustment = {
      warehouse_id: parseInt(values.warehouse_id),
      product_id: parseInt(values.product_id),
      batch_id: requiresBatch ? parseInt(values.batch_id) : null,
      user_id: claims.sub,
      movement_type: values.movement_type,
      reason: values.reason,
      notes: values.notes.trim(),
      qty: parseFloat(values.qty),
      unit_cost: values.unit_cost ? parseFloat(values.unit_cost) : null,
      reference_number: values.reference_number.trim(),
    };

    try {
      await postAdjustment.mutateAsync(payload);
      showToast({ message: "Movimiento registrado correctamente", type: "success" });
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el movimiento", type: "error" });
    }
  };

  const isPending = postAdjustment.isPending;

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
                Nuevo Movimiento
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                Registra un movimiento de inventario
              </Text>

              <VStack space="lg">
                <Text style={styles.sectionLabel}>DATOS DEL MOVIMIENTO</Text>

                {/* Producto + Bodega */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="product_id"
                      rules={{ required: "El producto es obligatorio." }}
                      render={({ field: { onChange, value } }) => {
                        const selectedLabel =
                          productData?.find((p: any) => String(p.id) === value)?.name || "";
                        return (
                          <FormControl isInvalid={!!errors.product_id}>
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
                                  {(productData ?? []).map((p: any) => (
                                    <SelectItem key={p.id} label={p.name} value={String(p.id)} />
                                  ))}
                                </SelectContent>
                              </SelectPortal>
                            </Select>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>{errors.product_id?.message}</FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        );
                      }}
                    />
                  </View>

                  <View style={half}>
                    <Controller
                      control={control}
                      name="warehouse_id"
                      rules={{ required: "La bodega es obligatoria." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.warehouse_id}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Bodega</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="ID de bodega"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="number-pad"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.warehouse_id?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* Tipo de movimiento + Razón */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="movement_type"
                      rules={{ required: "El tipo es obligatorio." }}
                      render={({ field: { onChange, value } }) => (
                        <FormControl isInvalid={!!errors.movement_type}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Tipo de movimiento</FormControlLabelText>
                          </FormControlLabel>
                          <Select selectedValue={value} onValueChange={onChange}>
                            <SelectTrigger>
                              <SelectInput
                                style={{ color: "#000" }}
                                placeholder="Selecciona tipo"
                                value={value}
                              />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper>
                                  <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                <SelectItem label="Entrada" value="entry" />
                                <SelectItem label="Salida" value="exit" />
                                <SelectItem label="Ajuste entrada" value="adjustment_in" />
                                <SelectItem label="Ajuste salida" value="adjustment_out" />
                                <SelectItem label="Transferencia" value="transfer" />
                              </SelectContent>
                            </SelectPortal>
                          </Select>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.movement_type?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>

                  <View style={half}>
                    <Controller
                      control={control}
                      name="reason"
                      rules={{ required: "La razón es obligatoria." }}
                      render={({ field: { onChange, value } }) => (
                        <FormControl isInvalid={!!errors.reason}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Razón</FormControlLabelText>
                          </FormControlLabel>
                          <Select selectedValue={value} onValueChange={onChange}>
                            <SelectTrigger>
                              <SelectInput
                                style={{ color: "#000" }}
                                placeholder="Selecciona razón"
                                value={value}
                              />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper>
                                  <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                <SelectItem label="Vencido" value="expired" />
                                <SelectItem label="Dañado" value="damaged" />
                                <SelectItem label="Robo" value="theft" />
                                <SelectItem label="Corrección" value="correction" />
                                <SelectItem label="Venta" value="sale" />
                                <SelectItem label="Compra" value="purchase" />
                                <SelectItem label="Devolución" value="return" />
                                <SelectItem label="Otro" value="other" />
                              </SelectContent>
                            </SelectPortal>
                          </Select>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.reason?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* Cantidad + Costo unitario */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="qty"
                      rules={{ required: "La cantidad es obligatoria." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.qty}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Cantidad</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. 4"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="decimal-pad"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.qty?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>

                  <View style={half}>
                    <Controller
                      control={control}
                      name="unit_cost"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Costo unitario{" "}
                              <Text size="xs" style={{ color: "#999" }}>(opcional)</Text>
                            </FormControlLabelText>
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
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* N° Referencia */}
                <Controller
                  control={control}
                  name="reference_number"
                  rules={{ required: "El número de referencia es obligatorio." }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.reference_number}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>N° Referencia</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. ADJ-BATCH-002"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="characters"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>{errors.reference_number?.message}</FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Lote — solo si el producto requiere batch */}
                {requiresBatch && (
                  <Controller
                    control={control}
                    name="batch_id"
                    rules={{ required: "El lote es obligatorio." }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl isInvalid={!!errors.batch_id}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>ID de lote</FormControlLabelText>
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
                          <FormControlErrorText>{errors.batch_id?.message}</FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />
                )}

                {/* Notas */}
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
                          placeholder="Observaciones del movimiento..."
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Textarea>
                    </FormControl>
                  )}
                />

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
});