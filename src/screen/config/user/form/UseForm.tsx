import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
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
import { AlertCircleIcon, ArrowLeftIcon, EyeIcon, EyeOffIcon, Icon } from "@/components/ui/icon";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCustomToast } from "@/src/hooks/useCustomToast";
import { useUser } from "@/src/hooks/useUser/useUser";
import { useAuthStore } from "@/src/store";
import { useUserStore } from "@/src/store/useUserStore/useUserStore";
import { Address, UserDetail } from "@/src/types/user/user.types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
}

export default function UserForm() {
  const router = useRouter();
  const { claims } = useAuthStore();
  const { post, put, postAddress, putAddress, roleData, isLoadingData } = useUser();
  const data = useUserStore((state) => state.data);
  const isEdit = useUserStore((state) => state.isEdit);
  const clearData = useUserStore((state) => state.clearData);
  const setIsEdit = useUserStore((state) => state.setIsEdit);
  const { showToast } = useCustomToast();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  // 👁 estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const row = isLarge ? { flexDirection: "row" as const, gap: 16 } : {};
  const half = isLarge ? { flex: 1, minWidth: 0 } : {};

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
    },
  });

  // watch para validación cruzada
  const passwordValue = watch("password");

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
        await post.mutateAsync(userPayload);
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
          })
        );
        if (data?.address?.id) {
          updatePromises.push(
            putAddress.mutateAsync({ id: data.address.id, data: addressPayload })
          );
        }
        await Promise.all(updatePromises);
        showToast({ message: "Usuario editado correctamente", type: "success" });
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
    post.isPending || put.isPending || postAddress.isPending || putAddress.isPending;

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
            onPress={() => { clearData(); setIsEdit(false); router.back(); }}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
          >
            <Icon as={ArrowLeftIcon} size="xl" style={{ color: "#000" }} />
            <Text style={{ color: "#000", marginLeft: 8, fontSize: 16 }}>Regresar</Text>
          </Pressable>

          <Center>
            <Box style={styles.card}>
              <Heading style={{ color: "#000" }} size="xl" className="mb-1">
                {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
              </Heading>
              <Text size="sm" className="text-typography-400 mb-6">
                {isEdit
                  ? "Modifica los campos para editar el usuario"
                  : "Llena los campos para crear un usuario"}
              </Text>

              <VStack space="lg">
                <Text style={{ fontWeight: "bold", color: "#555", fontSize: 13 }}>
                  DATOS DEL USUARIO
                </Text>

                {/* Nombre + Apellido */}
                <View style={row}>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="first_name"
                      rules={{ required: "El nombre es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.first_name}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Nombre</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. Sofia"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.first_name?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="last_name"
                      rules={{ required: "El apellido es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.last_name}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Apellido</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. Mejia"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.last_name?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
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
                        <FormControl isInvalid={!!errors.username}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Username</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. smejia"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCapitalize="none"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.username?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="phone"
                      rules={{ required: "El teléfono es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.phone}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Teléfono</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. +50241209427"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              keyboardType="phone-pad"
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.phone?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
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
                    pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido." },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.email}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>Email</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. smejia@gmail.com"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Contraseña + Confirmar — en fila en pantallas grandes */}
                <View style={row}>
                  {/* Contraseña */}
                  <View style={half}>
                    <Controller
                      control={control}
                      name="password"
                      rules={
                        !isEdit
                          ? {
                              required: "La contraseña es obligatoria.",
                              minLength: { value: 6, message: "Mínimo 6 caracteres." },
                            }
                          : { minLength: { value: 6, message: "Mínimo 6 caracteres." } }
                      }
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.password}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Contraseña{" "}
                              {isEdit && (
                                <Text size="xs" style={{ color: "#999" }}>
                                  (vacío = sin cambio)
                                </Text>
                              )}
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder={isEdit ? "••••••" : "Contraseña"}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              secureTextEntry={!showPassword}
                            />
                            <InputSlot
                              onPress={() => setShowPassword((prev) => !prev)}
                              style={{ paddingRight: 10 }}
                            >
                              <Icon
                                as={showPassword ? EyeOffIcon : EyeIcon}
                                size="md"
                                style={{ color: "#888" }}
                              />
                            </InputSlot>
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.password?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>

                  {/* Confirmar contraseña */}
                  <View style={half}>
                    <Controller
                      control={control}
                      name="confirm_password"
                      rules={{
                        // Solo requerido si se está escribiendo una contraseña
                        validate: (val) => {
                          if (!passwordValue && isEdit) return true; // edición sin cambio de pass
                          if (!val) return "Confirma la contraseña.";
                          if (val !== passwordValue) return "Las contraseñas no coinciden.";
                          return true;
                        },
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.confirm_password}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>
                              Confirmar contraseña
                            </FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Repite la contraseña"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              secureTextEntry={!showConfirm}
                            />
                            <InputSlot
                              onPress={() => setShowConfirm((prev) => !prev)}
                              style={{ paddingRight: 10 }}
                            >
                              <Icon
                                as={showConfirm ? EyeOffIcon : EyeIcon}
                                size="md"
                                style={{ color: "#888" }}
                              />
                            </InputSlot>
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.confirm_password?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                </View>

                {/* Rol */}
                <Controller
                control={control}
                name="role_id"
                rules={{ required: "El rol es obligatorio." }}
                render={({ field: { onChange, value } }) => {
                    const selectedLabel =
                    roleData?.find((r) => String(r.id) === value)?.name || "";

                    return (
                    <FormControl isInvalid={!!errors.role_id}>
                        <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>Rol</FormControlLabelText>
                        </FormControlLabel>
                        {isLoadingData ? (
                        <View style={{ paddingVertical: 10 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        ) : (
                        <Select selectedValue={value} onValueChange={onChange}>
                            <SelectTrigger>
                            <SelectInput
                                style={{ color: "#000" }}
                                placeholder="Selecciona un rol"
                                value={selectedLabel}
                            />
                            </SelectTrigger>
                            <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                                <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                {(roleData ?? []).map((r) => (
                                <SelectItem
                                    key={r.id}
                                    label={r.name}
                                    value={String(r.id)}
                                />
                                ))}
                            </SelectContent>
                            </SelectPortal>
                        </Select>
                        )}
                        <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>{errors.role_id?.message}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                    );
                }}
                />

                <Divider className="my-2" />

                {/* ── Dirección ── */}
                <Text style={{ fontWeight: "bold", color: "#555", fontSize: 13 }}>
                  DIRECCIÓN
                </Text>

                {/* Línea 1 */}
                <Controller
                  control={control}
                  name="line1"
                  rules={{ required: "La dirección es obligatoria." }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.line1}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>Dirección línea 1</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. Pueblo Nuevo Viñas, Santa Rosa"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>{errors.line1?.message}</FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Línea 2 */}
                <Controller
                  control={control}
                  name="line2"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>
                          Dirección línea 2{" "}
                          <Text size="xs" style={{ color: "#999" }}>(opcional)</Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. Aldea el cuje"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Input>
                    </FormControl>
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
                        <FormControl isInvalid={!!errors.city}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Ciudad</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. Pueblo Nuevo Viñas"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.city?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                      )}
                    />
                  </View>
                  <View style={half}>
                    <Controller
                      control={control}
                      name="state"
                      rules={{ required: "El departamento es obligatorio." }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <FormControl isInvalid={!!errors.state}>
                          <FormControlLabel>
                            <FormControlLabelText style={{ color: "#000" }}>Departamento</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              style={{ color: "#171717" }}
                              placeholder="Ej. Santa Rosa"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                            />
                          </Input>
                          <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{errors.state?.message}</FormControlErrorText>
                          </FormControlError>
                        </FormControl>
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
                    <FormControl isInvalid={!!errors.postal_code}>
                      <FormControlLabel>
                        <FormControlLabelText style={{ color: "#000" }}>Código Postal</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          style={{ color: "#171717" }}
                          placeholder="Ej. 060013"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="number-pad"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>{errors.postal_code?.message}</FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Botones */}
                <HStack style={{ justifyContent: "flex-end" }}>
                  <Button
                    size="lg"
                    className="mt-4"
                    onPress={() => { clearData(); setIsEdit(false); router.back(); }}
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
                    <ButtonText>{isPending ? "Guardando..." : "Guardar"}</ButtonText>
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