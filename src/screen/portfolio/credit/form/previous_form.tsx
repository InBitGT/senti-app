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
import { Icon } from "@/components/ui/icon";
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
import { useCustomer } from "@/src/hooks/useCustomer/useCustomer";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useAuthStore } from "@/src/store";
import { CreatePreviousCredit } from "@/src/types/credit/credit";
import { useRouter } from "expo-router";
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react-native";
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
  user_id: string;
  amount: string;
  description: string;
}

export default function PreviousCreditForm() {
  const router = useRouter();
  const { previousCredit } = useCredit();
  const { data: users, isLoading: isLoadingUsers } = useCustomer();
  const { showToast } = useCustomToast();
  const { claims } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      user_id: "",
      amount: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;
    const payload: CreatePreviousCredit = {
      amount: parseFloat(values.amount),
      user_id: claims.sub,
      description: values.description.trim(),
    };

    try {
      await previousCredit.mutateAsync({
        data: payload,
        idCustomer: parseInt(values.user_id),
      });
      showToast({
        message: "Préstamo previo registrado correctamente",
        type: "success",
      });
      router.back();
    } catch (error) {
      console.log(error);
      showToast({
        message: "Error al registrar el préstamo previo",
        type: "error",
      });
    }
  };

  const isPending = previousCredit.isPending;

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
          <DesktopScrollView>
            <Pressable
              onPress={() => router.back()}
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
                  Adjuntar préstamo previo
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  Registra un préstamo/crédito existente y adjúntalo al usuario
                  correspondiente.
                </Text>

                <VStack space="lg">
                  {/* Usuario al que se le adjunta el préstamo */}
                  <Controller
                    control={control}
                    name="user_id"
                    rules={{ required: "Selecciona el usuario." }}
                    render={({ field: { onChange, value } }) => {
                      const selectedLabel =
                        users?.find((u) => String(u.id) === value)?.name || "";

                      return (
                        <FormControl isInvalid={!!errors.user_id}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Usuario
                            </FormControlLabelText>
                          </FormControlLabel>
                          {isLoadingUsers ? (
                            <ActivityIndicator
                              size="small"
                              style={{ marginVertical: 10 }}
                            />
                          ) : (
                            <Select
                              selectedValue={value}
                              onValueChange={onChange}
                            >
                              <SelectTrigger>
                                <SelectInput
                                  style={{ color: "#000" }}
                                  placeholder="Selecciona un usuario"
                                  value={selectedLabel}
                                />
                              </SelectTrigger>
                              <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                  <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                  </SelectDragIndicatorWrapper>
                                  {(users ?? []).map((u) => (
                                    <SelectItem
                                      key={u.id}
                                      label={u.name}
                                      value={String(u.id)}
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
                            Monto
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input>
                          <InputField
                            style={{ color: "#171717" }}
                            placeholder="Ej. 100.00"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.replace(/[^0-9.]/g, ""))
                            }
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

                  {/* Descripción */}
                  <Controller
                    control={control}
                    name="description"
                    rules={{ required: "La descripción es obligatoria." }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl isInvalid={!!errors.description}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>
                            Descripción
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Textarea>
                          <TextareaInput
                            style={{ color: "#171717" }}
                            placeholder="Ej. Corrección de abono ingresado por error"
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
                      onPress={() => router.back()}
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
                      {isPending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <ButtonText>Guardar</ButtonText>
                      )}
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
