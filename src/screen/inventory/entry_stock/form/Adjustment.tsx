import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
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
import { AlertCircleIcon, Icon } from "@/components/ui/icon";
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

  // Sucursales + bodegas a las que el usuario tiene acceso, según sus claims.
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

  // Si el usuario tiene exactamente 1 sucursal y 1 bodega, no se le muestra nada:
  // se preselecciona automáticamente esa única combinación.
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
    console.log(values.movement_type);
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
      <SafeAreaView edges={["top"]}>
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
                  Nuevo Movimiento
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
                          render={({ field: { onChange, value } }) => {
                            const selectedLabel =
                              branchOptions.find((b) => String(b.id) === value)
                                ?.name || "";
                            return (
                              <FormControl isInvalid={!!errors.branch_id}>
                                <FormControlLabel>
                                  <FormControlLabelText
                                    style={{ color: "#000" }}
                                  >
                                    Sucursal
                                  </FormControlLabelText>
                                </FormControlLabel>
                                <Select
                                  selectedValue={value}
                                  onValueChange={onChange}
                                >
                                  <SelectTrigger>
                                    <SelectInput
                                      style={{ color: "#000" }}
                                      placeholder="Selecciona una sucursal"
                                      value={selectedLabel}
                                    />
                                  </SelectTrigger>
                                  <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                      <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                      </SelectDragIndicatorWrapper>
                                      {branchOptions.map((b) => (
                                        <SelectItem
                                          key={b.id}
                                          label={b.name}
                                          value={String(b.id)}
                                        />
                                      ))}
                                    </SelectContent>
                                  </SelectPortal>
                                </Select>
                                <FormControlError>
                                  <FormControlErrorIcon as={AlertCircleIcon} />
                                  <FormControlErrorText>
                                    {errors.branch_id?.message}
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
                          name="warehouse_id"
                          rules={{ required: "La bodega es obligatoria." }}
                          render={({ field: { onChange, value } }) => {
                            const selectedLabel =
                              warehouseOptionsForBranch.find(
                                (w) => String(w.warehouse_id) === value,
                              )?.warehouse_name || "";
                            return (
                              <FormControl isInvalid={!!errors.warehouse_id}>
                                <FormControlLabel>
                                  <FormControlLabelText
                                    style={{ color: "#000" }}
                                  >
                                    Bodega
                                  </FormControlLabelText>
                                </FormControlLabel>
                                <Select
                                  selectedValue={value}
                                  onValueChange={onChange}
                                  isDisabled={!selectedBranchId}
                                >
                                  <SelectTrigger>
                                    <SelectInput
                                      style={{ color: "#000" }}
                                      placeholder={
                                        selectedBranchId
                                          ? "Selecciona una bodega"
                                          : "Primero selecciona una sucursal"
                                      }
                                      value={selectedLabel}
                                    />
                                  </SelectTrigger>
                                  <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent style={{ maxHeight: 320 }}>
                                      <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                      </SelectDragIndicatorWrapper>
                                      {warehouseOptionsForBranch.map((w) => (
                                        <SelectItem
                                          key={w.warehouse_id}
                                          label={w.warehouse_name}
                                          value={String(w.warehouse_id)}
                                        />
                                      ))}
                                    </SelectContent>
                                  </SelectPortal>
                                </Select>
                                <FormControlError>
                                  <FormControlErrorIcon as={AlertCircleIcon} />
                                  <FormControlErrorText>
                                    {errors.warehouse_id?.message}
                                  </FormControlErrorText>
                                </FormControlError>
                              </FormControl>
                            );
                          }}
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
                        render={({ field: { onChange, value } }) => {
                          const selectedLabel =
                            productData?.find(
                              (p: any) => String(p.id) === value,
                            )?.name || "";
                          return (
                            <FormControl isInvalid={!!errors.product_id}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Producto
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Select
                                selectedValue={value}
                                onValueChange={onChange}
                              >
                                <SelectTrigger>
                                  <SelectInput
                                    style={{ color: "#000" }}
                                    placeholder="Selecciona producto"
                                    value={selectedLabel}
                                  />
                                </SelectTrigger>
                                <SelectPortal>
                                  <SelectBackdrop />
                                  <SelectContent style={{ maxHeight: 320 }}>
                                    <SelectDragIndicatorWrapper>
                                      <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    <ScrollView
                                      style={{ maxHeight: 280 }}
                                      nestedScrollEnabled
                                    >
                                      {(productData ?? []).map((p: any) => (
                                        <SelectItem
                                          key={p.id}
                                          label={p.name}
                                          value={String(p.id)}
                                        />
                                      ))}
                                    </ScrollView>
                                  </SelectContent>
                                </SelectPortal>
                              </Select>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {errors.product_id?.message}
                                </FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          );
                        }}
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
                          <FormControl isInvalid={!!errors.reference_number}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                N° Referencia
                              </FormControlLabelText>
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
                              <FormControlErrorText>
                                {errors.reference_number?.message}
                              </FormControlErrorText>
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
                        render={({ field: { onChange, value } }) => {
                          const selectedLabel =
                            MOVEMENT_TYPE_OPTIONS.find((m) => m.value === value)
                              ?.label || "";

                          return (
                            <FormControl isInvalid={!!errors.movement_type}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Tipo de movimiento
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Select
                                selectedValue={value}
                                onValueChange={onChange}
                              >
                                <SelectTrigger>
                                  <SelectInput
                                    style={{ color: "#000" }}
                                    placeholder="Selecciona tipo"
                                    value={selectedLabel}
                                  />
                                </SelectTrigger>
                                <SelectPortal>
                                  <SelectBackdrop />
                                  <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                      <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {MOVEMENT_TYPE_OPTIONS.map((m) => (
                                      <SelectItem
                                        key={m.value}
                                        label={m.label}
                                        value={m.value}
                                      />
                                    ))}
                                  </SelectContent>
                                </SelectPortal>
                              </Select>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {errors.movement_type?.message}
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
                        name="reason"
                        rules={{ required: "La razón es obligatoria." }}
                        render={({ field: { onChange, value } }) => {
                          const selectedLabel =
                            REASON_OPTIONS.find((r) => r.value === value)
                              ?.label || "";

                          return (
                            <FormControl isInvalid={!!errors.reason}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
                                  Razón
                                </FormControlLabelText>
                              </FormControlLabel>
                              <Select
                                selectedValue={value}
                                onValueChange={onChange}
                              >
                                <SelectTrigger>
                                  <SelectInput
                                    style={{ color: "#000" }}
                                    placeholder="Selecciona razón"
                                    value={selectedLabel}
                                  />
                                </SelectTrigger>
                                <SelectPortal>
                                  <SelectBackdrop />
                                  <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                      <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {REASON_OPTIONS.map((r) => (
                                      <SelectItem
                                        key={r.value}
                                        label={r.label}
                                        value={r.value}
                                      />
                                    ))}
                                  </SelectContent>
                                </SelectPortal>
                              </Select>
                              <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>
                                  {errors.reason?.message}
                                </FormControlErrorText>
                              </FormControlError>
                            </FormControl>
                          );
                        }}
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
                              <FormControlLabelText style={{ color: "#000" }}>
                                Cantidad
                              </FormControlLabelText>
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
                              <FormControlErrorText>
                                {errors.qty?.message}
                              </FormControlErrorText>
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
                                <Text size="xs" style={{ color: "#999" }}>
                                  (opcional)
                                </Text>
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

                  {/* Lote — solo si el producto requiere batch */}
                  {requiresBatch && (
                    <Controller
                      control={control}
                      name="batch_id"
                      rules={{ required: "El lote es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.batch_id}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              ID de lote
                            </FormControlLabelText>
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
                            <FormControlErrorText>
                              {errors.batch_id?.message}
                            </FormControlErrorText>
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
                            <Text size="xs" style={{ color: "#999" }}>
                              (opcional)
                            </Text>
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
});
