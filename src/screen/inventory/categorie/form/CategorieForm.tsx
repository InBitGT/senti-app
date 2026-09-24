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
import { useCategorie } from "@/src/hooks";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useAuthStore } from "@/src/store";
import { useCategorieStore } from "@/src/store/useCategorieStore";
import { CategoryDetail } from "@/src/types";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
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
  tenant_id: string;
  name: string;
  description: string;
  parent_id: string;
  sort_order: string;
}

export default function CategoryForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, data: categorie, put, isLoading } = useCategorie();
  const data = useCategorieStore((state) => state.data);
  const isEdit = useCategorieStore((state) => state.isEdit);
  const clearData = useCategorieStore((state) => state.clearData);
  const setIsEdit = useCategorieStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      tenant_id: "",
      name: data?.name || "",
      description: data?.description || "",
      parent_id: data?.parent_id ? String(data.parent_id) : "",
      sort_order: "0",
    },
  });

  // Opciones del select de categoría padre: "Sin categoría padre" +
  // todas las categorías disponibles. AppSelect normaliza y filtra
  // internamente por lo que el usuario escriba.
  const parentOptions = React.useMemo(
    () => [
      { label: "Sin categoría padre", value: "" },
      ...(categorie ?? []).map((cat) => ({
        label: cat.name,
        value: String(cat.id),
      })),
    ],
    [categorie],
  );

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;
    const payload: CategoryDetail = {
      tenant_id: claims?.tenant_id,
      name: values.name.trim(),
      description: values.description.trim(),
      parent_id: values.parent_id ? parseInt(values.parent_id) : null,
      sort_order: 0,
    };

    try {
      if (!isEdit) {
        await post.mutateAsync(payload);
        showToast({
          message: "Se Agrego una nueva categoria",
          type: "success",
        });
      } else {
        if (!data?.id) return;
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({ message: "Se edito categoria", type: "success" });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar la categoria", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <Center style={{ flex: 1 }}>
        <ActivityIndicator size="large" />
        <Text>Cargando categorías...</Text>
      </Center>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          style={{ flex: 1 }}
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
                  {isEdit ? "Editar Categoría" : "Nueva Categoría"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar la categoría"
                    : "Llena los campos para crear una categoría"}
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
                      <AppInput
                        label="Nombre"
                        placeholder="Ej. Electrónica"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorMessage={errors.name?.message}
                      />
                    )}
                  />

                  {/* Descripción */}
                  <Controller
                    control={control}
                    name="description"
                    rules={{
                      required: "La descripción es obligatoria.",
                      minLength: { value: 5, message: "Mínimo 5 caracteres." },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Descripción"
                        placeholder="Describe la categoría..."
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        textareaHeight={100}
                        errorMessage={errors.description?.message}
                      />
                    )}
                  />

                  {/* Categoría Padre */}
                  <Controller
                    control={control}
                    name="parent_id"
                    render={({ field: { onChange, value } }) => (
                      <AppSelect
                        label="Categoria Padre (opcional)"
                        placeholder="Sin categoría padre"
                        searchable={parentOptions.length > 6}
                        searchPlaceholder="Buscar categoría..."
                        options={parentOptions}
                        value={value}
                        onChange={onChange}
                        errorMessage={errors.parent_id?.message}
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
                      disabled={post.isPending || put.isPending}
                    >
                      <ButtonText>
                        {post.isPending || put.isPending
                          ? "Guardando..."
                          : "Guardar Categoría"}
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
