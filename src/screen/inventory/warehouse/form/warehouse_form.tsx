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
} from "@/src/types/warehouse/warehouse.types";
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
  code: string;
  name: string;
  type: string;
  description: string;
  branch_id: string;
  is_default: boolean;
  uses_zones: boolean;
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

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      code: data?.code || "",
      name: data?.name || "",
      type: data?.type || "",
      description: data?.description || "",
      branch_id: claims?.branch_id ? String(claims?.branch_id) : "",
      is_default: data?.is_default ?? false,
      uses_zones: data?.uses_zones ?? false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload: WarehousePayload = {
      branch_id: parseInt(values.branch_id),
      code: values.code.trim(),
      name: values.name.trim(),
      type: values.type,
      description: values.description.trim(),
      is_default: values.is_default,
      uses_zones: values.uses_zones,
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
                  {/* <View style={half}>
                    <Controller
                      control={control}
                      name="branch_id"
                      rules={{ required: "La sucursal es obligatoria." }}
                      render={({ field: { onChange, value } }) => {
                        const selectedLabel =
                          branchData?.find((b) => String(b.id) === value)?.name || "";

                        return (
                          <FormControl isInvalid={!!errors.branch_id}>
                            <FormControlLabel>
                              <FormControlLabelText style={{ color: "#000" }}>Sucursal</FormControlLabelText>
                            </FormControlLabel>
                            {isLoadingData ? (
                              <View style={{ paddingVertical: 10 }}>
                                <ActivityIndicator size="small" />
                              </View>
                            ) : (
                              <Select selectedValue={value} onValueChange={onChange}>
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
                                    {(branchData ?? []).map((b) => (
                                      <SelectItem key={b.id} label={b.name} value={String(b.id)} />
                                    ))}
                                  </SelectContent>
                                </SelectPortal>
                              </Select>
                            )}
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircleIcon} />
                              <FormControlErrorText>{errors.branch_id?.message}</FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        );
                      }}
                    />
                  </View> */}
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
