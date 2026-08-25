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
import {
  AddIcon,
  AlertCircleIcon,
  Icon,
  TrashIcon,
} from "@/components/ui/icon";
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
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useAuthStore } from "@/src/store";
import { InventoryDetail } from "@/src/types/entry_stock/entry_stock.types";
import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";
import { useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  SearchIcon,
} from "lucide-react-native";
import React, { useMemo } from "react";
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
  unit: "unit",
  unit_cost: "",
  expiration_date: "",
  batch_number: "",
  notes: "",
};

// ── Buscador de producto (autocomplete) ────────────────────────────────────────
// Reemplaza al <Select> plano: el usuario escribe y se filtra la lista de
// productos en tiempo real (por nombre). Al tocar un resultado se guarda su id.
function ProductSearchSelect({
  value,
  onChange,
  productData,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  productData: any[];
  error?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const blurTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedProduct = useMemo(
    () => productData?.find((p) => String(p.id) === value),
    [productData, value],
  );

  // Cuando el campo tiene un valor seleccionado y el buscador está cerrado,
  // se muestra el nombre del producto seleccionado en el input.
  React.useEffect(() => {
    if (!isOpen) {
      setQuery(selectedProduct?.name ?? "");
    }
  }, [selectedProduct, isOpen]);

  const filtered = useMemo(() => {
    const list = productData ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => p.name?.toLowerCase().includes(q));
  }, [query, productData]);

  const handleSelect = (p: any) => {
    onChange(String(p.id));
    setQuery(p.name);
    setIsOpen(false);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (!isOpen) setIsOpen(true);
    // Si el texto ya no coincide con el producto seleccionado, se invalida
    // la selección hasta que el usuario escoja uno de la lista de nuevo.
    if (value && text !== selectedProduct?.name) {
      onChange("");
    }
  };

  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel>
        <FormControlLabelText style={{ color: "#000" }}>
          Producto
        </FormControlLabelText>
      </FormControlLabel>

      <Input>
        <Icon
          as={SearchIcon}
          size="sm"
          style={{ color: "#999", marginLeft: 10 }}
        />
        <InputField
          style={{ color: "#171717" }}
          placeholder="Escribe para buscar un producto..."
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Pequeño delay para que el onPress de un item de la lista
            // alcance a dispararse antes de cerrar el dropdown.
            blurTimeout.current = setTimeout(() => setIsOpen(false), 150);
          }}
        />
        <Icon
          as={ChevronDownIcon}
          size="sm"
          style={{ color: "#999", marginRight: 10 }}
        />
      </Input>

      {isOpen && (
        <Box style={styles.dropdown} className="w-full bg-white rounded-[10px]">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: 220 }}
          >
            {filtered.length === 0 ? (
              <Text style={{ padding: 12, color: "#999" }}>
                Sin resultados para “{query}”
              </Text>
            ) : (
              filtered.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    if (blurTimeout.current) clearTimeout(blurTimeout.current);
                    handleSelect(p);
                  }}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    pressed && { backgroundColor: "#f0f9ff" },
                    String(p.id) === value && { backgroundColor: "#eff6ff" },
                  ]}
                >
                  <Text style={{ color: "#171717" }}>{p.name}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </Box>
      )}

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
}

// ── Item Row ──────────────────────────────────────────────────────────────────
function ItemRow({
  index,
  control,
  errors,
  remove,
  productData,
  isLarge,
  units,
}: {
  index: number;
  control: any;
  errors: any;
  remove: (i: number) => void;
  productData: any[];
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

  return (
    <Box style={styles.itemCard}>
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
                <FormControl isInvalid={!!errors?.items?.[index]?.quantity}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>
                      Cantidad
                    </FormControlLabelText>
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
              render={({ field: { onChange, value } }) => {
                const selectedLabel =
                  units?.find((u) => String(u.id) === value)?.name || "";
                return (
                  <FormControl isInvalid={!!errors.unit_of_measure_id}>
                    <FormControlLabel>
                      <FormControlLabelText style={{ color: "#000" }}>
                        Unidad de medida
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Select selectedValue={value} onValueChange={onChange}>
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
                          <ScrollView
                            style={{ maxHeight: 280, width: "100%" }}
                            nestedScrollEnabled
                          >
                            {(units ?? []).map((u) => (
                              <SelectItem
                                key={u.id}
                                label={`${u.name} (${u.code})`}
                                value={String(u.id)}
                              />
                            ))}
                          </ScrollView>
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

          <View style={third}>
            <Controller
              control={control}
              name={`items.${index}.unit_cost`}
              rules={{ required: "Requerido." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors?.items?.[index]?.unit_cost}>
                  <FormControlLabel>
                    <FormControlLabelText style={{ color: "#000" }}>
                      Costo unitario
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
                  <FormControl
                    isInvalid={!!errors?.items?.[index]?.batch_number}
                  >
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
                    <FormControl
                      isInvalid={!!errors?.items?.[index]?.expiration_date}
                    >
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
                  <Text size="xs" style={{ color: "#999" }}>
                    (opcional)
                  </Text>
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
  const { data: units } = useUnit();
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
                        render={({ field: { onChange, value } }) => {
                          const selectedLabel =
                            branchOptions.find((b) => String(b.id) === value)
                              ?.name || "";
                          return (
                            <FormControl isInvalid={!!errors.branch_id}>
                              <FormControlLabel>
                                <FormControlLabelText style={{ color: "#000" }}>
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
                                  <SelectContent style={{ maxHeight: "50%" }}>
                                    <SelectDragIndicatorWrapper>
                                      <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    <ScrollView
                                      style={{ width: "100%" }}
                                      showsVerticalScrollIndicator={false}
                                    >
                                      {branchOptions.map((b) => (
                                        <SelectItem
                                          key={b.id}
                                          label={b.name}
                                          value={String(b.id)}
                                        />
                                      ))}
                                    </ScrollView>
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
                                <FormControlLabelText style={{ color: "#000" }}>
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
                                  <SelectContent style={{ maxHeight: "50%" }}>
                                    <SelectDragIndicatorWrapper>
                                      <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    <ScrollView
                                      style={{ width: "100%" }}
                                      showsVerticalScrollIndicator={false}
                                    >
                                      {warehouseOptionsForBranch.map((w) => (
                                        <SelectItem
                                          key={w.warehouse_id}
                                          label={w.warehouse_name}
                                          value={String(w.warehouse_id)}
                                        />
                                      ))}
                                    </ScrollView>
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

                {/* Bodega + Proveedor */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="supplier_id"
                      rules={{ required: "El proveedor es obligatorio." }}
                      render={({ field: { onChange, value } }) => {
                        const selectedLabel =
                          supplierData?.find((s: any) => String(s.id) === value)
                            ?.name || "";
                        return (
                          <FormControl isInvalid={!!errors.supplier_id}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                Proveedor
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Select
                              selectedValue={value}
                              onValueChange={onChange}
                            >
                              <SelectTrigger>
                                <SelectInput
                                  style={{ color: "#000" }}
                                  placeholder="Selecciona proveedor"
                                  value={selectedLabel}
                                />
                              </SelectTrigger>
                              <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent style={{ maxHeight: "50%" }}>
                                  <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                  </SelectDragIndicatorWrapper>
                                  <ScrollView
                                    style={{ width: "100%" }}
                                    showsVerticalScrollIndicator={false}
                                  >
                                    {(supplierData ?? []).map((s: any) => (
                                      <SelectItem
                                        key={s.id}
                                        label={s.name}
                                        value={String(s.id)}
                                      />
                                    ))}
                                  </ScrollView>
                                </SelectContent>
                              </SelectPortal>
                            </Select>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>
                                {errors.supplier_id?.message}
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
                      name="document_number"
                      rules={{
                        required: "El número de documento es obligatorio.",
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.document_number}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              N° Documento
                            </FormControlLabelText>
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
                            <FormControlErrorText>
                              {errors.document_number?.message}
                            </FormControlErrorText>
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
                              <FormControlErrorText>
                                {errors.document_date?.message}
                              </FormControlErrorText>
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
                          <Text size="xs" style={{ color: "#999" }}>
                            (opcional)
                          </Text>
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
                <HStack
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.sectionLabel}>
                    PRODUCTOS ({fields.length})
                  </Text>
                  <Button size="sm" onPress={() => append(EMPTY_ITEM)}>
                    <Icon
                      as={AddIcon}
                      size="sm"
                      style={{ color: "#fff", marginRight: 4 }}
                    />
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
                    units={units}
                  />
                ))}

                {/* Total general */}
                {fields.length > 0 && (
                  <Box style={styles.totalBox}>
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
