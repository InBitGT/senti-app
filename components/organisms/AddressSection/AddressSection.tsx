import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useProfile } from "@/src/hooks";
import { useProfileStore } from "@/src/store";
import { Building, Globe, MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

interface AddressFormData {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

const COUNTRY_OPTIONS = [{ label: "Guatemala", value: "GT" }];

export function AddressSection() {
  const user = useProfileStore((state) => state.user);
  const { updateAddress } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  const { control, handleSubmit, reset } = useForm<AddressFormData>({
    defaultValues: {
      line1: user?.address?.line1 ?? "",
      line2: user?.address?.line2 ?? "",
      city: user?.address?.city ?? "",
      state: user?.address?.state ?? "",
      country: user?.address?.country ?? "",
      postal_code: user?.address?.postal_code ?? "",
    },
  });

  useEffect(() => {
    if (user?.address) {
      reset({
        line1: user.address.line1 ?? "",
        line2: user.address.line2 ?? "",
        city: user.address.city ?? "",
        state: user.address.state ?? "",
        country: user.address.country ?? "",
        postal_code: user.address.postal_code ?? "",
      });
    }
  }, [user?.address, reset]);

  const onSubmit = (data: AddressFormData) => {
    if (!user?.address_id) return;

    updateAddress.mutate({
      idAddress: user.address_id,
      data: {
        ...data,
        status: user.address?.status ?? true,
      },
    });
    setIsEditing(false);
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
            <MapPin size={20} color="#6366f1" />
            <Heading size="lg" className="text-gray-900">
              Direccion
            </Heading>
          </HStack>
          <Text size="sm" className="text-gray-500">
            Tu direccion de envio y facturacion principal
          </Text>
        </VStack>
      </HStack>

      <Box className="mt-5">
        <VStack className="gap-4">
          {/* Calle y numero */}
          <Controller
            control={control}
            name="line1"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Calle y numero"
                placeholder="Ej: 6a Avenida 10-25 Zona 1"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isDisabled={!isEditing}
              />
            )}
          />

          {/* Interior */}
          <Controller
            control={control}
            name="line2"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Interior / Oficina"
                placeholder="Opcional"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isDisabled={!isEditing}
                leftIcon={<Building size={16} color="#9ca3af" />}
              />
            )}
          />

          {/* Ciudad / Estado */}
          <HStack className="gap-4 flex-wrap sm:flex-nowrap">
            <View className="flex-1" style={{ minWidth: 160 }}>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Ciudad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    isDisabled={!isEditing}
                  />
                )}
              />
            </View>

            <View className="flex-1" style={{ minWidth: 160 }}>
              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Estado / Departamento"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    isDisabled={!isEditing}
                  />
                )}
              />
            </View>
          </HStack>

          {/* CP / Pais */}
          <HStack className="gap-4 flex-wrap sm:flex-nowrap">
            <View className="flex-1" style={{ minWidth: 160 }}>
              <Controller
                control={control}
                name="postal_code"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Codigo Postal"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    isDisabled={!isEditing}
                  />
                )}
              />
            </View>

            <View className="flex-1" style={{ minWidth: 160 }}>
              {/* Label con icono: se arma afuera porque el label de AppSelect es solo texto */}
              <HStack
                className="items-center gap-2"
                style={{ marginBottom: 6 }}
              >
                <Globe size={16} color="#9ca3af" />
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#000" }}
                >
                  Pais
                </Text>
              </HStack>
              <Controller
                control={control}
                name="country"
                render={({ field: { onChange, value } }) => (
                  <AppSelect
                    placeholder="Selecciona un pais"
                    searchable={false}
                    options={COUNTRY_OPTIONS}
                    value={value}
                    onChange={onChange}
                    isDisabled={!isEditing}
                  />
                )}
              />
            </View>
          </HStack>

          <HStack className="gap-2 justify-end">
            {isEditing && (
              <AppButton
                label="Cancelar"
                outline
                outlineBorderColor="#d1d5db"
                outlineTextColor="#374151"
                fullWidth={false}
                onPress={handleCancel}
              />
            )}
            <AppButton
              label={isEditing ? "Guardar" : "Editar"}
              variant="primary"
              outline={!isEditing}
              outlineBorderColor="#d1d5db"
              outlineTextColor="#374151"
              fullWidth={false}
              isLoading={updateAddress.isPending}
              onPress={
                isEditing ? handleSubmit(onSubmit) : () => setIsEditing(true)
              }
            />
          </HStack>
        </VStack>
      </Box>
    </Card>
  );
}
