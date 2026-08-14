// payment_form.tsx
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
import { AlertCircleIcon } from "@/components/ui/icon";
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
import { useCredit } from "@/src/hooks/useCredit/useCredit";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useLoanPayments } from "@/src/hooks/useLoanPayments/useLoanPayments";
import { useAuthStore } from "@/src/store";
import { CheckCircle2 } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  amount: string;
  user_id: string;
  payment_term_days: string;
  description: string;
}

export interface PaymentDetail {
  amount: number;
  user_id?: number;
  payment_term_days: number;
  description: string;
}

interface PaymentResult {
  reference: string;
  payment: PaymentDetail;
  clientName?: string;
}

const currencyFormat = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function LoanPaymentForm() {
  const { post } = useLoanPayments();
  const { data: clients, isLoading: isLoadingClients } = useCredit();
  const { claims } = useAuthStore();
  const { showToast } = useCustomToast();
  const [result, setResult] = useState<PaymentResult | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      amount: "",
      user_id: "",
      payment_term_days: "",
      description: "",
    },
  });

  // Cliente seleccionado actualmente, para saber su saldo pendiente (credit_used)
  // y decidir si se puede confirmar el abono.
  const selectedUserId = useWatch({ control, name: "user_id" });
  const selectedClient = clients?.find(
    (c) => String(c.customer_id) === selectedUserId,
  );
  const hasNoPendingDebt = !!selectedClient && selectedClient.credit_used === 0;

  const onSubmit = async (values: FormValues) => {
    const payload: PaymentDetail = {
      amount: parseFloat(values.amount),
      user_id: claims?.sub,
      payment_term_days: parseInt(values.payment_term_days),
      description: values.description.trim(),
    };

    try {
      const response = await post.mutateAsync({
        idCustomer: values.user_id,
        data: payload,
      });
      const client = clients?.find(
        (c) => String(c.customer_id) === values.user_id,
      );
      setResult({
        reference: response?.description ?? "",
        payment: payload,
        clientName: client?.customer.name ?? "Cliente no encontrado",
      });
      showToast({ message: "Abono registrado correctamente", type: "success" });
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al registrar el abono", type: "error" });
    }
  };

  const handleRegisterAnother = () => {
    setResult(null);
    reset();
  };

  // ── Pantalla de éxito ──
  if (result) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
            <DesktopScrollView>
              <Center style={{ flex: 1 }}>
                <Box
                  style={styles.card}
                  className="w-full bg-white rounded-[20px] py-8 px-7"
                >
                  <Center>
                    <View style={styles.successIcon}>
                      <CheckCircle2 size={28} color="#16a34a" />
                    </View>
                    <Heading
                      style={{ color: "#000" }}
                      size="lg"
                      className="mb-1"
                    >
                      Abono registrado
                    </Heading>
                    <Text size="sm" className="text-typography-400 mb-6">
                      Referencia {result.reference || "—"}
                    </Text>
                  </Center>

                  <VStack space="sm" style={{ width: "100%" }}>
                    <HStack style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Monto abonado</Text>
                      <Text style={styles.summaryValue}>
                        {currencyFormat(result.payment.amount)}
                      </Text>
                    </HStack>
                    <HStack style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Cliente</Text>
                      <Text style={styles.summaryValue}>
                        {result.clientName ?? `#${result.payment.user_id}`}
                      </Text>
                    </HStack>
                    <HStack
                      style={{ ...styles.summaryRow, borderBottomWidth: 0 }}
                    >
                      <Text style={styles.summaryLabel}>Nuevo plazo</Text>
                      <Text style={styles.summaryValue}>
                        {result.payment.payment_term_days} días
                      </Text>
                    </HStack>
                    {!!result.payment.description && (
                      <VStack style={{ marginTop: 8 }}>
                        <Text style={styles.summaryLabel}>Descripción</Text>
                        <Text
                          style={{
                            color: "#171717",
                            fontSize: 14,
                            marginTop: 2,
                          }}
                        >
                          {result.payment.description}
                        </Text>
                      </VStack>
                    )}
                  </VStack>

                  <Button
                    variant="outline"
                    size="lg"
                    className="mt-6 w-full"
                    onPress={handleRegisterAnother}
                  >
                    <ButtonText>Registrar otro abono</ButtonText>
                  </Button>
                </Box>
              </Center>
            </DesktopScrollView>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ── Formulario ──
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
            <VStack>
              <Box
                style={styles.card}
                className="w-full bg-white rounded-[20px] py-8 px-7"
              >
                <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                  Abonar a mi crédito
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  Completa los datos para registrar un abono a tu crédito.
                </Text>

                <VStack space="lg">
                  {/* Cliente (get a useCredit) */}
                  <Controller
                    control={control}
                    name="user_id"
                    rules={{ required: "Selecciona un cliente." }}
                    render={({ field: { onChange, value } }) => {
                      const selectedLabel =
                        clients?.find((c) => String(c.customer_id) === value)
                          ?.customer.name || "";
                      return (
                        <FormControl isInvalid={!!errors.user_id}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Cliente
                            </FormControlLabelText>
                          </FormControlLabel>
                          {isLoadingClients ? (
                            <View style={{ paddingVertical: 10 }}>
                              <ActivityIndicator size="small" />
                            </View>
                          ) : (
                            <Select
                              selectedValue={value}
                              onValueChange={onChange}
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
                                  {(clients ?? []).map((c) => (
                                    <SelectItem
                                      key={c.customer_id}
                                      label={c.customer.name}
                                      value={String(c.customer_id)}
                                    />
                                  ))}
                                </SelectContent>
                              </SelectPortal>
                            </Select>
                          )}
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>
                              {errors.user_id?.message}
                            </FormControlErrorText>
                          </FormControlError>
                          {selectedClient && (
                            <HStack
                              style={{
                                ...styles.debtBox,
                                ...(hasNoPendingDebt && styles.debtBoxOk),
                              }}
                            >
                              <Text
                                style={{
                                  ...styles.debtLabel,
                                  ...(hasNoPendingDebt && styles.debtLabelOk),
                                }}
                              >
                                {hasNoPendingDebt
                                  ? "Este cliente no tiene saldo pendiente"
                                  : "Saldo pendiente"}
                              </Text>
                              <Text
                                style={[
                                  styles.debtValue,
                                  hasNoPendingDebt && styles.debtLabelOk,
                                ]}
                              >
                                {currencyFormat(selectedClient.credit_used)}
                              </Text>
                            </HStack>
                          )}
                        </FormControl>
                      );
                    }}
                  />

                  {/* Monto */}
                  <Controller
                    control={control}
                    name="amount"
                    rules={{
                      required: "El monto es obligatorio.",
                      validate: (v) =>
                        (Number.isFinite(parseFloat(v)) && parseFloat(v) > 0) ||
                        "Ingresa un monto válido mayor a 0.",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl isInvalid={!!errors.amount}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>
                            Monto a abonar
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input>
                          <InputField
                            style={{ color: "#171717" }}
                            placeholder="Ej. 300.00"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="decimal-pad"
                          />
                        </Input>
                        <FormControlError>
                          <FormControlErrorIcon as={AlertCircleIcon} />
                          <FormControlErrorText>
                            {errors.amount?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />

                  {/* Plazo en días */}
                  <Controller
                    control={control}
                    name="payment_term_days"
                    rules={{
                      required: "El plazo es obligatorio.",
                      validate: (v) =>
                        (Number.isInteger(parseInt(v)) && parseInt(v) >= 0) ||
                        "Ingresa un plazo en días válido.",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl isInvalid={!!errors.payment_term_days}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>
                            Aplazar el tiempo de pago (días)
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input>
                          <InputField
                            style={{ color: "#171717" }}
                            placeholder="Ej. 15"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="number-pad"
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

                  {/* Descripción */}
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl isInvalid={!!errors.description}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>
                            Descripción{" "}
                            <Text size="xs" style={{ color: "#999" }}>
                              (opcional)
                            </Text>
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Textarea>
                          <TextareaInput
                            style={{ color: "#171717" }}
                            placeholder="Ej. Pago parcial, nuevo plazo acordado"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                          />
                        </Textarea>
                      </FormControl>
                    )}
                  />

                  <Button
                    size="lg"
                    className="mt-2 w-full mb-6"
                    onPress={handleSubmit(onSubmit)}
                    disabled={post.isPending || hasNoPendingDebt}
                  >
                    {post.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ButtonText>
                        {hasNoPendingDebt
                          ? "Sin saldo pendiente"
                          : "Confirmar abono"}
                      </ButtonText>
                    )}
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </DesktopScrollView>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E6F1FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
    paddingTop: 4,
  },
  summaryLabel: { fontSize: 13, color: "#6b7280" },
  summaryValue: { fontSize: 14, fontWeight: "500", color: "#111827" },
  debtBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FAEEDA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  debtBoxOk: {
    backgroundColor: "#dcfce7",
  },
  debtLabel: { fontSize: 13, color: "#633806" },
  debtLabelOk: { color: "#166534" },
  debtValue: { fontSize: 14, fontWeight: "600", color: "#633806" },
});
