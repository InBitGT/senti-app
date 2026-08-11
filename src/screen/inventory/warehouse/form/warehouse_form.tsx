import { BotonBack } from "@/components/atom/BotonBack/BotonBack";
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
import { AlertCircleIcon, Icon, TrashIcon } from "@/components/ui/icon";
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
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useWarehouse } from "@/src/hooks/useWarehouse/useWarehouse";
import { useAuthStore } from "@/src/store";
import { useWarehouseStore } from "@/src/store/useWarehouseStore/useWarehouseStore";
import {
  WAREHOUSE_TYPE_OPTIONS,
  WarehousePayload,
  WarehouseZonePayload,
  ZONE_TYPE_OPTIONS,
} from "@/src/types/warehouse/warehouse.types";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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

interface ZoneFormValue {
  id?: number; // presente si es una zona ya existente
  parent_temp_id: string; // "" = sin padre (zona raíz)
  name: string;
  code: string;
  zone_type: string;
}

interface FormValues {
  code: string;
  name: string;
  type: string;
  description: string;
  branch_id: string;
  is_default: boolean;
  uses_zones: boolean;
  zones: ZoneFormValue[];
}

export default function WarehouseForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useWarehouse();
  const data = useWarehouseStore((state) => state.data);
  const isEdit = useWarehouseStore((state) => state.isEdit);
  const clearData = useWarehouseStore((state) => state.clearData);
  const setIsEdit = useWarehouseStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  // Solo las sucursales a las que el usuario tiene acceso, según el token (claims.branches).
  const branchOptions = React.useMemo(
    () =>
      (claims?.branches ?? []).map((b) => ({
        id: b.branch_id,
        name: b.branch_name,
      })),
    [claims],
  );

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      code: data?.code || "",
      name: data?.name || "",
      type: data?.type || "",
      description: data?.description || "",
      branch_id: data?.branch_id ? String(data.branch_id) : "",
      is_default: data?.is_default ?? false,
      uses_zones: data?.uses_zones ?? false,
      zones: (data?.zones ?? []).map((z) => ({
        id: z.id,
        // Referenciamos al padre por su id real (ya persistido); ver nota de submit.
        parent_temp_id: z.parent_zone_id ? String(z.parent_zone_id) : "",
        name: z.name,
        code: z.code,
        zone_type: z.zone_type,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "zones" });

  const usesZonesValue = watch("uses_zones");
  const zonesValue = watch("zones");

  const addZone = () => {
    append({ parent_temp_id: "", name: "", code: "", zone_type: "zone" });
  };

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    // Cada fila nueva recibe un temp_id de cliente para poder enlazar jerarquía
    // dentro del mismo payload. Las filas que ya tenían "id" real se mandan con
    // su id y, si su padre también ya existe, con el id real como parent_temp_id.
    // ⚠️ Si tu backend NO soporta resolver jerarquía por temp_id en un solo request,
    // hay que cambiar esto por creación secuencial (padres primero, luego hijos
    // usando el id real que devuelva el servidor).
    const zones: WarehouseZonePayload[] = values.uses_zones
      ? values.zones.map((z, index) => ({
          id: z.id,
          temp_id: z.id ? String(z.id) : `new-${index}`,
          parent_temp_id: z.parent_temp_id || null,
          name: z.name.trim(),
          code: z.code.trim(),
          zone_type: z.zone_type,
        }))
      : [];

    const payload: WarehousePayload = {
      branch_id: parseInt(values.branch_id),
      code: values.code.trim(),
      name: values.name.trim(),
      type: values.type,
      description: values.description.trim(),
      is_default: values.is_default,
      uses_zones: values.uses_zones,
      zones,
    };

    try {
      if (!isEdit) {
        await post.mutateAsync(payload);
        showToast({ message: "Bodega creada correctamente", type: "success" });
      } else {
        if (!data?.id) return;
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({ message: "Bodega editada correctamente", type: "success" });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar la bodega", type: "error" });
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
          <BotonBack
            onPress={() => {
              clearData();
              setIsEdit(false);
              router.back();
            }}
          />

          <Center>
            <Box
              style={styles.card}
              className="w-full bg-white rounded-[20px] py-8 px-7"
            >
              <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                {isEdit ? "Editar Bodega" : "Nueva Bodega"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica los campos para editar la bodega"
                  : "Llena los campos para crear una bodega"}
              </Text>

              <VStack space="lg">
                <Text
                  style={{ fontWeight: "bold", color: "#555", fontSize: 13 }}
                >
                  DATOS DE LA BODEGA
                </Text>

                {/* Código + Nombre */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="code"
                      rules={{ required: "El código es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.code}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Código
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. BOD-02"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCapitalize="characters"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>
                              {errors.code?.message}
                            </FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
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
                              placeholder="Ej. Bodega Central"
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
                </View>

                {/* Tipo + Sucursal */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="type"
                      rules={{ required: "El tipo es obligatorio." }}
                      render={({ field: { onChange, value } }) => (
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
                                value={
                                  WAREHOUSE_TYPE_OPTIONS.find(
                                    (t) => t.value === value,
                                  )?.label || ""
                                }
                              />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper>
                                  <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                {WAREHOUSE_TYPE_OPTIONS.map((t) => (
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
                      )}
                    />
                  </View>
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
                </View>

                {/* Descripción */}
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          Descripción{" "}
                          <Text size="xs" style={{ color: "#999" }}>
                            (opcional)
                          </Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. Bodega principal de inventario"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Input>
                    </FormControl>
                  )}
                />

                {/* Por defecto + Usa zonas */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="is_default"
                      render={({ field: { onChange, value } }) => (
                        <FormControl>
                          <HStack
                            style={{
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <FormControlLabelText style={{ color: "#000" }}>
                              Bodega por defecto
                            </FormControlLabelText>
                            <Switch value={value} onValueChange={onChange} />
                          </HStack>
                        </FormControl>
                      )}
                    />
                  </View>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="uses_zones"
                      render={({ field: { onChange, value } }) => (
                        <FormControl>
                          <HStack
                            style={{
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <FormControlLabelText style={{ color: "#000" }}>
                              Usa zonas
                            </FormControlLabelText>
                            <Switch value={value} onValueChange={onChange} />
                          </HStack>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* ── Zonas (n cantidad) ── */}
                {usesZonesValue && (
                  <View style={styles.zonesSection}>
                    <HStack
                      style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "#555",
                          fontSize: 13,
                        }}
                      >
                        ZONAS ({fields.length})
                      </Text>
                      <Button size="sm" variant="outline" onPress={addZone}>
                        <ButtonText>+ Agregar zona</ButtonText>
                      </Button>
                    </HStack>

                    {fields.length === 0 && (
                      <Text
                        style={{
                          color: "#9ca3af",
                          fontSize: 13,
                          marginBottom: 8,
                        }}
                      >
                        Aún no hay zonas. Agrega al menos una.
                      </Text>
                    )}

                    <VStack space="md">
                      {fields.map((field, index) => {
                        // Opciones de "zona padre": cualquier otra fila del array (no ella misma).
                        // Se referencia por id real si ya existe, o por índice temporal "new-N" si es nueva.
                        const parentOptions = fields
                          .map((f, i) => ({ f, i }))
                          .filter(({ i }) => i !== index)
                          .map(({ f, i }) => {
                            const zoneVal = zonesValue?.[i];
                            const refValue = zoneVal?.id
                              ? String(zoneVal.id)
                              : `new-${i}`;
                            return {
                              value: refValue,
                              label:
                                zoneVal?.name || `Zona sin nombre #${i + 1}`,
                            };
                          });

                        return (
                          <View key={field.id} style={styles.zoneCard}>
                            <HStack
                              style={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#9ca3af",
                                  fontWeight: "600",
                                }}
                              >
                                ZONA #{index + 1}
                              </Text>
                              <Pressable onPress={() => remove(index)}>
                                <Icon
                                  as={TrashIcon}
                                  size="sm"
                                  style={{ color: "#dc2626" }}
                                />
                              </Pressable>
                            </HStack>

                            <View style={row}>
                              <View style={half}>
                                <Controller
                                  control={control}
                                  name={`zones.${index}.name`}
                                  rules={{
                                    required: "El nombre es obligatorio.",
                                  }}
                                  render={({
                                    field: { onChange, onBlur, value },
                                  }) => (
                                    <FormControl
                                      isInvalid={!!errors.zones?.[index]?.name}
                                    >
                                      <FormControlLabel>
                                        <FormControlLabelText
                                          style={{ color: "#000" }}
                                        >
                                          Nombre
                                        </FormControlLabelText>
                                      </FormControlLabel>
                                      <Input>
                                        <InputField
                                          style={{ color: "#171717" }}
                                          placeholder="Ej. Zona A"
                                          value={value}
                                          onChangeText={onChange}
                                          onBlur={onBlur}
                                        />
                                      </Input>
                                      <FormControlError>
                                        <FormControlErrorIcon
                                          as={AlertCircleIcon}
                                        />
                                        <FormControlErrorText>
                                          {errors.zones?.[index]?.name?.message}
                                        </FormControlErrorText>
                                      </FormControlError>
                                    </FormControl>
                                  )}
                                />
                              </View>
                              <View style={half}>
                                <Controller
                                  control={control}
                                  name={`zones.${index}.code`}
                                  rules={{
                                    required: "El código es obligatorio.",
                                  }}
                                  render={({
                                    field: { onChange, onBlur, value },
                                  }) => (
                                    <FormControl
                                      isInvalid={!!errors.zones?.[index]?.code}
                                    >
                                      <FormControlLabel>
                                        <FormControlLabelText
                                          style={{ color: "#000" }}
                                        >
                                          Código
                                        </FormControlLabelText>
                                      </FormControlLabel>
                                      <Input>
                                        <InputField
                                          style={{ color: "#171717" }}
                                          placeholder="Ej. ZA"
                                          value={value}
                                          onChangeText={onChange}
                                          onBlur={onBlur}
                                          autoCapitalize="characters"
                                        />
                                      </Input>
                                      <FormControlError>
                                        <FormControlErrorIcon
                                          as={AlertCircleIcon}
                                        />
                                        <FormControlErrorText>
                                          {errors.zones?.[index]?.code?.message}
                                        </FormControlErrorText>
                                      </FormControlError>
                                    </FormControl>
                                  )}
                                />
                              </View>
                            </View>

                            <View style={[row, { marginTop: 12 }]}>
                              <View style={half}>
                                <Controller
                                  control={control}
                                  name={`zones.${index}.zone_type`}
                                  rules={{
                                    required: "El tipo es obligatorio.",
                                  }}
                                  render={({ field: { onChange, value } }) => (
                                    <FormControl
                                      isInvalid={
                                        !!errors.zones?.[index]?.zone_type
                                      }
                                    >
                                      <FormControlLabel>
                                        <FormControlLabelText
                                          style={{ color: "#000" }}
                                        >
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
                                            value={
                                              ZONE_TYPE_OPTIONS.find(
                                                (t) => t.value === value,
                                              )?.label || ""
                                            }
                                          />
                                        </SelectTrigger>
                                        <SelectPortal>
                                          <SelectBackdrop />
                                          <SelectContent>
                                            <SelectDragIndicatorWrapper>
                                              <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            {ZONE_TYPE_OPTIONS.map((t) => (
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
                                        <FormControlErrorIcon
                                          as={AlertCircleIcon}
                                        />
                                        <FormControlErrorText>
                                          {
                                            errors.zones?.[index]?.zone_type
                                              ?.message
                                          }
                                        </FormControlErrorText>
                                      </FormControlError>
                                    </FormControl>
                                  )}
                                />
                              </View>
                              <View style={half}>
                                <Controller
                                  control={control}
                                  name={`zones.${index}.parent_temp_id`}
                                  render={({ field: { onChange, value } }) => (
                                    <FormControl>
                                      <FormControlLabel>
                                        <FormControlLabelText
                                          style={{ color: "#000" }}
                                        >
                                          Zona padre{" "}
                                          <Text
                                            size="xs"
                                            style={{ color: "#999" }}
                                          >
                                            (opcional)
                                          </Text>
                                        </FormControlLabelText>
                                      </FormControlLabel>
                                      <Select
                                        selectedValue={value}
                                        onValueChange={onChange}
                                      >
                                        <SelectTrigger>
                                          <SelectInput
                                            style={{ color: "#000" }}
                                            placeholder="Ninguna (zona raíz)"
                                            value={
                                              parentOptions.find(
                                                (p) => p.value === value,
                                              )?.label || ""
                                            }
                                          />
                                        </SelectTrigger>
                                        <SelectPortal>
                                          <SelectBackdrop />
                                          <SelectContent>
                                            <SelectDragIndicatorWrapper>
                                              <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            <SelectItem
                                              label="Ninguna (zona raíz)"
                                              value=""
                                            />
                                            {parentOptions.map((p) => (
                                              <SelectItem
                                                key={p.value}
                                                label={p.label}
                                                value={p.value}
                                              />
                                            ))}
                                          </SelectContent>
                                        </SelectPortal>
                                      </Select>
                                    </FormControl>
                                  )}
                                />
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </VStack>
                  </View>
                )}

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
  zonesSection: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
  },
  zoneCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
