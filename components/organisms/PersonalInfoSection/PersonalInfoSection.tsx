import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useProfile } from "@/src/hooks";
import { useProfileStore } from "@/src/store";
import { UserUpdate } from "@/src/types";
import { getInitials } from "@/src/utils";
import { Mail, Phone, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
}

export function PersonalInfoSection() {
  const user = useProfileStore((state) => state.user);
  const { updateUser } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    defaultValues: {
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      username: user?.username ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        username: user.username ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: PersonalInfoFormData) => {
    if (!user || updateUser.isPending) return;

    const formData: UserUpdate = {
      username: data.username,
      email: data.email,
      phone: data.phone,
      first_name: data.firstName,
      last_name: data.lastName,
      address_id: user.address_id,
      role_id: user.role_id,
      is_active: user.is_active,
      two_fa_enabled: user.two_fa_enabled,
      status: user.status,
    };

    updateUser.mutate(
      { idUser: user.id, data: formData },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <Card className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <HStack className="items-center justify-between">
        <VStack>
          <HStack className="items-center gap-2">
            <User size={20} color="#6366f1" />
            <Heading size="lg" className="text-gray-900">
              Informacion Personal
            </Heading>
          </HStack>
          <Text size="sm" className="text-gray-500">
            Gestiona tu informacion basica de perfil
          </Text>
        </VStack>
        <VStack className="items-center gap-3">
          <Avatar className="size-24 border-1 border-gray-100 bg-indigo-100">
            <AvatarFallbackText className="text-2xl text-indigo-600">
              {getInitials(user?.username ?? "user")}
            </AvatarFallbackText>
          </Avatar>
        </VStack>
      </HStack>

      <Box className="mt-5">
        <HStack className="gap-8 flex-wrap md:flex-nowrap">
          <VStack className="flex-1 gap-4">
            <HStack className="gap-4 flex-wrap sm:flex-nowrap">
              <View className="flex-1" style={{ minWidth: 160 }}>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{ required: "El nombre es obligatorio" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label="Nombre"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      isDisabled={!isEditing}
                      errorMessage={errors.firstName?.message}
                    />
                  )}
                />
              </View>

              <View className="flex-1" style={{ minWidth: 160 }}>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{ required: "El apellido es obligatorio" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label="Apellido"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      isDisabled={!isEditing}
                      errorMessage={errors.lastName?.message}
                    />
                  )}
                />
              </View>
            </HStack>

            <View>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Correo no valido",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Correo electronico"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    isDisabled={!isEditing}
                    leftIcon={<Mail size={16} color="#9ca3af" />}
                    errorMessage={errors.email?.message}
                  />
                )}
              />
              {!errors.email && (
                <Text
                  className="text-gray-400 text-xs"
                  style={{ marginTop: 4 }}
                >
                  Este correo se usa para notificaciones y recuperacion de
                  cuenta
                </Text>
              )}
            </View>

            <HStack className="gap-4 flex-wrap sm:flex-nowrap">
              <View className="flex-1" style={{ minWidth: 160 }}>
                <Controller
                  control={control}
                  name="phone"
                  rules={{ required: "El telefono es obligatorio" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label="Telefono"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      isDisabled={!isEditing}
                      leftIcon={<Phone size={16} color="#9ca3af" />}
                      errorMessage={errors.phone?.message}
                    />
                  )}
                />
              </View>

              <View className="flex-1" style={{ minWidth: 160 }}>
                <Controller
                  control={control}
                  name="username"
                  rules={{
                    required: "El username es obligatorio",
                    minLength: { value: 3, message: "Minimo 3 caracteres" },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label="Username"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      isDisabled={!isEditing}
                      errorMessage={errors.username?.message}
                    />
                  )}
                />
              </View>
            </HStack>
          </VStack>
        </HStack>

        <HStack className="gap-2 mt-4 justify-end">
          {isEditing && (
            <AppButton
              label="Cancelar"
              outline
              outlineBorderColor="#d1d5db"
              outlineTextColor="#374151"
              fullWidth={false}
              isDisabled={updateUser.isPending}
              onPress={handleCancel}
            />
          )}
          <AppButton
            label={isEditing ? "Guardar" : "Editar"}
            variant="primary"
            fullWidth={false}
            isLoading={updateUser.isPending}
            onPress={
              isEditing ? handleSubmit(onSubmit) : () => setIsEditing(true)
            }
          />
        </HStack>
      </Box>
    </Card>
  );
}
