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
import { useProduct } from "@/src/hooks/useProduct/useProduct";
import { useProductWholesale } from "@/src/hooks/useWholesale/useWholesale";
import { useAuthStore } from "@/src/store";
import { useProductWholesaleStore } from "@/src/store/useWholesaleStore/useWholesaleStore";
import {
  CreateProductWholesaleRule,
  ProductWholesaleRule,
} from "@/src/types/wholesale/wholesale";
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

  const productOptions = useMemo(
    () =>
      (productData ?? []).map((p) => ({
        label: `${p.name} (${p.sku})`,
        value: String(p.id),
      })),
    [productData],
  );

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
                    render={({ field: { onChange, value } }) => (
                      <AppSelect
                        label="Producto"
                        placeholder="Selecciona un producto"
                        searchable
                        searchPlaceholder="Buscar producto..."
                        options={productOptions}
                        value={value}
                        onChange={onChange}
                        isLoading={isLoadingProduct}
                        errorMessage={errors.product_id?.message}
                      />
                    )}
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
                      <AppInput
                        label="Cantidad mínima"
                        placeholder="Ej. 10"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        errorMessage={errors.min_quantity?.message}
                      />
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
                      <AppInput
                        label="Descuento (%)"
                        placeholder="Ej. 10"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                        errorMessage={errors.discount_percentage?.message}
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
