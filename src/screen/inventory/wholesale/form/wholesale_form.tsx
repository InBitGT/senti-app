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
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useProduct } from "@/src/hooks/useProduct/useProduct";
import { useProductWholesale } from "@/src/hooks/useWholesale/useWholesale";
import { useAuthStore } from "@/src/store";
import { useProductWholesaleStore } from "@/src/store/useWholesaleStore/useWholesaleStore";
import {
    CreateProductWholesaleRule,
    ProductWholesaleRule,
} from "@/src/types/wholesale/wholesale";
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
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  product_id: string;
  min_quantity: string;
  discount_percentage: string;
}

export default function ProductWholesaleForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = useProductWholesale();
  const { data: productData, isLoading: isLoadingProduct } = useProduct();
  const data = useProductWholesaleStore((state) => state.data);
  const isEdit = useProductWholesaleStore((state) => state.isEdit);
  const clearData = useProductWholesaleStore((state) => state.clearData);
  const setIsEdit = useProductWholesaleStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      product_id: data?.product_id ? String(data.product_id) : "",
      min_quantity: data?.min_quantity ? String(data.min_quantity) : "",
      discount_percentage: data?.discount_percentage
        ? String(data.discount_percentage)
        : "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    try {
      if (!isEdit) {
        const payload: CreateProductWholesaleRule = {
          tenant_id: claims.tenant_id,
          product_id: parseInt(values.product_id),
          min_quantity: parseInt(values.min_quantity),
          discount_percentage: parseFloat(values.discount_percentage),
        };
        await post.mutateAsync(payload);
        showToast({
          message: "Descuento creado correctamente",
          type: "success",
        });
      } else {
        if (!data?.id) return;
        const payload: ProductWholesaleRule = {
          ...data,
          product_id: parseInt(values.product_id),
          min_quantity: parseInt(values.min_quantity),
          discount_percentage: parseFloat(values.discount_percentage),
        };
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({
          message: "Descuento editado correctamente",
          type: "success",
        });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el descuento", type: "error" });
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
                {isEdit ? "Editar Descuento" : "Nuevo Descuento por Mayoreo"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica la regla de descuento por cantidad mínima"
                  : "Define a partir de cuántas unidades aplica el descuento"}
              </Text>

              <VStack space="lg">
                {/* Producto */}
                <Controller
                  control={control}
                  name="product_id"
                  rules={{ required: "El producto es obligatorio." }}
                  render={({ field: { onChange, value } }) => {
                    const selectedLabel =
                      productData?.find((p) => String(p.id) === value)?.name ||
                      "";

                    return (
                      <FormControl isInvalid={!!errors.product_id}>
                        <FormControlLabel>
                          <FormControlLabelText style={{ color: "#000" }}>
                            Producto
                          </FormControlLabelText>
                        </FormControlLabel>
                        {isLoadingProduct ? (
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
                                placeholder="Selecciona un producto"
                                value={selectedLabel}
                              />
                            </SelectTrigger>
                            <SelectPortal>
                              <SelectBackdrop />
                              <SelectContent>
                                <SelectDragIndicatorWrapper>
                                  <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                {(productData ?? []).map((p) => (
                                  <SelectItem
                                    key={p.id}
                                    label={`${p.name} (${p.sku})`}
                                    value={String(p.id)}
                                  />
                                ))}
                              </SelectContent>
                            </SelectPortal>
                          </Select>
                        )}
                        <FormControlError>
                          <FormControlErrorIcon as={AlertCircleIcon} />
                          <FormControlErrorText>
                            {errors.product_id?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    );
                  }}
                />

                {/* Cantidad mínima */}
                <Controller
                  control={control}
                  name="min_quantity"
                  rules={{
                    required: "La cantidad mínima es obligatoria.",
                    validate: (v) => parseInt(v) > 0 || "Debe ser mayor a 0.",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.min_quantity}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          Cantidad mínima
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. 10"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="number-pad"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.min_quantity?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Descuento % */}
                <Controller
                  control={control}
                  name="discount_percentage"
                  rules={{
                    required: "El porcentaje de descuento es obligatorio.",
                    validate: (v) => {
                      const n = parseFloat(v);
                      return (
                        (n >= 0 && n <= 100) || "Debe estar entre 0 y 100."
                      );
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.discount_percentage}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          Descuento (%)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. 10"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="decimal-pad"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.discount_percentage?.message}
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
