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
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useCustomer } from "@/src/hooks/useCustomer/useCustomer";
import { useCustomerType } from "@/src/hooks/useCustomerType/useCustomerType";
import { useAuthStore } from "@/src/store";
import { useCustomerStore } from "@/src/store/useCustomerStore/useCustomerStore";
import { CreateCustomer, Customer } from "@/src/types/customer/customer";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
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

const DOCUMENT_TYPE_OPTIONS = [
  { value: "DPI", label: "DPI" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
  { value: "OTRO", label: "Otro" },
];

interface FormValues {
  name: string;
  document_type: string;
  document_number: string;
  phone: string;
  email: string;
  address: string;
  customer_type_id: string;
}

export default function CustomerForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useCustomer();
  const { data: customerTypeData, isLoading: isLoadingCustomerType } =
    useCustomerType();
  const data = useCustomerStore((state) => state.data);
  const isEdit = useCustomerStore((state) => state.isEdit);
  const clearData = useCustomerStore((state) => state.clearData);
  const setIsEdit = useCustomerStore((state) => state.setIsEdit);
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
      name: data?.name || "",
      document_type: data?.document_type || "",
      document_number: data?.document_number || "",
      phone: data?.phone || "",
      email: data?.email || "",
      address: data?.address || "",
      customer_type_id: data?.customer_type_id
        ? String(data.customer_type_id)
        : "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    try {
      if (!isEdit) {
        const payload: CreateCustomer = {
          tenant_id: claims.tenant_id,
          customer_type_id: parseInt(values.customer_type_id),
          name: values.name.trim(),
          document_type: values.document_type,
          document_number: values.document_number.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          address: values.address.trim(),
        };
        await post.mutateAsync(payload);
        showToast({ message: "Cliente creado correctamente", type: "success" });
      } else {
        if (!data?.id) return;
        const payload: Customer = {
          ...data,
          customer_type_id: parseInt(values.customer_type_id),
          name: values.name.trim(),
          document_type: values.document_type,
          document_number: values.document_number.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          address: values.address.trim(),
        };
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({
          message: "Cliente editado correctamente",
          type: "success",
        });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el cliente", type: "error" });
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
          <DesktopScrollView useWindowHeight>
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
                  {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar el cliente"
                    : "Llena los campos para crear un cliente"}
                </Text>

                <VStack space="lg">
                  <Text
                    style={{ fontWeight: "bold", color: "#555", fontSize: 13 }}
                  >
                    DATOS DEL CLIENTE
                  </Text>

                  {/* Nombre */}
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "El nombre es obligatorio." }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Nombre"
                        placeholder="Juan Pérez"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorMessage={errors.name?.message}
                      />
                    )}
                  />

                  {/* Tipo de documento + Número */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="document_type"
                        rules={{
                          required: "El tipo de documento es obligatorio.",
                        }}
                        render={({ field: { onChange, value } }) => (
                          <AppSelect
                            label="Tipo de documento"
                            placeholder="Selecciona un tipo"
                            searchable={false}
                            options={DOCUMENT_TYPE_OPTIONS}
                            value={value}
                            onChange={onChange}
                            errorMessage={errors.document_type?.message}
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
                            label="Número de documento"
                            placeholder="1234567890101"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.replace(/[^0-9A-Z-]/g, ""))
                            }
                            onBlur={onBlur}
                            keyboardType="number-pad"
                            errorMessage={errors.document_number?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Teléfono + Email */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="phone"
                        rules={{ required: "El teléfono es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Teléfono"
                            placeholder="12345678"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.replace(/[^0-9.-]/g, ""))
                            }
                            onBlur={onBlur}
                            keyboardType="phone-pad"
                            maxLength={9}
                            errorMessage={errors.phone?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="email"
                        rules={{
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Email inválido.",
                          },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Email"
                            placeholder="Ej. juan.perez@example.com"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            errorMessage={errors.email?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Dirección */}
                  <Controller
                    control={control}
                    name="address"
                    rules={{ required: "La dirección es obligatoria." }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Dirección"
                        placeholder="Ej. Zona 10, Ciudad de Guatemala"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorMessage={errors.address?.message}
                      />
                    )}
                  />

                  {/* Tipo de cliente */}
                  <Controller
                    control={control}
                    name="customer_type_id"
                    rules={{ required: "El tipo de cliente es obligatorio." }}
                    render={({ field: { onChange, value } }) => (
                      <AppSelect
                        label="Tipo de cliente"
                        placeholder="Selecciona un tipo de cliente"
                        searchable={false}
                        options={(customerTypeData ?? []).map((c) => ({
                          label: c.name,
                          value: String(c.id),
                        }))}
                        value={value}
                        onChange={onChange}
                        isLoading={isLoadingCustomerType}
                        errorMessage={errors.customer_type_id?.message}
                      />
                    )}
                  />

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
});
