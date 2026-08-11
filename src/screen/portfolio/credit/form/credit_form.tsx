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
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCredit } from "@/src/hooks/useCredit/useCredit";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useCustomer } from "@/src/hooks/useCustomer/useCustomer";
import { useAuthStore } from "@/src/store";
import { useCustomerCreditStore } from "@/src/store/useCreditStore/useCreditStore";
import { CreateCredit, CustomerCredit } from "@/src/types/credit/credit";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  customer_id: string;
  has_credit: boolean;
  credit_limit: string;
  payment_term_days: string;
}

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CustomerCreditForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useCredit();
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer();
  const data = useCustomerCreditStore((state) => state.data);
  const isEdit = useCustomerCreditStore((state) => state.isEdit);
  const clearData = useCustomerCreditStore((state) => state.clearData);
  const setIsEdit = useCustomerCreditStore((state) => state.setIsEdit);
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
      customer_id: data?.customer_id ? String(data.customer_id) : "",
      has_credit: data?.has_credit ?? true,
      credit_limit: data?.credit_limit ? String(data.credit_limit) : "",
      payment_term_days: data?.payment_term_days
        ? String(data.payment_term_days)
        : "",
    },
  });

  const hasCreditValue = watch("has_credit");

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    try {
      if (!isEdit) {
        const payload: CreateCredit = {
          customer_id: parseInt(values.customer_id),
          has_credit: values.has_credit,
          credit_limit: parseFloat(values.credit_limit),
          payment_term_days: parseInt(values.payment_term_days),
        };
        await post.mutateAsync(payload);
        showToast({
          message: "Crédito asignado correctamente",
          type: "success",
        });
      } else {
        if (!data?.id) return;
        const payload: CustomerCredit = {
          ...data,
          customer_id: parseInt(values.customer_id),
          has_credit: values.has_credit,
          credit_limit: parseFloat(values.credit_limit),
          payment_term_days: parseInt(values.payment_term_days),
        };
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({
          message: "Crédito editado correctamente",
          type: "success",
        });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el crédito", type: "error" });
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
            <Box
              style={styles.card}
              className="w-full bg-white rounded-[20px] py-8 px-7"
            >
              <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                {isEdit ? "Editar Crédito" : "Asignar Crédito"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica las condiciones de crédito del cliente"
                  : "Asigna condiciones de crédito a un cliente"}
              </Text>

              <VStack space="lg">
                {/* Cliente */}
                <Controller
                  control={control}
                  name="customer_id"
                  rules={{ required: "El cliente es obligatorio." }}
                  render={({ field: { onChange, value } }) => {
                    const selectedLabel =
                      customerData?.find((c) => String(c.id) === value)?.name ||
                      "";

                    return (
                      <FormControl isInvalid={!!errors.customer_id}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>
                            Cliente
                          </FormControlLabelText>
                        </FormControlLabel>
                        {isLoadingCustomer ? (
                          <View style={{ paddingVertical: 10 }}>
                            <ActivityIndicator size="small" />
                          </View>
                        ) : (
                          <Select
                            selectedValue={value}
                            onValueChange={onChange}
                            isDisabled={isEdit}
                          >
                            <SelectTrigger>
                              <SelectInput
                                style={{ color: "#000" }}
                                placeholder="Selecciona un cliente"
                                value={selectedLabel}
                              />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper>
                                  <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                {(customerData ?? []).map((c) => (
                                  <SelectItem
                                    key={c.id}
                                    label={c.name}
                                    value={String(c.id)}
                                  />
                                ))}
                              </SelectContent>
                            </SelectPortal>
                          </Select>
                        )}
                        <FormControlError>
                          <FormControlErrorIcon as={AlertCircleIcon} />
                          <FormControlErrorText>
                            {errors.customer_id?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    );
                  }}
                />

                {/* Tiene crédito */}
                <Controller
                  control={control}
                  name="has_credit"
                  render={({ field: { onChange, value } }) => (
                    <FormControl>
                      <HStack
                        style={{
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <FormControlLabelText style={{ color: "#000" }}>
                          Habilitar crédito
                        </FormControlLabelText>
                        <Switch value={value} onValueChange={onChange} />
                      </HStack>
                    </FormControl>
                  )}
                />

                {/* Límite + Plazo */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="credit_limit"
                      rules={{
                        required: "El límite de crédito es obligatorio.",
                        validate: (v) =>
                          !isNaN(parseFloat(v)) || "Debe ser un número válido.",
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.credit_limit}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Límite de crédito (Q)
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. 500"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="decimal-pad"
                              editable={hasCreditValue}
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>
                              {errors.credit_limit?.message}
                            </FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="payment_term_days"
                      rules={{
                        required: "El plazo de pago es obligatorio.",
                        validate: (v) =>
                          !isNaN(parseInt(v)) || "Debe ser un número entero.",
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.payment_term_days}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Plazo de pago (días)
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. 30"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="number-pad"
                              editable={hasCreditValue}
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>
                              {errors.payment_term_days?.message}
                            </FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* Info de solo lectura al editar: disponible / usado los calcula el servidor */}
                {isEdit && data && (
                  <View style={styles.readonlyBox}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      Calculado por el sistema (no editable aquí)
                    </Text>
                    <HStack style={{ justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 13, color: "#111827" }}>
                        Disponible
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#16a34a",
                          fontWeight: "600",
                        }}
                      >
                        {formatCurrency(data.credit_available)}
                      </Text>
                    </HStack>
                    <HStack
                      style={{ justifyContent: "space-between", marginTop: 4 }}
                    >
                      <Text style={{ fontSize: 13, color: "#111827" }}>
                        Usado
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#dc2626",
                          fontWeight: "600",
                        }}
                      >
                        {formatCurrency(data.credit_used)}
                      </Text>
                    </HStack>
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
  readonlyBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
