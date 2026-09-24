import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCredit } from "@/src/hooks/useCredit/useCredit";
import { useCustomer } from "@/src/hooks/useCustomer/useCustomer";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useAuthStore } from "@/src/store";
import { useCustomerCreditStore } from "@/src/store/useCreditStore/useCreditStore";
import { CreateCredit, CustomerCredit } from "@/src/types/credit/credit";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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

export default function CustomerCreditForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put, NoCreditData, isLoadingNoCredit } = useCredit();
  const { data: CustomerData, isLoading: isLoadingCustomers } = useCustomer();

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

  // En edición: el cliente ya tiene crédito, así que no aparece en
  // NoCreditData (que es la lista de clientes SIN crédito). Para
  // poder mostrar su nombre correctamente, usamos el listado
  // completo de clientes (useCustomer) cuando isEdit es true.
  const customerList = isEdit ? CustomerData : NoCreditData;

  // Se pasa la lista completa; AppSelect normaliza y filtra
  // internamente por lo que el usuario escriba en el buscador.
  const customerOptions = useMemo(() => {
    const list = customerList ?? [];
    return list.map((c) => ({
      label: c.name,
      value: String(c.id),
    }));
  }, [customerList]);

  const isLoadingCustomerOptions = isEdit
    ? isLoadingCustomers
    : isLoadingNoCredit;

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
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <DesktopScrollView>
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
                    render={({ field: { onChange, value } }) => (
                      <AppSelect
                        label="Cliente"
                        placeholder="Selecciona un cliente"
                        searchPlaceholder="Buscar por nombre..."
                        options={customerOptions}
                        value={value}
                        onChange={onChange}
                        isDisabled={isEdit}
                        isLoading={isLoadingCustomerOptions}
                        errorMessage={errors.customer_id?.message}
                      />
                    )}
                  />

                  {/* Tiene crédito */}
                  {/* <Controller
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
                  /> */}

                  {/* Límite + Plazo */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="credit_limit"
                        rules={{
                          required: "El límite de crédito es obligatorio.",
                          validate: (v) =>
                            !isNaN(parseFloat(v)) ||
                            "Debe ser un número válido.",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Límite de crédito (Q)"
                            placeholder="Ej. 500"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="decimal-pad"
                            editable={hasCreditValue}
                            errorMessage={errors.credit_limit?.message}
                          />
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
                          <AppInput
                            label="Plazo de pago (días)"
                            placeholder="Ej. 30"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="number-pad"
                            editable={hasCreditValue}
                            errorMessage={errors.payment_term_days?.message}
                          />
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
                        style={{
                          justifyContent: "space-between",
                          marginTop: 4,
                        }}
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
  readonlyBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
