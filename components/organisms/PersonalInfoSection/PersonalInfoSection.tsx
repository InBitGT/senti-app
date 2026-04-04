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
import { Calendar, Mail, Phone, User } from "lucide-react-native"
import { useState } from "react"

export function PersonalInfoSection() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "Carlos",
    lastName: "Mendoza",
    email: "carlos.mendoza@email.com",
    phone: "+52 55 1234 5678",
    birthDate: "1990-05-15",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
        <Button
          size="sm"
          className="bg-indigo-500 rounded-lg"
          onPress={() => setIsEditing(!isEditing)}
        >
          <ButtonText className="text-white">
            {isEditing ? "Guardar" : "Editar"}
          </ButtonText>
        </Button>
      </HStack>

      <Box className="mt-5">
        <HStack className="gap-8 flex-wrap md:flex-nowrap">
          {/* Avatar Section */}
          <VStack className="items-center gap-3">
            <Avatar className="size-24 border-4 border-gray-100 bg-indigo-100">
              <AvatarFallbackText className="text-2xl text-indigo-600">
                CM
              </AvatarFallbackText>
            </Avatar>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 rounded-lg"
              >
                <ButtonText className="text-gray-700">
                  Cambiar foto
                </ButtonText>
              </Button>
            )}
          </VStack>

          {/* Form Fields */}
          <VStack className="flex-1 gap-4">
            <HStack className="gap-4 flex-wrap sm:flex-nowrap">
              <FormControl className="flex-1">
                <FormControlLabel>
                  <FormControlLabelText className="text-gray-700 text-sm font-medium">
                    Nombre
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  isDisabled={!isEditing}
                  className="bg-gray-50 border-gray-200 rounded-lg h-11"
                >
                  <InputField
                    value={formData.firstName}
                    onChangeText={(value) => handleChange("firstName", value)}
                    className="text-gray-900 placeholder:text-gray-400"
                  />
                </Input>
              </FormControl>

              <FormControl className="flex-1">
                <FormControlLabel>
                  <FormControlLabelText className="text-gray-700 text-sm font-medium">
                    Apellido
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  isDisabled={!isEditing}
                  className="bg-gray-50 border-gray-200 rounded-lg h-11"
                >
                  <InputField
                    value={formData.lastName}
                    onChangeText={(value) => handleChange("lastName", value)}
                    className="text-gray-900 placeholder:text-gray-400"
                  />
                </Input>
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
              <Input
                isDisabled={!isEditing}
                className="bg-gray-50 border-gray-200 rounded-lg h-11"
              >
                <InputField
                  value={formData.email}
                  onChangeText={(value) => handleChange("email", value)}
                  keyboardType="email-address"
                  className="text-gray-900 placeholder:text-gray-400"
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText className="text-gray-400 text-xs">
                  Este correo se usa para notificaciones y recuperacion de
                  cuenta
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
                <Input
                  isDisabled={!isEditing}
                  className="bg-gray-50 border-gray-200 rounded-lg h-11"
                >
                  <InputField
                    value={formData.phone}
                    onChangeText={(value) => handleChange("phone", value)}
                    keyboardType="phone-pad"
                    className="text-gray-900 placeholder:text-gray-400"
                  />
                </Input>
              </FormControl>

              <FormControl className="flex-1">
                <FormControlLabel>
                  <HStack className="items-center gap-2">
                    <Calendar size={16} color="#9ca3af" />
                    <FormControlLabelText className="text-gray-700 text-sm font-medium">
                      Fecha de nacimiento
                    </FormControlLabelText>
                  </HStack>
                </FormControlLabel>
                <Input
                  isDisabled={!isEditing}
                  className="bg-gray-50 border-gray-200 rounded-lg h-11"
                >
                  <InputField
                    value={formData.birthDate}
                    onChangeText={(value) => handleChange("birthDate", value)}
                    className="text-gray-900 placeholder:text-gray-400"
                  />
                </Input>
              </FormControl>
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </Card>
  )
}