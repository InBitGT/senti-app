import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { EmptyHint } from "@/components/atom/EmptyHint/EmptyHint";
import { ProductSearchSelect } from "@/components/atom/ProductSearchSelect/ProductSearchSelect";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, Icon, TrashIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useEntryStock } from "@/src/hooks/useEntryStock/useEntryStock";
import { useProduct } from "@/src/hooks/useProduct/useProduct";
import { useSupplier } from "@/src/hooks/useSupplier/useSupplier";
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useAuthStore } from "@/src/store";
import { InventoryDetail } from "@/src/types/entry_stock/entry_stock.types";
import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface ItemFormValues {
  product_id: string;
  quantity: string;
  unit: string;
  unit_cost: string;
  expiration_date: string;
  batch_number: string;
  notes: string;
  new_sale_price: string;
}

interface FormValues {
  branch_id: string;
  warehouse_id: string;
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
  unit: "",
  unit_cost: "",
  expiration_date: "",
  batch_number: "",
  notes: "",
  new_sale_price: "",
};

// ── Item Row ──────────────────────────────────────────────────────────────────
function ItemRow({
  index,
  control,
  errors,
  remove,
  productData,
  unitData,
  isLarge,
  units,
}: {
  index: number;
  control: any;
  errors: any;
  remove: (i: number) => void;
  productData: any[];
  unitData: any[];
  isLarge: boolean;
  units?: UnitOfMeasure[];
}) {
  const row = isLarge ? { flexDirection: "row" as const, gap: 12 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};
  const third = isLarge ? { flex: 1, minWidth: 0 } : {};

  const quantity = useWatch({ control, name: `items.${index}.quantity` });
  const unit_cost = useWatch({ control, name: `items.${index}.unit_cost` });
  const product_id = useWatch({ control, name: `items.${index}.product_id` });

  const selectedProduct = productData?.find((p) => String(p.id) === product_id);
  const requiresBatch = selectedProduct?.requires_batch ?? false;

  const subtotal = isNaN(parseFloat(quantity) * parseFloat(unit_cost))
    ? "0.00"
    : (parseFloat(quantity) * parseFloat(unit_cost)).toFixed(2);

  const unitOptions = useMemo(
    () =>
      (unitData ?? []).map((u) => ({
        label: `${u.name} (${u.code})`,
        value: u.code,
      })),
    [unitData],
  );

  return (
    <Box
      style={styles.itemCard}
      className="w-full bg-white rounded-[20px] py-8 px-7"
    >
      <HStack
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "bold", color: "#333", fontSize: 14 }}>
          Producto #{index + 1}
        </Text>
        <Pressable onPress={() => remove(index)} style={styles.removeBtn}>
          <Icon as={TrashIcon} size="sm" style={{ color: "#ef4444" }} />
          <Text style={{ color: "#ef4444", fontSize: 13, marginLeft: 4 }}>
            Eliminar
          </Text>
        </Pressable>
      </HStack>

      <VStack space="md">
        {/* Producto — buscador con autocomplete */}
        <Controller
          control={control}
          name={`items.${index}.product_id`}
          rules={{ required: "Selecciona un producto." }}
          render={({ field: { onChange, value } }) => (
            <ProductSearchSelect
              value={value}
              onChange={onChange}
              productData={productData}
              error={errors?.items?.[index]?.product_id?.message}
            />
          )}
        />

        {/* Cantidad + Unidad + Costo unitario */}
        <View style={row}>
          <View style={third}>
            <Controller
              control={control}
              name={`items.${index}.quantity`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Cantidad"
                  placeholder="10"
                  value={value}
                  onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  errorMessage={errors?.items?.[index]?.quantity?.message}
                />
              )}
            />
          </View>

          <View style={third}>
            <Controller
              control={control}
              name={`items.${index}.unit`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, value } }) => (
                <AppSelect
                  label="Unidad"
                  placeholder="Selecciona unidad"
                  searchable={unitOptions.length > 6}
                  options={unitOptions}
                  value={value}
                  onChange={onChange}
                  errorMessage={errors?.items?.[index]?.unit?.message}
                />
              )}
            />
          </View>

          <View style={third}>
            <Controller
              control={control}
              name={`items.${index}.unit_cost`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Costo unitario"
                  placeholder="5.50"
                  value={value}
                  onChangeText={(text) =>
                    onChange(text.replace(/[^0-9.-]/g, ""))
                  }
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  errorMessage={errors?.items?.[index]?.unit_cost?.message}
                />
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
                  <AppInput
                    label="Número de lote"
                    placeholder="Ej. LOTE-001"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="characters"
                    errorMessage={errors?.items?.[index]?.batch_number?.message}
                  />
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
                    <AppInput
                      label="Fecha de vencimiento"
                      placeholder="YYYY-MM-DD"
                      value={value}
                      onChangeText={handleChange}
                      onBlur={onBlur}
                      keyboardType="number-pad"
                      maxLength={10}
                      errorMessage={
                        errors?.items?.[index]?.expiration_date?.message
                      }
                    />
                  );
                }}
              />
            </View>
          </View>
        )}

        {/* Nuevo precio + Notas del item */}
        <View style={row}>
          <View style={half}>
            <Controller
              control={control}
              name={`items.${index}.new_sale_price`}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Nuevo precio de venta (opcional)"
                  placeholder="8.00"
                  value={value}
                  onChangeText={(text) =>
                    onChange(text.replace(/[^0-9.-]/g, ""))
                  }
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  errorMessage={errors?.items?.[index]?.new_sale_price?.message}
                />
              )}
            />
          </View>
          <View style={half}>
            <Controller
              control={control}
              name={`items.${index}.notes`}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Notas (opcional)"
                  placeholder="Observaciones del item..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
        </View>
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
  const { data: unitData } = useUnit();
  const { showToast } = useCustomToast();
  const { width, height } = useWindowDimensions();
  const isLarge = width >= 768;
  const insets = useSafeAreaInsets();

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  // Refs y estado para el botón flotante
  const scrollRef = useRef<any>(null);
  const addButtonRef = useRef<View>(null);
  const [showFab, setShowFab] = useState(false);

  // Revisa si el botón "Agregar" está dentro del área visible de la pantalla
  const checkAddButtonVisibility = useCallback(() => {
    addButtonRef.current?.measureInWindow((_x, y, _w, h) => {
      const isVisible = y + h > 0 && y < height;
      setShowFab(!isVisible);
    });
  }, [height]);

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
      supplier_id: "",
      document_number: "",
      document_date: new Date().toISOString().split("T")[0],
      entry_status: "confirmed",
      notes: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Agregar desde el botón flotante y bajar hasta el nuevo producto
  const handleAddItemFromFab = () => {
    append(EMPTY_ITEM);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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

  const allItems = useWatch({ control, name: "items" });
  const totalGeneral = allItems.reduce((acc, item) => {
    const q = parseFloat(item.quantity) || 0;
    const c = parseFloat(item.unit_cost) || 0;
    return acc + q * c;
  }, 0);

  const supplierOptions = useMemo(
    () =>
      (supplierData ?? []).map((s: any) => ({
        label: s.name,
        value: String(s.id),
      })),
    [supplierData],
  );

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload: InventoryDetail = {
      tenant_id: claims.tenant_id,
      warehouse_id: parseInt(values.warehouse_id),
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
        new_sale_price: item.new_sale_price
          ? parseFloat(item.new_sale_price)
          : null,
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
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          onScroll={checkAddButtonVisibility}
          scrollEventThrottle={16}
          onContentSizeChange={checkAddButtonVisibility}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={true}
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
                  Nuevo Ingreso
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  Llena los campos para registrar un ingreso de inventario
                </Text>

                <VStack space="lg">
                  {/* ── DATOS DEL DOCUMENTO ── */}
                  <Text style={styles.sectionLabel}>DATOS DEL DOCUMENTO</Text>

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

                  {/* Proveedor + N° Documento */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="supplier_id"
                        rules={{ required: "El proveedor es obligatorio." }}
                        render={({ field: { onChange, value } }) => (
                          <AppSelect
                            label="Proveedor"
                            placeholder="Selecciona proveedor"
                            searchable={supplierOptions.length > 6}
                            options={supplierOptions}
                            value={value}
                            onChange={onChange}
                            errorMessage={errors.supplier_id?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="document_number"
                        rules={{
                          required: "El número de documento es obligatorio.",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="N° Documento"
                            placeholder="FAC-003"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.toUpperCase())
                            }
                            onBlur={onBlur}
                            autoCapitalize="characters"
                            errorMessage={errors.document_number?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Fecha */}
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
                            <AppInput
                              label="Fecha del documento"
                              placeholder="YYYY-MM-DD"
                              value={value}
                              onChangeText={handleChange}
                              onBlur={onBlur}
                              keyboardType="number-pad"
                              maxLength={10}
                              errorMessage={errors.document_date?.message}
                            />
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
                      <AppInput
                        label="Notas (opcional)"
                        placeholder="Observaciones generales del ingreso..."
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        textareaHeight={100}
                      />
                    )}
                  />

                  <Divider className="my-2" />

                  {/* ── PRODUCTOS ── */}
                  <HStack
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.sectionLabel}>
                      PRODUCTOS ({fields.length})
                    </Text>
                    <View ref={addButtonRef} collapsable={false}>
                      <Button size="sm" onPress={() => append(EMPTY_ITEM)}>
                        <Icon
                          as={AddIcon}
                          size="sm"
                          color="#fff"
                          style={{ color: "#fff", marginRight: 4 }}
                        />
                        <ButtonText>Agregar</ButtonText>
                      </Button>
                    </View>
                  </HStack>

                  {fields.length === 0 && (
                    <EmptyHint label="No hay productos. Presiona Agregar para añadir uno." />
                  )}

                  {fields.map((field, index) => (
                    <ItemRow
                      key={field.id}
                      index={index}
                      control={control}
                      errors={errors}
                      remove={remove}
                      productData={productData ?? []}
                      unitData={unitData ?? []}
                      isLarge={isLarge}
                    />
                  ))}

                  {/* Total general */}
                  {fields.length > 0 && (
                    <Box
                      style={styles.totalBox}
                      className="w-full bg-white rounded-[20px] py-8 px-7"
                    >
                      <Text style={{ color: "#555", fontSize: 14 }}>
                        Total general
                      </Text>
                      <Text
                        style={{
                          color: "#000",
                          fontWeight: "bold",
                          fontSize: 20,
                        }}
                      >
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

        {/* Botón flotante: aparece cuando "Agregar" sale de la pantalla */}
        {showFab && (
          <Pressable
            onPress={handleAddItemFromFab}
            style={[styles.fab, { bottom: 24 + insets.bottom }]}
          >
            <Icon
              as={AddIcon}
              color="#fff"
              size="xl"
              style={{ color: "#fff" }}
            />
          </Pressable>
        )}
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
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
