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
import { useCashRegister } from "@/src/hooks/useCashRegister/useCashRegister";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useAuthStore } from "@/src/store";
import { useCashRegisterStore } from "@/src/store/useCashRegisterStore/useCashRegisterStore";
import {
  CashRegister,
  CreateCashRegister,
} from "@/src/types/cash_register/cash_register";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WarehouseOption {
  id: number;
  label: string;
}

interface FormValues {
  name: string;
  code: string;
  warehouse_id: string;
}

export default function CashRegisterForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useCashRegister();
  const data = useCashRegisterStore((state) => state.data);
  const isEdit = useCashRegisterStore((state) => state.isEdit);
  const clearData = useCashRegisterStore((state) => state.clearData);
  const setIsEdit = useCashRegisterStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();

  // Todas las bodegas a las que el usuario tiene acceso, según el token (claims.branches).
  const warehouseOptions: WarehouseOption[] = React.useMemo(() => {
    if (!claims?.branches) return [];
    return claims.branches.flatMap((branch) =>
      branch.warehouses.map((w) => ({
        id: w.warehouse_id,
        label: `${branch.branch_name} - ${w.warehouse_name}`,
      })),
    );
  }, [claims]);

  // Si el usuario solo tiene acceso a 1 bodega en total (sin importar cuántas
  // sucursales tenga), no se le muestra el select: se toma la única disponible.
  const hideWarehouseInput = warehouseOptions.length === 1;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: data?.name || "",
      code: data?.code || "",
      warehouse_id: data?.warehouse_id
        ? String(data.warehouse_id)
        : hideWarehouseInput
          ? String(warehouseOptions[0]?.id ?? "")
          : "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    try {
      if (!isEdit) {
        const payload: CreateCashRegister = {
          tenant_id: claims.tenant_id,
          warehouse_id: parseInt(values.warehouse_id),
          name: values.name.trim(),
          code: values.code.trim(),
        };
        await post.mutateAsync(payload);
        showToast({ message: "Caja creada correctamente", type: "success" });
      } else {
        if (!data?.id) return;
        const payload: CashRegister = {
          ...data,
          warehouse_id: parseInt(values.warehouse_id),
          name: values.name.trim(),
          code: values.code.trim(),
        };
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({ message: "Caja editada correctamente", type: "success" });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar la caja", type: "error" });
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
                {isEdit ? "Editar Caja" : "Nueva Caja"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica los campos para editar la caja"
                  : "Llena los campos para crear una caja registradora"}
              </Text>

              <VStack space="lg">
                {/* Nombre */}
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
                          placeholder="Ej. Caja Principal"
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

                {/* Código */}
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
                          placeholder="Ej. CAJA-01"
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

                {/* Bodega — solo se muestra si el usuario tiene acceso a más de una */}
                {!hideWarehouseInput && (
                  <Controller
                    control={control}
                    name="warehouse_id"
                    rules={{ required: "La bodega es obligatoria." }}
                    render={({ field: { onChange, value } }) => {
                      const selectedLabel =
                        warehouseOptions.find((w) => String(w.id) === value)
                          ?.label || "";

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
                          >
                            <SelectTrigger>
                              <SelectInput
                                style={{ color: "#000" }}
                                placeholder="Selecciona una bodega"
                                value={selectedLabel}
                              />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper>
                                  <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                {warehouseOptions.map((w) => (
                                  <SelectItem
                                    key={w.id}
                                    label={w.label}
                                    value={String(w.id)}
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
});
