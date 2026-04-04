import { Avatar, AvatarFallbackText } from "@/components/ui/avatar"
import { Box } from "@/components/ui/box"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { Input, InputField } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { VStack } from "@/components/ui/vstack"
import { useProfile } from "@/src/hooks"
import { useProfileStore } from "@/src/store"
import { UserUpdate } from "@/src/types"
import { getInitials } from "@/src/utils"
import { Mail, Phone, User } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

interface PersonalInfoFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  username:string
}

export function PersonalInfoSection() {
  const user = useProfileStore((state) => state.user)
  const {updateUser} = useProfile()
  const [isEditing, setIsEditing] = useState(false)

  const { control, handleSubmit, reset } = useForm<PersonalInfoFormData>({
    defaultValues: {
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      username:user?.username ?? ""
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.first_name ?? "",
        lastName: user.last_name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        username: user.username ?? "",
      })
    }
  }, [user, reset])

  const onSubmit = (data: PersonalInfoFormData) => {
    if(!user) return

    const formData:UserUpdate={
      username: data.username,
      email: data.email,
      phone: data.phone,
      first_name: data.firstName,
      last_name: data.lastName,
      address_id: user.address_id,
      role_id: user.role_id,
      is_active: user.is_active,
      two_fa_enabled: user.two_fa_enabled,
      status: user.status
    }

    updateUser.mutate({ idUser: user?.id, data: formData })
    setIsEditing(false)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

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
        <HStack className="gap-2">
          {isEditing && (
            <Button
              size="sm"
              variant="outline"
              className="border-gray-300 rounded-lg"
              onPress={handleCancel}
            >
              <ButtonText className="text-gray-700">Cancelar</ButtonText>
            </Button>
          )}
          <Button
            size="sm"
            className="bg-indigo-500 rounded-lg"
            onPress={isEditing ? handleSubmit(onSubmit) : () => setIsEditing(true)}
          >
            <ButtonText className="text-white">
              {isEditing ? "Guardar" : "Editar"}
            </ButtonText>
          </Button>
        </HStack>
      </HStack>

      <Box className="mt-5">
        <HStack className="gap-8 flex-wrap md:flex-nowrap">
          <VStack className="items-center gap-3">
            <Avatar className="size-24 border-1 border-gray-100 bg-indigo-100">
              <AvatarFallbackText className="text-2xl text-indigo-600">
                {getInitials(user?.username ?? "user")}
              </AvatarFallbackText>
            </Avatar>
          </VStack>

          <VStack className="flex-1 gap-4">
            <HStack className="gap-4 flex-wrap sm:flex-nowrap">
              <FormControl className="flex-1">
                <FormControlLabel>
                  <FormControlLabelText className="text-gray-700 text-sm font-medium">
                    Nombre
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      isDisabled={!isEditing}
                      className="bg-gray-50 border-gray-200 rounded-lg h-11"
                    >
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        className="text-gray-900 placeholder:text-gray-400"
                      />
                    </Input>
                  )}
                />
              </FormControl>

              <FormControl className="flex-1">
                <FormControlLabel>
                  <FormControlLabelText className="text-gray-700 text-sm font-medium">
                    Apellido
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      isDisabled={!isEditing}
                      className="bg-gray-50 border-gray-200 rounded-lg h-11"
                    >
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        className="text-gray-900 placeholder:text-gray-400"
                      />
                    </Input>
                  )}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormControlLabel>
                <HStack className="items-center gap-2">
                  <Mail size={16} color="#9ca3af" />
                  <FormControlLabelText className="text-gray-700 text-sm font-medium">
                    Correo electronico
                  </FormControlLabelText>
                </HStack>
              </FormControlLabel>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    isDisabled={!isEditing}
                    className="bg-gray-50 border-gray-200 rounded-lg h-11"
                  >
                    <InputField
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      className="text-gray-900 placeholder:text-gray-400"
                    />
                  </Input>
                )}
              />
              <FormControlHelper>
                <FormControlHelperText className="text-gray-400 text-xs">
                  Este correo se usa para notificaciones y recuperacion de cuenta
                </FormControlHelperText>
              </FormControlHelper>
            </FormControl>

            <HStack className="gap-4 flex-wrap sm:flex-nowrap">
              <FormControl className="flex-1">
                <FormControlLabel>
                  <HStack className="items-center gap-2">
                    <Phone size={16} color="#9ca3af" />
                    <FormControlLabelText className="text-gray-700 text-sm font-medium">
                      Telefono
                    </FormControlLabelText>
                  </HStack>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      isDisabled={!isEditing}
                      className="bg-gray-50 border-gray-200 rounded-lg h-11"
                    >
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        keyboardType="phone-pad"
                        className="text-gray-900 placeholder:text-gray-400"
                      />
                    </Input>
                  )}
                />
              </FormControl>
              <FormControl className="flex-1">
                <FormControlLabel>
                  <FormControlLabelText className="text-gray-700 text-sm font-medium">
                    Username
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      isDisabled={!isEditing}
                      className="bg-gray-50 border-gray-200 rounded-lg h-11"
                    >
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        className="text-gray-900 placeholder:text-gray-400"
                      />
                    </Input>
                  )}
                />
              </FormControl>

            </HStack>
          </VStack>
        </HStack>
      </Box>
    </Card>
  )
}