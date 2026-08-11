// UnitForm.tsx
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
import { AlertCircleIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useUnit } from "@/src/hooks/useUniitMeasure/useUniitMeasure";
import { useAuthStore } from "@/src/store";
import { useUnitStore } from "@/src/store/useUnitMeasure/useUnitMeasureStore";
import { UnitOfMeasure } from "@/src/types/unit_measure/unit_measure.types";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, ChevronDown } from "lucide-react-native";
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
  code: string;
  uom_type: string;
}

const UOM_TYPES = [
  { label: "Unidad", value: "unit" },
  { label: "Peso", value: "weight" },
  { label: "Volumen", value: "volume" },
  { label: "Longitud", value: "length" },
];

export default function UnitForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put, isLoading } = useUnit();
  const data = useUnitStore((state) => state.data);
  const isEdit = useUnitStore((state) => state.isEdit);
  const clearData = useUnitStore((state) => state.clearData);
  const setIsEdit = useUnitStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: data?.name || "",
      code: data?.code || "",
      uom_type: data?.uom_type || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const payload = {
      tenant_id: claims.tenant_id,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      uom_type: values.uom_type,
    } as UnitOfMeasure;

    try {
      if (!isEdit) {
        await post.mutateAsync(payload);
        showToast({ message: "Se agregó una nueva unidad", type: "success" });
      } else {
        if (!data?.id) return;
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({ message: "Se editó la unidad", type: "success" });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar la unidad", type: "error" });
    }
  };
  if (isLoading) {
    return (
      <Center style={{ flex: 1 }}>
        <ActivityIndicator size="large" />
        <Text>Cargando unidades...</Text>
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
          <DesktopScrollView>
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
              <Box
                style={styles.card}
                className="w-full bg-white rounded-[20px] py-8 px-7"
              >
                <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                  {isEdit ? "Editar Unidad" : "Nueva Unidad"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar la unidad de medida"
                    : "Llena los campos para crear una unidad de medida"}
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
                            placeholder="Ej. Caja"
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
                    rules={{
                      required: "El código es obligatorio.",
                      maxLength: {
                        value: 10,
                        message: "Máximo 10 caracteres.",
                      },
                    }}
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
                            placeholder="Ej. CJ"
                            value={value}
                            onChangeText={(text) =>
                              onChange(text.toUpperCase())
                            }
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

                  {/* Tipo de unidad */}
                  <Controller
                    control={control}
                    name="uom_type"
                    rules={{
                      required: "El tipo de unidad es obligatorio.",
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormControl isInvalid={!!errors.uom_type}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>
                            Tipo de unidad
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Select selectedValue={value} onValueChange={onChange}>
                          <SelectTrigger className="rounded-lg h-11">
                            <SelectInput
                              placeholder="Selecciona un tipo"
                              style={{ color: "#000000" }}
                              className="text-black"
                            />
                            <SelectIcon
                              as={ChevronDown}
                              className="mr-3 text-gray-400"
                            />
                          </SelectTrigger>
                          <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent className="bg-white text-black">
                              <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                              </SelectDragIndicatorWrapper>
                              {UOM_TYPES.map((type) => (
                                <SelectItem
                                  key={type.value}
                                  label={type.label}
                                  value={type.value}
                                  className="text-black"
                                />
                              ))}
                            </SelectContent>
                          </SelectPortal>
                        </Select>
                        <FormControlError>
                          <FormControlErrorIcon as={AlertCircleIcon} />
                          <FormControlErrorText>
                            {errors.uom_type?.message}
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
                          : "Guardar Unidad"}
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
