import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useUser } from "@/src/hooks/useUser/useUser";
import { useAuthStore } from "@/src/store";
import { useUserStore } from "@/src/store/useUserStore/useUserStore";
import { Address, UserDetail } from "@/src/types/user/user.types";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, Eye, EyeOff } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  role_id: string;
  branch_id: string;
}

// Botón de ojo para mostrar/ocultar contraseña (se pasa como rightIcon).
function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      {visible ? (
        <EyeOff size={18} color="#888" />
      ) : (
        <Eye size={18} color="#888" />
      )}
    </Pressable>
  );
}

export default function UserForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const {
    post,
    put,
    postAddress,
    putAddress,
    roleData,
    isLoadingData,
    postUserBranch,
  } = useUser();
  const data = useUserStore((state) => state.data);
  const isEdit = useUserStore((state) => state.isEdit);
  const clearData = useUserStore((state) => state.clearData);
  const setIsEdit = useUserStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

  const hasMultipleBranches = (claims?.branches?.length ?? 0) > 1;
  const defaultBranchId = claims?.branches?.[0]?.branch_id;

  const roleOptions = useMemo(
    () => (roleData ?? []).map((r) => ({ label: r.name, value: String(r.id) })),
    [roleData],
  );

  const branchOptions = useMemo(
    () =>
      (claims?.branches ?? []).map((b) => ({
        label: b.branch_name,
        value: String(b.branch_id),
      })),
    [claims],
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      phone: data?.phone || "",
      first_name: data?.first_name || "",
      last_name: data?.last_name || "",
      password: "",
      confirm_password: "",
      line1: data?.address?.line1 || "",
      line2: data?.address?.line2 || "",
      city: data?.address?.city || "",
      state: data?.address?.state || "",
      country: data?.address?.country || "GT",
      postal_code: data?.address?.postal_code || "",
      role_id: data?.role_id ? String(data.role_id) : "",
      branch_id: "",
    },
  });

  // watch para validación cruzada
  const passwordValue = watch("password");

  const goBack = () => {
    clearData();
    setIsEdit(false);
    router.back();
  };

  const onSubmit = async (values: FormValues) => {
    if (!claims) return;

    const addressPayload: Address = {
      line1: values.line1.trim(),
      line2: values.line2.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      country: values.country.trim(),
      postal_code: values.postal_code.trim(),
    };

    try {
      if (!isEdit) {
        const newAddress = await postAddress.mutateAsync(addressPayload);
        const userPayload: UserDetail = {
          tenant_id: claims.tenant_id,
          username: values.username.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          password: values.password,
          address_id: newAddress?.id ?? 0,
          role_id: parseInt(values.role_id),
        };
        const newUser = await post.mutateAsync(userPayload);

        // Asignar sucursal: la elegida si hay varias, o la única disponible por defecto
        const branchId = hasMultipleBranches
          ? parseInt(values.branch_id)
          : defaultBranchId;

        if (newUser?.id && branchId) {
          await postUserBranch.mutateAsync({
            user_id: newUser.id,
            branch_id: branchId,
          });
        }

        showToast({ message: "Usuario creado correctamente", type: "success" });
      } else {
        if (!data?.id) return;
        const updatePromises: Promise<any>[] = [];
        updatePromises.push(
          put.mutateAsync({
            id: data.id,
            data: {
              tenant_id: claims.tenant_id,
              username: values.username.trim(),
              email: values.email.trim(),
              phone: values.phone.trim(),
              first_name: values.first_name.trim(),
              last_name: values.last_name.trim(),
              ...(values.password ? { password: values.password } : {}),
              address_id: data.address_id,
              role_id: parseInt(values.role_id),
            },
          }),
        );
        if (data?.address?.id) {
          updatePromises.push(
            putAddress.mutateAsync({
              id: data.address.id,
              data: addressPayload,
            }),
          );
        }
        await Promise.all(updatePromises);
        showToast({
          message: "Usuario editado correctamente",
          type: "success",
        });
        setIsEdit(false);
      }
      clearData();
      router.back();
    } catch (error) {
      console.log(error);
      showToast({ message: "Error al guardar el usuario", type: "error" });
    }
  };

  const isPending =
    post.isPending ||
    put.isPending ||
    postAddress.isPending ||
    putAddress.isPending ||
    postUserBranch.isPending;

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
                  {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
                </Heading>
                <Text size="sm" className="text-typography-400 mb-6">
                  {isEdit
                    ? "Modifica los campos para editar el usuario"
                    : "Llena los campos para crear un usuario"}
                </Text>

                <VStack space="lg">
                  <Text style={styles.sectionTitle}>DATOS DEL USUARIO</Text>

                  {/* Nombre + Apellido */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="first_name"
                        rules={{ required: "El nombre es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Nombre"
                            placeholder="Ej. Camilo"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorMessage={errors.first_name?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="last_name"
                        rules={{ required: "El apellido es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Apellido"
                            placeholder="Ej. Suarez"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorMessage={errors.last_name?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Username + Teléfono */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="username"
                        rules={{ required: "El username es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Username"
                            placeholder="Ej. smejia"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            autoCapitalize="none"
                            errorMessage={errors.username?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="phone"
                        rules={{ required: "El teléfono es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Teléfono"
                            placeholder="Ej. +50211222211"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="phone-pad"
                            errorMessage={errors.phone?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: "El email es obligatorio.",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Email inválido.",
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Email"
                        placeholder="Ej. usuario@gmail.com"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        errorMessage={errors.email?.message}
                      />
                    )}
                  />

                  {/* Contraseña + Confirmar — en fila en pantallas grandes */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="password"
                        rules={
                          !isEdit
                            ? {
                                required: "La contraseña es obligatoria.",
                                minLength: {
                                  value: 6,
                                  message: "Mínimo 6 caracteres.",
                                },
                              }
                            : {
                                minLength: {
                                  value: 6,
                                  message: "Mínimo 6 caracteres.",
                                },
                              }
                        }
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label={
                              isEdit
                                ? "Contraseña (vacío = sin cambio)"
                                : "Contraseña"
                            }
                            placeholder={isEdit ? "••••••" : "Contraseña"}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            clearable={false}
                            errorMessage={errors.password?.message}
                            rightIcon={
                              <PasswordToggle
                                visible={showPassword}
                                onToggle={() => setShowPassword((p) => !p)}
                              />
                            }
                          />
                        )}
                      />
                    </View>

                    <View style={half}>
                      <Controller
                        control={control}
                        name="confirm_password"
                        rules={{
                          // Solo requerido si se está escribiendo una contraseña
                          validate: (val) => {
                            if (!passwordValue && isEdit) return true; // edición sin cambio de pass
                            if (!val) return "Confirma la contraseña.";
                            if (val !== passwordValue)
                              return "Las contraseñas no coinciden.";
                            return true;
                          },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Confirmar contraseña"
                            placeholder="Repite la contraseña"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            secureTextEntry={!showConfirm}
                            autoCapitalize="none"
                            clearable={false}
                            errorMessage={errors.confirm_password?.message}
                            rightIcon={
                              <PasswordToggle
                                visible={showConfirm}
                                onToggle={() => setShowConfirm((p) => !p)}
                              />
                            }
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Rol */}
                  <Controller
                    control={control}
                    name="role_id"
                    rules={{ required: "El rol es obligatorio." }}
                    render={({ field: { onChange, value } }) => (
                      <AppSelect
                        label="Rol"
                        placeholder="Selecciona un rol"
                        options={roleOptions}
                        value={value}
                        onChange={onChange}
                        isLoading={isLoadingData}
                        searchable={roleOptions.length > 6}
                        errorMessage={errors.role_id?.message}
                      />
                    )}
                  />

                  {/* Sucursal (solo si el usuario que crea tiene más de una) */}
                  {!isEdit && hasMultipleBranches && (
                    <Controller
                      control={control}
                      name="branch_id"
                      rules={{ required: "La sucursal es obligatoria." }}
                      render={({ field: { onChange, value } }) => (
                        <AppSelect
                          label="Sucursal"
                          placeholder="Selecciona una sucursal"
                          options={branchOptions}
                          value={value}
                          onChange={onChange}
                          searchable={branchOptions.length > 6}
                          errorMessage={errors.branch_id?.message}
                        />
                      )}
                    />
                  )}

                  <Divider className="my-2" />

                  {/* ── Dirección ── */}
                  <Text style={styles.sectionTitle}>DIRECCIÓN</Text>

                  {/* Línea 1 */}
                  <Controller
                    control={control}
                    name="line1"
                    rules={{ required: "La dirección es obligatoria." }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Dirección"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorMessage={errors.line1?.message}
                      />
                    )}
                  />

                  {/* Línea 2 */}
                  <Controller
                    control={control}
                    name="line2"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Dirección (opcional)"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  {/* Ciudad + Departamento */}
                  <View style={row}>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="city"
                        rules={{ required: "La ciudad es obligatoria." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Ciudad"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorMessage={errors.city?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={half}>
                      <Controller
                        control={control}
                        name="state"
                        rules={{ required: "El departamento es obligatorio." }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AppInput
                            label="Departamento"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorMessage={errors.state?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  {/* Código Postal */}
                  <Controller
                    control={control}
                    name="postal_code"
                    rules={{ required: "El código postal es obligatorio." }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Código Postal"
                        placeholder="Ej. 01001"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        errorMessage={errors.postal_code?.message}
                      />
                    )}
                  />

                  {/* Botones */}
                  <HStack style={styles.actions}>
                    <AppButton
                      label="Cancelar"
                      variant="black"
                      outline
                      fullWidth={false}
                      isDisabled={isPending}
                      onPress={goBack}
                    />
                    <AppButton
                      label="Guardar"
                      variant="black"
                      fullWidth={false}
                      isLoading={isPending}
                      onPress={handleSubmit(onSubmit)}
                    />
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
  sectionTitle: { fontWeight: "bold", color: "#555", fontSize: 13 },
  actions: {
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
});
