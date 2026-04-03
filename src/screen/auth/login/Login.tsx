import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control'
import { Heading } from '@/components/ui/heading'
import { Input, InputField, InputSlot } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useLogin } from '@/src/hooks'
import { Eye, EyeOff } from 'lucide-react-native'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from './Login.styles'

type LoginFormValues = {
  email: string
  password: string
}

export const LoginScreen = () => {
  const { login } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    login.mutate({
      email: data.email,
      password: data.password,
    })
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Box style={styles.card}>

            <VStack space="xs" style={styles.header}>
              <Heading size="2xl" style={styles.title}>Bienvenido</Heading>
              <Text size="sm" style={styles.subtitle}>Inicia sesión para continuar</Text>
            </VStack>

            <VStack space="md" style={styles.form}>

              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'El correo es obligatorio.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Ingresa un correo válido.',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl size="md" isInvalid={!!errors.email} isRequired>
                    <FormControlLabel>
                      <FormControlLabelText className="text-gray-700">
                        Correo electrónico
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="my-1 bg-white" size="md">
                      <InputField
                        className="text-gray-900"
                        type="text"
                        placeholder="correo@ejemplo.com"
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </Input>
                    <Text style={styles.errorText}>
                      {errors.email?.message ?? ''}
                    </Text>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'La contraseña es obligatoria.',
                  minLength: {
                    value: 6,
                    message: 'Se requieren al menos 6 caracteres.',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl size="md" isInvalid={!!errors.password} isRequired>
                    <FormControlLabel>
                      <FormControlLabelText className="text-gray-700">
                        Contraseña
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="my-1 bg-white" size="md">
                      <InputField
                        className="text-gray-900"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        placeholderTextColor="#9ca3af"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                      <InputSlot
                        className="pr-3"
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword
                          ? <Eye size={20} color="#6b7280" />
                          : <EyeOff size={20} color="#6b7280" />
                        }
                      </InputSlot>
                    </Input>
                    <Text style={styles.errorText}>
                      {errors.password?.message ?? ''}
                    </Text>
                  </FormControl>
                )}
              />

              <Button
                size="md"
                variant="solid"
                style={styles.submitButton}
                onPress={handleSubmit(onSubmit)}
                isDisabled={login.isPending}
              >
                <ButtonText>
                  {login.isPending ? 'Cargando...' : 'Iniciar sesión'}
                </ButtonText>
              </Button>

            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}