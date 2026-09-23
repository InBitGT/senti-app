import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { ProductSearchSelect } from "@/components/atom/ProductSearchSelect/ProductSearchSelect";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useEntryStock } from "@/src/hooks/useEntryStock/useEntryStock";
import { useProduct } from "@/src/hooks/useProduct/useProduct";
import { useAuthStore } from "@/src/store";
import { Adjustment } from "@/src/types/entry_stock/entry_stock.types";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React, { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
  branch_id: string;
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

// ⚠️ Solo cambia el "label" (lo que ve el usuario). El "value" (lo que se guarda
// en el form y se manda al backend) NO se toca.
const MOVEMENT_TYPE_OPTIONS = [
  { value: "adjustment_in", label: "Ajuste de entrada" },
  { value: "adjustment_out", label: "Ajuste de salida" },
];

const REASON_OPTIONS = [
  { value: "expired", label: "Vencido" },
  { value: "damaged", label: "Dañado" },
  { value: "theft", label: "Robo" },
  { value: "correction", label: "Corrección" },
  { value: "sale", label: "Venta" },
  { value: "purchase", label: "Compra" },
  { value: "return", label: "Devolución" },
  { value: "other", label: "Otro" },
];

export default function AdjustmentForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { data: productData } = useProduct();
  const { postAdjustment } = useEntryStock();
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const branchOptions = useMemo(
    () =>
      (claims?.branches ?? []).map((b) => ({
        id: b.branch_id,
        name: b.branch_name,
        warehouses: b.warehouses,
      })),
    [claims],
  );

  const totalWarehouses = useMemo(
    () => branchOptions.reduce((acc, b) => acc + b.warehouses.length, 0),
    [branchOptions],
  );

  const hideBranchWarehouseInputs =
    branchOptions.length === 1 && totalWarehouses === 1;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      branch_id: hideBranchWarehouseInputs
        ? String(branchOptions[0]?.id ?? "")
        : "",
      warehouse_id: hideBranchWarehouseInputs
        ? String(branchOptions[0]?.warehouses[0]?.warehouse_id ?? "")
        : "",
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

  const selectedBranchId = useWatch({ control, name: "branch_id" });
  const selectedBranch = branchOptions.find(
    (b) => String(b.id) === selectedBranchId,
  );
  const warehouseOptionsForBranch = selectedBranch?.warehouses ?? [];

  // Al cambiar de sucursal, se limpia la bodega seleccionada (pertenecía a la sucursal anterior).
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!hideBranchWarehouseInputs) {
      setValue("warehouse_id", "");
    }
  }, [selectedBranchId, hideBranchWarehouseInputs, setValue]);

  // El batch_id solo aplica si el producto seleccionado requiere lote
  const product_id = watch("product_id");
  const selectedProduct = productData?.find(
    (p: any) => String(p.id) === product_id,
  );
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
      showToast({
        message: "Movimiento registrado correctamente",
        type: "success",
      });
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
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <DesktopScrollView useWindowHeight>
            <Pressable
              onPress={() => router.back()}
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
                  Ajuste de inventario
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  Registra un movimiento de inventario
                </Text>

                <VStack space="lg">
                  <Text style={styles.sectionLabel}>DATOS DEL MOVIMIENTO</Text>

                  {/* Sucursal + Bodega — solo si el usuario tiene más de una combinación posible */}
                  {!hideBranchWarehouseInputs && (
                    <View style={row}>
                      <View style={half}>
                        <Controller
                          control={control}
                          name="branch_id"
                          rules={{ required: "La sucursal es obligatoria." }}
                          render={({ field: { onChange, value } }) => (
                            <AppSelect
                              label="Sucursal"
                              placeholder="Selecciona una sucursal"
                              searchable={branchOptions.length > 6}
                              options={branchOptions.map((b) => ({
                                label: b.name,
                                value: String(b.id),
                              }))}
                              value={value}
                              onChange={onChange}
                              errorMessage={errors.branch_id?.message}
                            />
                          )}
                        />
                      </View>

                      <View style={half}>
                        <Controller
                          control={control}
                          name="warehouse_id"
                          rules={{ required: "La bodega es obligatoria." }}
                          render={({ field: { onChange, value } }) => (
                            <AppSelect
                              label="Bodega"
                              placeholder={
                                selectedBranchId
                                  ? "Selecciona una bodega"
                                  : "Primero selecciona una sucursal"
                              }
                              searchable={warehouseOptionsForBranch.length > 6}
                              options={warehouseOptionsForBranch.map((w) => ({
                                label: w.warehouse_name,
                                value: String(w.warehouse_id),
                              }))}
                              value={value}
                              onChange={onChange}
                              isDisabled={!selectedBranchId}
                              errorMessage={errors.warehouse_id?.message}
                            />
                          )}
                        />
                      </View>
                    </View>
                  )}

                  {/* Producto + N° Referencia */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="product_id"
                        rules={{ required: "El producto es obligatorio." }}
                        render={({ field: { onChange, value } }) => (
                          <ProductSearchSelect
                            value={value}
                            onChange={onChange}
                            productData={productData ?? []}
                            error={errors.product_id?.message}
                          />
                        )}
                      />
                    </View>

                    <View style={half}>
                      {/* N° Referencia */}
                      <Controller
                        control={control}
                        name="reference_number"
                        rules={{
                          required: "El número de referencia es obligatorio.",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="N° Referencia"
                            placeholder="Ej. ADJ-BATCH-002"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.toUpperCase())
                            }
                            onBlur={onBlur}
                            autoCapitalize="characters"
                            errorMessage={errors.reference_number?.message}
                          />
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
                          <AppSelect
                            label="Tipo de movimiento"
                            placeholder="Selecciona tipo"
                            searchable={false}
                            options={MOVEMENT_TYPE_OPTIONS}
                            value={value}
                            onChange={onChange}
                            errorMessage={errors.movement_type?.message}
                          />
                        )}
                      />
                    </View>

                    <View style={half}>
                      <Controller
                        control={control}
                        name="reason"
                        rules={{ required: "La razón es obligatoria." }}
                        render={({ field: { onChange, value } }) => (
                          <AppSelect
                            label="Razón"
                            placeholder="Selecciona razón"
                            searchable={false}
                            options={REASON_OPTIONS}
                            value={value}
                            onChange={onChange}
                            errorMessage={errors.reason?.message}
                          />
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
                          <AppInput
                            label="Cantidad"
                            placeholder="4"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.replace(/[^0-9]/g, ""))
                            }
                            onBlur={onBlur}
                            keyboardType="decimal-pad"
                            errorMessage={errors.qty?.message}
                          />
                        )}
                      />
                    </View>

                    <View style={half}>
                      <Controller
                        control={control}
                        name="unit_cost"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Costo unitario (opcional)"
                            placeholder="5.50"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.replace(/[^0-9.-]/g, ""))
                            }
                            onBlur={onBlur}
                            keyboardType="decimal-pad"
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Lote — solo si el producto requiere batch */}
                  {requiresBatch && (
                    <Controller
                      control={control}
                      name="batch_id"
                      rules={{ required: "El lote es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <AppInput
                          label="ID de lote"
                          placeholder="Ej. 1"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="number-pad"
                          errorMessage={errors.batch_id?.message}
                        />
                      )}
                    />
                  )}

                  {/* Notas */}
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Notas (opcional)"
                        placeholder="Observaciones del movimiento..."
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        textareaHeight={100}
                      />
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
  dropdown: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
