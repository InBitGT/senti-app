import { Box } from "@/components/ui/box"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
import { Input, InputField } from "@/components/ui/input"
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select"
import { Text } from "@/components/ui/text"
import { VStack } from "@/components/ui/vstack"
import { useProfile } from "@/src/hooks"
import { useProfileStore } from "@/src/store"
import { Building, ChevronDown, Globe, MapPin } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

interface AddressFormData {
  line1: string
  line2: string
  city: string
  state: string
  country: string
  postal_code: string
}

export function AddressSection() {
  const user = useProfileStore((state) => state.user)
  const { updateAddress } = useProfile()
  const [isEditing, setIsEditing] = useState(false)

  const { control, handleSubmit, reset } = useForm<AddressFormData>({
    defaultValues: {
      line1: user?.address?.line1 ?? "",
      line2: user?.address?.line2 ?? "",
      city: user?.address?.city ?? "",
      state: user?.address?.state ?? "",
      country: user?.address?.country ?? "",
      postal_code: user?.address?.postal_code ?? "",
    },
  })

  useEffect(() => {
    if (user?.address) {
      reset({
        line1: user.address.line1 ?? "",
        line2: user.address.line2 ?? "",
        city: user.address.city ?? "",
        state: user.address.state ?? "",
        country: user.address.country ?? "",
        postal_code: user.address.postal_code ?? "",
      })
    }
  }, [user?.address, reset])

  const onSubmit = (data: AddressFormData) => {
    if (!user?.address_id) return

    updateAddress.mutate({
      idAddress: user.address_id,
      data: {
        ...data,
        status: user.address?.status ?? true,
      },
    })
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
            <MapPin size={20} color="#6366f1" />
            <Heading size="lg" className="text-gray-900">
              Direccion
            </Heading>
          </HStack>
          <Text size="sm" className="text-gray-500">
            Tu direccion de envio y facturacion principal
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
            className={
              isEditing
                ? "bg-indigo-500 rounded-lg"
                : "bg-white border border-gray-300 rounded-lg"
            }
            onPress={isEditing ? handleSubmit(onSubmit) : () => setIsEditing(true)}
          >
            <ButtonText className={isEditing ? "text-white" : "text-gray-700"}>
              {isEditing ? "Guardar" : "Editar"}
            </ButtonText>
          </Button>
        </HStack>
      </HStack>

      <Box className="mt-5">
        <VStack className="gap-4">
          {/* Calle y numero */}
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="text-gray-700 text-sm font-medium">
                Calle y numero
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="line1"
              render={({ field: { onChange, value } }) => (
                <Input
                  isDisabled={!isEditing}
                  className="bg-gray-50 border-gray-200 rounded-lg h-11"
                >
                  <InputField
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ej: 6a Avenida 10-25 Zona 1"
                    className="text-gray-900 placeholder:text-gray-400"
                  />
                </Input>
              )}
            />
          </FormControl>

          {/* Interior */}
          <FormControl>
            <FormControlLabel>
              <HStack className="items-center gap-2">
                <Building size={16} color="#9ca3af" />
                <FormControlLabelText className="text-gray-700 text-sm font-medium">
                  Interior / Oficina
                </FormControlLabelText>
              </HStack>
            </FormControlLabel>
            <Controller
              control={control}
              name="line2"
              render={({ field: { onChange, value } }) => (
                <Input
                  isDisabled={!isEditing}
                  className="bg-gray-50 border-gray-200 rounded-lg h-11"
                >
                  <InputField
                    value={value}
                    onChangeText={onChange}
                    placeholder="Opcional"
                    className="text-gray-900 placeholder:text-gray-400"
                  />
                </Input>
              )}
            />
          </FormControl>

          {/* Ciudad / Estado / CP */}
          <HStack className="gap-4 flex-wrap sm:flex-nowrap">
            <FormControl className="flex-1">
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700 text-sm font-medium">
                  Ciudad
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="city"
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
                  Estado / Departamento
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="state"
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
                  Codigo Postal
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="postal_code"
                render={({ field: { onChange, value } }) => (
                  <Input
                    isDisabled={!isEditing}
                    className="bg-gray-50 border-gray-200 rounded-lg h-11"
                  >
                    <InputField
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      className="text-gray-900 placeholder:text-gray-400"
                    />
                  </Input>
                )}
              />
            </FormControl>
          </HStack>

          {/* Pais */}
          <FormControl>
            <FormControlLabel>
              <HStack className="items-center gap-2">
                <Globe size={16} color="#9ca3af" />
                <FormControlLabelText className="text-gray-700 text-sm font-medium">
                  Pais
                </FormControlLabelText>
              </HStack>
            </FormControlLabel>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <Select
                  selectedValue={value}
                  onValueChange={onChange}
                  isDisabled={!isEditing}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 rounded-lg h-11">
                    <SelectInput
                      placeholder="Selecciona un pais"
                      className="text-gray-900 placeholder:text-gray-400"
                    />
                    <SelectIcon as={ChevronDown} className="mr-3 text-gray-400" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="bg-white">
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Guatemala" value="GT" />
                      <SelectItem label="Mexico" value="MX" />
                      <SelectItem label="Estados Unidos" value="US" />
                      <SelectItem label="El Salvador" value="SV" />
                      <SelectItem label="Honduras" value="HN" />
                      <SelectItem label="Costa Rica" value="CR" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              )}
            />
          </FormControl>
        </VStack>
      </Box>
    </Card>
  )
}