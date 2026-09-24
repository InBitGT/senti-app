import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLogin } from "@/src/hooks";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./Login.styles";

type LoginFormValues = {
  email: string;
  password: string;
};

export const LoginScreen = () => {
  const { login } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom", "top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <DesktopScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Box
            style={styles.card}
            className="w-full max-w-[400px] bg-white rounded-[20px] py-8 px-7"
          >
            <VStack space="xs" style={styles.header}>
              <Heading size="2xl" style={styles.title}>
                Bienvenido
              </Heading>
              <Text size="sm" style={styles.subtitle}>
                Inicia sesión para continuar
              </Text>
            </VStack>

            <VStack space="md" style={styles.form}>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "El correo es obligatorio.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Ingresa un correo válido.",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Correo electrónico"
                    placeholder="correo@ejemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorMessage={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{
                  required: "La contraseña es obligatoria.",
                  minLength: {
                    value: 6,
                    message: "Se requieren al menos 6 caracteres.",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Contraseña"
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    clearable={false}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    errorMessage={errors.password?.message}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    rightIcon={
                      <Pressable
                        onPress={() => setShowPassword((prev) => !prev)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <Eye size={20} color="#6b7280" />
                        ) : (
                          <EyeOff size={20} color="#6b7280" />
                        )}
                      </Pressable>
                    }
                  />
                )}
              />

              <AppButton
                label="Iniciar sesión"
                variant="black"
                isLoading={login.isPending}
                onPress={handleSubmit(onSubmit)}
              />
            </VStack>
          </Box>
        </DesktopScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
