// payment_form.tsx
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCredit } from "@/src/hooks/useCredit/useCredit";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useLoanPayments } from "@/src/hooks/useLoanPayments/useLoanPayments";
import { useAuthStore } from "@/src/store";
import { useDimensions } from "@/src/utils/dimentions/dimentions";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";
import { CheckCircle2 } from "lucide-react-native";
import { useMemo, useState } from "react";
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

export default function LoanPaymentForm() {
  const { post } = useLoanPayments();
  const { data: clients, isLoading: isLoadingClients } = useCredit();
  const { claims } = useAuthStore();
  const { showToast } = useCustomToast();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const desktop = useDimensions();

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

  // Se pasa la lista completa; AppSelect normaliza y filtra
  // internamente por lo que el usuario escriba en el buscador.
  const clientOptions = useMemo(() => {
    const list = clients ?? [];
    return list.map((c) => ({
      label: c.customer.name,
      value: String(c.customer_id),
    }));
  }, [clients]);

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
        <SafeAreaView className="flex-1" edges={["top"]} style={{ flex: 1 }}>
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
                        {formatCurrency(result.payment.amount)}
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
      <SafeAreaView className="flex-1" edges={["top"]}>
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
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <AppSelect
                          label="Cliente"
                          placeholder="Selecciona un cliente"
                          searchPlaceholder="Buscar por nombre..."
                          options={clientOptions}
                          value={value}
                          onChange={onChange}
                          isLoading={isLoadingClients}
                          errorMessage={errors.user_id?.message}
                        />
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
                                ...(desktop ? { margin: 10 } : { margin: 3 }),
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
                                { margin: desktop ? 10 : 3 },
                              ]}
                            >
                              {formatCurrency(selectedClient.credit_used)}
                            </Text>
                          </HStack>
                        )}
                      </View>
                    )}
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
                      <AppInput
                        label="Monto a abonar"
                        placeholder="Ej. 300.00"
                        value={value}
                        onChangeText={(t) =>
                          onChange(t.replace(/[^0-9.]/g, ""))
                        }
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                        errorMessage={errors.amount?.message}
                      />
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
                      <AppInput
                        label="Aplazar el tiempo de pago (días)"
                        placeholder="Ej. 15"
                        value={value}
                        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        errorMessage={errors.payment_term_days?.message}
                      />
                    )}
                  />

                  {/* Descripción */}
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Descripción (opcional)"
                        placeholder="Ej. Pago parcial, nuevo plazo acordado"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        textareaHeight={90}
                      />
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
  debtLabel: { fontSize: 13, color: "#633806", margin: 5 },
  debtLabelOk: { color: "#166534" },
  debtValue: { fontSize: 14, fontWeight: "600", color: "#633806", margin: 5 },
});
