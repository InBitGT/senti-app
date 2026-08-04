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
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useCustomerType } from "@/src/hooks/useCustomerType/useCustomerType";
import { useAuthStore } from "@/src/store";
import { useCustomerTypeStore } from "@/src/store/useCustomerTypeStore/useCustomerTypeStore";
import {
    CreateCustomerType,
    CustomerType,
} from "@/src/types/customer_type/customer_type";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  name: string;
  description: string;
}

export default function CustomerTypeForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useCustomerType();
  const data = useCustomerTypeStore((state) => state.data);
  const isEdit = useCustomerTypeStore((state) => state.isEdit);
  const clearData = useCustomerTypeStore((state) => state.clearData);
  const setIsEdit = useCustomerTypeStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    try {
      if (!isEdit) {
        const payload: CreateCustomerType = {
          tenant_id: claims.tenant_id,
          name: values.name.trim(),
          description: values.description.trim(),
        };
        await post.mutateAsync(payload);
        showToast({
          message: "Tipo de cliente creado correctamente",
          type: "success",
        });
      } else {
        if (!data?.id) return;
        const payload: CustomerType = {
          ...data,
          name: values.name.trim(),
          description: values.description.trim(),
        };
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({
          message: "Tipo de cliente editado correctamente",
          type: "success",
        });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({
        message: "Error al guardar el tipo de cliente",
        type: "error",
      });
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
                {isEdit ? "Editar Tipo de Cliente" : "Nuevo Tipo de Cliente"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica los campos para editar el tipo de cliente"
                  : "Llena los campos para crear un tipo de cliente"}
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
                          placeholder="Ej. Persona Natural"
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
                          placeholder="Ej. Clientes individuales sin razón social"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Input>
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
