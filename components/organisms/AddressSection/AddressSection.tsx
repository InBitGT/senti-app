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
import { Building, ChevronDown, Globe, MapPin } from "lucide-react-native"
import { useState } from "react"

export function AddressSection() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    street: "Av. Reforma 222",
    interior: "Depto 5B",
    colony: "Juarez",
    city: "Ciudad de Mexico",
    state: "CDMX",
    postalCode: "06600",
    country: "MX",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
        <Button
          size="sm"
          className={
            isEditing
              ? "bg-indigo-500 rounded-lg"
              : "bg-white border border-gray-300 rounded-lg"
          }
          onPress={() => setIsEditing(!isEditing)}
        >
          <ButtonText
            className={isEditing ? "text-white" : "text-gray-700"}
          >
            {isEditing ? "Guardar" : "Editar"}
          </ButtonText>
        </Button>
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
            <Input
              isDisabled={!isEditing}
              className="bg-gray-50 border-gray-200 rounded-lg h-11"
            >
              <InputField
                value={formData.street}
                onChangeText={(value) => handleChange("street", value)}
                placeholder="Ej: Av. Principal 123"
                className="text-gray-900 placeholder:text-gray-400"
              />
            </Input>
          </FormControl>

          {/* Interior / Colonia */}
          <HStack className="gap-4 flex-wrap sm:flex-nowrap">
            <FormControl className="flex-1">
              <FormControlLabel>
                <HStack className="items-center gap-2">
                  <Building size={16} color="#9ca3af" />
                  <FormControlLabelText className="text-gray-700 text-sm font-medium">
                    Interior / Depto
                  </FormControlLabelText>
                </HStack>
              </FormControlLabel>
              <Input
                isDisabled={!isEditing}
                className="bg-gray-50 border-gray-200 rounded-lg h-11"
              >
                <InputField
                  value={formData.interior}
                  onChangeText={(value) => handleChange("interior", value)}
                  placeholder="Opcional"
                  className="text-gray-900 placeholder:text-gray-400"
                />
              </Input>
            </FormControl>

            <FormControl className="flex-1">
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700 text-sm font-medium">
                  Colonia
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                isDisabled={!isEditing}
                className="bg-gray-50 border-gray-200 rounded-lg h-11"
              >
                <InputField
                  value={formData.colony}
                  onChangeText={(value) => handleChange("colony", value)}
                  className="text-gray-900 placeholder:text-gray-400"
                />
              </Input>
            </FormControl>
          </HStack>

          {/* Ciudad / Estado / CP */}
          <HStack className="gap-4 flex-wrap sm:flex-nowrap">
            <FormControl className="flex-1">
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700 text-sm font-medium">
                  Ciudad
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                isDisabled={!isEditing}
                className="bg-gray-50 border-gray-200 rounded-lg h-11"
              >
                <InputField
                  value={formData.city}
                  onChangeText={(value) => handleChange("city", value)}
                  className="text-gray-900 placeholder:text-gray-400"
                />
              </Input>
            </FormControl>

            <FormControl className="flex-1">
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700 text-sm font-medium">
                  Estado
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                isDisabled={!isEditing}
                className="bg-gray-50 border-gray-200 rounded-lg h-11"
              >
                <InputField
                  value={formData.state}
                  onChangeText={(value) => handleChange("state", value)}
                  className="text-gray-900 placeholder:text-gray-400"
                />
              </Input>
            </FormControl>

            <FormControl className="flex-1">
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700 text-sm font-medium">
                  Codigo Postal
                </FormControlLabelText>
              </FormControlLabel>
              <Input
                isDisabled={!isEditing}
                className="bg-gray-50 border-gray-200 rounded-lg h-11"
              >
                <InputField
                  value={formData.postalCode}
                  onChangeText={(value) => handleChange("postalCode", value)}
                  keyboardType="numeric"
                  className="text-gray-900 placeholder:text-gray-400"
                />
              </Input>
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
            <Select
              selectedValue={formData.country}
              onValueChange={(value) => handleChange("country", value)}
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
                  <SelectItem label="Mexico" value="MX" />
                  <SelectItem label="Estados Unidos" value="US" />
                  <SelectItem label="Espana" value="ES" />
                  <SelectItem label="Argentina" value="AR" />
                  <SelectItem label="Colombia" value="CO" />
                  <SelectItem label="Chile" value="CL" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </FormControl>
        </VStack>
      </Box>
    </Card>
  )
}