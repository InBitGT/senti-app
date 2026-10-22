import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import {
    AppSelect,
    AppSelectOption,
} from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Pill } from "@/components/atom/Pill/Pill";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCategorie } from "@/src/hooks";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useMerchandise } from "@/src/hooks/useMerchandise/useMerchandise";
import { usePrepStation } from "@/src/hooks/usePrepStation/usePrepStation";
import { useRecipe } from "@/src/hooks/useRecipe/useRecipe";
import { useAuthStore } from "@/src/store";
import { usePrepStationStore } from "@/src/store/usePrepStationStore/usePrepStationStore";
import { PrepStationDetail } from "@/src/types/prep_station/prep_station.types";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, Trash2 } from "lucide-react-native";
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
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormValues {
  name: string;
  code: string;
  category_ids: string[];
  product_ids: string[];
}

type ProductSource = "merchandise" | "recipe";

interface ProductOption extends AppSelectOption {
  source: ProductSource;
}

const SOURCE_LABEL: Record<ProductSource, string> = {
  merchandise: "Mercadería",
  recipe: "Receta",
};

const toCode = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function PrepStationForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put } = usePrepStation();
  const { data: categories, isLoading: loadingCategories } = useCategorie();
  const { data: merchandise, isLoading: loadingMerchandise } = useMerchandise();
  const { data: recipes, isLoading: loadingRecipes } = useRecipe();
  const data = usePrepStationStore((state) => state.data);
  const isEdit = usePrepStationStore((state) => state.isEdit);
  const clearData = usePrepStationStore((state) => state.clearData);
  const setIsEdit = usePrepStationStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: data?.name || "",
      code: data?.code || "",
      category_ids: data?.categories.map((c) => String(c.category_id)) ?? [],
      product_ids: data?.products.map((p) => String(p.product_id)) ?? [],
    },
  });

  const categoryOptions = React.useMemo<AppSelectOption[]>(
    () =>
      (categories ?? []).map((cat) => ({
        label: cat.name,
        value: String(cat.id),
      })),
    [categories],
  );

  const productOptions = React.useMemo<ProductOption[]>(() => {
    const merchandiseOptions: ProductOption[] = (merchandise ?? []).map(
      (item) => ({
        label: `${item.product.name} (${item.product.sku})`,
        value: String(item.product.id),
        source: "merchandise",
      }),
    );
    const recipeOptions: ProductOption[] = (recipes ?? []).map((item) => ({
      label: `${item.product.name} (${item.product.sku})`,
      value: String(item.product.id),
      source: "recipe",
    }));
    return [...merchandiseOptions, ...recipeOptions];
  }, [merchandise, recipes]);

  const goBack = () => {
    clearData();
    setIsEdit(false);
    router.back();
  };

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;
    const payload: PrepStationDetail = {
      tenant_id: claims.tenant_id,
      name: values.name.trim(),
      code: toCode(values.code),
      category_ids: values.category_ids.map((id) => parseInt(id)),
      product_ids: values.product_ids.map((id) => parseInt(id)),
    };

    try {
      if (!isEdit) {
        await post.mutateAsync(payload);
        showToast({
          message: "Se agregó una nueva estación",
          type: "success",
        });
      } else {
        if (!data?.id) return;
        await put.mutateAsync({ id: data.id, data: payload });
        showToast({ message: "Se editó la estación", type: "success" });
      }
      goBack();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar la estación", type: "error" });
    }
  };

  if (loadingCategories || loadingMerchandise || loadingRecipes) {
    return (
      <Center style={{ flex: 1 }}>
        <ActivityIndicator size="large" />
        <Text>Cargando categorías y productos...</Text>
      </Center>
    );
  }

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
              onPress={goBack}
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
                  {isEdit ? "Editar Estación" : "Nueva Estación"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar la estación de preparación"
                    : "Llena los campos para crear una estación de preparación"}
                </Text>

                <VStack space="lg">
                  <Text style={styles.sectionLabel}>INFORMACIÓN GENERAL</Text>

                  <View style={[row, !isLarge && styles.stack]}>
                    <View style={half}>
                      {/* Nombre */}
                      <Controller
                        control={control}
                        name="name"
                        rules={{
                          required: "El nombre es obligatorio.",
                          minLength: {
                            value: 2,
                            message: "Mínimo 2 caracteres.",
                          },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Nombre"
                            placeholder="Ej. Heladería"
                            value={value}
                            onChangeText={(text) => {
                              onChange(text);
                            }}
                            onBlur={onBlur}
                            errorMessage={errors.name?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      {/* Código */}
                      <Controller
                        control={control}
                        name="code"
                        rules={{
                          required: "El código es obligatorio.",
                          validate: (value) =>
                            toCode(value).length > 0 || "Código inválido.",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Código"
                            placeholder="Ej. heladeria"
                            autoCapitalize="none"
                            value={value}
                            onChangeText={onChange}
                            onBlur={() => {
                              setValue("code", toCode(getValues("code")));
                              onBlur();
                            }}
                            errorMessage={errors.code?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  <Divider className="my-2" />
                  <View style={[row, !isLarge && styles.stack]}>
                    <View style={[half, styles.column]}>
                      {/* Categorías */}
                      <Text style={styles.sectionLabel}>
                        CATEGORÍAS{" "}
                        <Text size="xs" style={{ color: "#999" }}>
                          (todos sus productos van a esta estación)
                        </Text>
                      </Text>
                      <Controller
                        control={control}
                        name="category_ids"
                        render={({ field: { onChange, value } }) => {
                          const available = categoryOptions.filter(
                            (o) => !value.includes(o.value),
                          );
                          const selected = categoryOptions.filter((o) =>
                            value.includes(o.value),
                          );
                          return (
                            <VStack space="sm">
                              <AppSelect
                                placeholder={
                                  available.length
                                    ? "Agregar categoría"
                                    : "No hay más categorías"
                                }
                                searchPlaceholder="Buscar categoría..."
                                options={available}
                                value=""
                                onChange={(id) => onChange([...value, id])}
                                isDisabled={available.length === 0}
                              />
                              {selected.length === 0 ? (
                                <Text style={styles.emptyText}>
                                  No hay categorías asignadas.
                                </Text>
                              ) : (
                                selected.map((option) => (
                                  <View
                                    key={option.value}
                                    style={styles.itemRow}
                                  >
                                    <Text style={styles.itemText}>
                                      {option.label}
                                    </Text>
                                    <Pressable
                                      onPress={() =>
                                        onChange(
                                          value.filter(
                                            (id) => id !== option.value,
                                          ),
                                        )
                                      }
                                      style={styles.removeRowButton}
                                    >
                                      <Icon
                                        as={Trash2}
                                        size="sm"
                                        style={{ color: "#dc2626" }}
                                      />
                                    </Pressable>
                                  </View>
                                ))
                              )}
                            </VStack>
                          );
                        }}
                      />
                    </View>
                    {!isLarge && <Divider className="my-2" />}
                    <View style={[half, styles.column]}>
                      {/* Productos */}
                      <Text style={styles.sectionLabel}>
                        PRODUCTOS{" "}
                        <Text size="xs" style={{ color: "#999" }}>
                          (mercadería y recetas)
                        </Text>
                      </Text>
                      <Controller
                        control={control}
                        name="product_ids"
                        rules={{
                          validate: (value) =>
                            value.length > 0 ||
                            getValues("category_ids").length > 0 ||
                            "Selecciona al menos una categoría o un producto.",
                        }}
                        render={({ field: { onChange, value } }) => {
                          const available = productOptions.filter(
                            (o) => !value.includes(o.value),
                          );
                          const selected = productOptions.filter((o) =>
                            value.includes(o.value),
                          );
                          return (
                            <VStack space="sm">
                              <AppSelect
                                placeholder={
                                  available.length
                                    ? "Agregar producto"
                                    : "No hay más productos"
                                }
                                searchPlaceholder="Buscar producto..."
                                options={available.map((o) => ({
                                  label: `${o.label} · ${SOURCE_LABEL[o.source]}`,
                                  value: o.value,
                                }))}
                                value=""
                                onChange={(id) => onChange([...value, id])}
                                isDisabled={available.length === 0}
                                errorMessage={errors.product_ids?.message}
                              />
                              {selected.length === 0 ? (
                                <Text style={styles.emptyText}>
                                  No hay productos asignados.
                                </Text>
                              ) : (
                                selected.map((option) => (
                                  <View
                                    key={option.value}
                                    style={styles.itemRow}
                                  >
                                    <View style={styles.itemInfo}>
                                      <Text style={styles.itemLabel}>
                                        {option.label}
                                      </Text>
                                      <Pill
                                        label={SOURCE_LABEL[option.source]}
                                      />
                                    </View>
                                    <Pressable
                                      onPress={() =>
                                        onChange(
                                          value.filter(
                                            (id) => id !== option.value,
                                          ),
                                        )
                                      }
                                      style={styles.removeRowButton}
                                    >
                                      <Icon
                                        as={Trash2}
                                        size="sm"
                                        style={{ color: "#dc2626" }}
                                      />
                                    </Pressable>
                                  </View>
                                ))
                              )}
                            </VStack>
                          );
                        }}
                      />
                    </View>
                  </View>

                  <View
                    style={[styles.actions, isLarge && styles.actionsLarge]}
                  >
                    <View
                      style={isLarge ? styles.actionBtnLarge : styles.actionBtn}
                    >
                      <AppButton label="Cancelar" outline onPress={goBack} />
                    </View>
                    <View
                      style={isLarge ? styles.actionBtnLarge : styles.actionBtn}
                    >
                      <AppButton
                        label={isPending ? "Guardando..." : "Guardar"}
                        onPress={handleSubmit(onSubmit)}
                        isDisabled={isPending}
                      />
                    </View>
                  </View>
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
  sectionLabel: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 13,
  },
  stack: {
    gap: 16,
  },
  column: {
    gap: 12,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
    alignItems: "flex-start",
  },
  itemText: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
  },
  itemLabel: {
    color: "#111827",
    fontSize: 14,
  },
  removeRowButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#d4d4d4",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionsLarge: {
    justifyContent: "flex-end",
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnLarge: {
    minWidth: 140,
  },
});
