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
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useSupplier } from "@/src/hooks/useSupplier/useSupplier";
import { useAuthStore } from "@/src/store";
import { useSupplierStore } from "@/src/store/useSupplierStore/useSupplierStore";
import { SupplierDetail } from "@/src/types/supplier/supplier.types";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  name: string;
  description: string;
  nit: string;
  phone: string;
  email: string;
  contact_name: string;
}

export default function SupplierForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, supplier, put } = useSupplier();
  const data = useSupplierStore((state) => state.data);
  const isEdit = useSupplierStore((state) => state.isEdit);
  const clearData = useSupplierStore((state) => state.clearData);
  const setIsEdit = useSupplierStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      nit: data?.nit || "",
      phone: data?.phone || "",
      email: data?.email || "",
      contact_name: data?.contact_name || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload: SupplierDetail = {
      tenant_id: claims.tenant_id,
      address_id: null,
      name: values.name.trim(),
      description: values.description.trim(),
      nit: values.nit.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      contact_name: values.contact_name.trim(),
    };

    try {
      if (!isEdit) {
        await post.mutateAsync(payload);
        showToast({ message: "Se agregó un nuevo proveedor", type: "success" });
      } else {
        if (!data?.id) return;
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({ message: "Se editó el proveedor", type: "success" });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el proveedor", type: "error" });
    }
  };

  if (supplier.isLoading) {
    return (
      <Center style={{ flex: 1 }}>
        <ActivityIndicator size="large" />
        <Text>Cargando proveedores...</Text>
      </Center>
    );
  }

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
          {/* Botón regresar */}
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
                {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica los campos para editar el proveedor"
                  : "Llena los campos para crear un proveedor"}
              </Text>

              <VStack space="lg">
                {/* Nombre */}
                <Controller
                  control={control}
                  name="name"
                  rules={{
                    required: "El nombre es obligatorio.",
                    minLength: { value: 2, message: "Mínimo 2 caracteres." },
                  }}
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
                          placeholder="Ej. Distribuidora ABC"
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

                {/* NIT */}
                <Controller
                  control={control}
                  name="nit"
                  rules={{
                    required: "El NIT es obligatorio.",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.nit}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          NIT
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. 123456-7"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.nit?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Teléfono */}
                <Controller
                  control={control}
                  name="phone"
                  rules={{
                    required: "El teléfono es obligatorio.",
                    minLength: { value: 8, message: "Mínimo 8 dígitos." },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.phone}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          Teléfono
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. 5555-1234"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="phone-pad"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.phone?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Email */}
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "El correo es obligatorio.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Correo no válido.",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.email}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          Correo electrónico
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. proveedor@email.com"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.email?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Nombre de contacto */}
                <Controller
                  control={control}
                  name="contact_name"
                  rules={{
                    required: "El nombre de contacto es obligatorio.",
                    minLength: { value: 2, message: "Mínimo 2 caracteres." },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.contact_name}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          Nombre de contacto
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. Juan Pérez"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.contact_name?.message}
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
                          Descripción (opcional)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Textarea>
                        <TextareaInput
                          style={{ color: "#171717" }}
                          placeholder="Información adicional del proveedor..."
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Textarea>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.description?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
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
                    disabled={post.isPending || put.isPending}
                  >
                    <ButtonText>
                      {post.isPending || put.isPending
                        ? "Guardando..."
                        : "Guardar Proveedor"}
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
});