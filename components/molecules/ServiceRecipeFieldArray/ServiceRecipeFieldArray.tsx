import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
    EMPTY_SERVICE_VARIANT,
    ServiceProductFormValues,
} from "@/src/screen/inventory/service/form/service_product_form";
import {
    isServiceAdjustmentType,
    SERVICE_ADJUSTMENT_OPTIONS,
} from "@/src/types/service/service";
import { validateDecimal } from "@/src/utils/form/formHelpers";
import { Plus, Trash2 } from "lucide-react-native";
import {
    Control,
    Controller,
    FieldErrors,
    useFieldArray,
} from "react-hook-form";
import { Pressable } from "react-native";

export interface ServiceVariantsFieldArrayProps {
  control: Control<ServiceProductFormValues>;
  errors: FieldErrors<ServiceProductFormValues>;
}

export function ServiceVariantsFieldArray({
  control,
  errors,
}: ServiceVariantsFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <VStack space="md">
      {fields.length === 0 && (
        <Text size="sm" className="text-typography-400">
          Este servicio no tiene variantes.
        </Text>
      )}

      {fields.map((field, index) => (
        <Box
          key={field.id}
          className="border border-outline-200 rounded-xl p-4"
        >
          <HStack className="justify-between items-center mb-3">
            <Text style={{ color: "#000" }}>Variante {index + 1}</Text>
            <Pressable onPress={() => remove(index)} hitSlop={8}>
              <Trash2 size={18} color="#dc2626" />
            </Pressable>
          </HStack>

          <VStack space="md">
            <Controller
              control={control}
              name={`variants.${index}.name`}
              rules={{ required: "El nombre es obligatorio." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Nombre"
                  placeholder="Ej. Color"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.variants?.[index]?.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name={`variants.${index}.price_adjustment`}
              rules={{
                required: "El ajuste es obligatorio.",
                validate: validateDecimal,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Ajuste de precio"
                  placeholder="Ej. 2.00"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  errorMessage={
                    errors.variants?.[index]?.price_adjustment?.message
                  }
                />
              )}
            />

            <Controller
              control={control}
              name={`variants.${index}.adjustment_type`}
              render={({ field: { onChange, value } }) => (
                <AppSelect
                  label="Tipo de ajuste"
                  placeholder="Selecciona el tipo de ajuste"
                  options={SERVICE_ADJUSTMENT_OPTIONS}
                  value={value}
                  onChange={(selected: string) => {
                    if (isServiceAdjustmentType(selected)) onChange(selected);
                  }}
                />
              )}
            />
          </VStack>
        </Box>
      ))}

      <AppButton
        label="Agregar variante"
        icon={Plus}
        variant="black"
        outline
        onPress={() => append({ ...EMPTY_SERVICE_VARIANT })}
      />
    </VStack>
  );
}
