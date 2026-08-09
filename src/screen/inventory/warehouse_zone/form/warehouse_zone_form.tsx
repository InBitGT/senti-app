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
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useWarehouseZone } from "@/src/hooks/useWarehouseZone/useWarehouseZone";
import { useAuthStore } from "@/src/store";
import { useWarehouseZoneStore } from "@/src/store/useWahouseZoneStore/useWahouseZoneStore";
import {
  CreateWarehouseZone,
  WarehouseZone,
  ZONE_TYPE_OPTIONS,
} from "@/src/types/warehouse_zone/warehouse_zone";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
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
  name: string;
  code: string;
  zone_type: string;
  parent_zone_id: string;
}

export default function WarehouseZoneForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const warehouseIdFromStore = useWarehouseZoneStore(
    (state) => state.warehouseId,
  );
  const data = useWarehouseZoneStore((state) => state.data);
  const isEdit = useWarehouseZoneStore((state) => state.isEdit);
  const clearData = useWarehouseZoneStore((state) => state.clearData);
  const setIsEdit = useWarehouseZoneStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  // Todas las bodegas a las que el usuario tiene acceso, según sus claims.
  const claimsWarehouses = useMemo(() => {
    if (!claims?.branches) return [];
    return claims.branches.flatMap((b) => b.warehouses);
  }, [claims]);

  // Si el store no trae warehouseId (ej. se entró directo al form sin pasar por
  // la pantalla de selección), y el usuario solo tiene acceso a 1 bodega, se
  // toma esa automáticamente.
  const warehouseId =
    warehouseIdFromStore ??
    (claimsWarehouses.length === 1
      ? claimsWarehouses[0].warehouse_id
      : undefined);

  const { post, put, data: zonesInWarehouse } = useWarehouseZone(warehouseId);

  // Candidatas a "zona padre": zonas de la misma bodega, excluyendo la que se está editando
  // (para no poder elegirse a sí misma como su propio padre).
  const parentOptions = (zonesInWarehouse ?? []).filter(
    (z) => z.id !== data?.id,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: data?.name || "",
      code: data?.code || "",
      zone_type: data?.zone_type || "zone",
      parent_zone_id: data?.parent_zone_id ? String(data.parent_zone_id) : "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!warehouseId) {
      showToast({
        message: "No se pudo determinar la bodega para esta zona.",
        type: "error",
      });
      return;
    }

    try {
      if (!isEdit) {
        const payload: CreateWarehouseZone = {
          warehouse_id:
            typeof warehouseId === "string"
              ? parseInt(warehouseId)
              : warehouseId,
          parent_zone_id: values.parent_zone_id
            ? parseInt(values.parent_zone_id)
            : null,
          name: values.name.trim(),
          code: values.code.trim(),
          zone_type: values.zone_type,
        };
        await post.mutateAsync(payload);
        showToast({ message: "Zona creada correctamente", type: "success" });
      } else {
        if (!data?.id) return;
        const payload: WarehouseZone = {
          ...data,
          parent_zone_id: values.parent_zone_id
            ? parseInt(values.parent_zone_id)
            : null,
          name: values.name.trim(),
          code: values.code.trim(),
          zone_type: values.zone_type,
        };
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({ message: "Zona editada correctamente", type: "success" });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar la zona", type: "error" });
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
                {isEdit ? "Editar Zona" : "Nueva Zona"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica los campos para editar la zona"
                  : "Llena los campos para crear una zona en esta bodega"}
              </Text>

              <VStack space="lg">
                {/* Nombre + Código */}
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
                              placeholder="Ej. Zona A"
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
                              placeholder="Ej. ZA"
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
                </View>

                {/* Tipo + Zona padre */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="zone_type"
                      rules={{ required: "El tipo es obligatorio." }}
                      render={({ field: { onChange, value } }) => (
                        <FormControl isInvalid={!!errors.zone_type}>
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
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>
                              {errors.zone_type?.message}
                            </FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="parent_zone_id"
                      render={({ field: { onChange, value } }) => {
                        const selectedLabel =
                          parentOptions.find((z) => String(z.id) === value)
                            ?.name || "";

                        return (
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>
                                Zona padre{" "}
                                <Text size="xs" style={{ color: "#999" }}>
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
                                  value={selectedLabel}
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
                                  {parentOptions.map((z) => (
                                    <SelectItem
                                      key={z.id}
                                      label={z.name}
                                      value={String(z.id)}
                                    />
                                  ))}
                                </SelectContent>
                              </SelectPortal>
                            </Select>
                          </FormControl>
                        );
                      }}
                    />
                  </View>
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
});
