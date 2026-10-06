import { AppInput } from "@/components/atom/AppInput/AppInput";
import {
  AppSelect,
  AppSelectOption,
} from "@/components/atom/AppSelect/AppSelect";
import { ResponsiveCardGrid } from "@/components/atom/ResponsiveCardGrid/ResponsiveCardGrid";
import { SectionAddHeader } from "@/components/atom/SectionAddHeader/SectionAddHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { DESKTOP_BREAKPOINT } from "@/const/Dimensions";
import { useCustomerType } from "@/src/hooks/useCustomerType/useCustomerType";
import {
  EMPTY_SERVICE_CUSTOMER_TYPE_PRICE,
  ServiceProductFormValues,
} from "@/src/screen/inventory/service/form/service_product_form";
import {
  toNumber,
  validateDecimal,
  validateInteger,
} from "@/src/utils/form/formHelpers";
import { Trash2 } from "lucide-react-native";
import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

export interface ServicePricingFieldsProps {
  title: string;
  control: Control<ServiceProductFormValues>;
  errors: FieldErrors<ServiceProductFormValues>;
}

export function ServicePricingFields({
  title,
  control,
  errors,
}: ServicePricingFieldsProps) {
  const { data: customerTypes } = useCustomerType();
  const { width } = useWindowDimensions();
  const isLarge = width >= DESKTOP_BREAKPOINT;
  const row: ViewStyle = isLarge ? { flexDirection: "row", gap: 16 } : {};
  const half: ViewStyle = isLarge ? { flex: 1, minWidth: 0 } : {};
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customer_type_prices",
  });

  const hasWholesaleRule = useWatch({ control, name: "has_wholesale_rule" });

  const customerTypeOptions = React.useMemo<AppSelectOption[]>(
    () =>
      (customerTypes ?? []).map((type) => ({
        label: type.name,
        value: String(type.id),
      })),
    [customerTypes],
  );

  return (
    <VStack space="md">
      <SectionAddHeader
        title={title}
        addLabel="Agregar precio por tipo de cliente"
        onAdd={() => append({ ...EMPTY_SERVICE_CUSTOMER_TYPE_PRICE })}
      />

      {fields.length === 0 && (
        <Text size="sm" className="text-typography-400">
          Este servicio no tiene precios por tipo de cliente.
        </Text>
      )}

      <ResponsiveCardGrid>
        {fields.map((field, index) => (
          <Box
            key={field.id}
            className="border border-outline-200 rounded-xl p-4"
          >
            <HStack className="justify-between items-center mb-3">
              <Text style={{ color: "#000" }}>Precio {index + 1}</Text>
              <Pressable onPress={() => remove(index)} hitSlop={8}>
                <Trash2 size={18} color="#dc2626" />
              </Pressable>
            </HStack>

            <View style={styles.fields}>
              <View>
                <Controller
                  control={control}
                  name={`customer_type_prices.${index}.customer_type_id`}
                  rules={{ required: "El tipo de cliente es obligatorio." }}
                  render={({ field: { onChange, value } }) => (
                    <AppSelect
                      label="Tipo de cliente"
                      placeholder="Selecciona tipo"
                      searchable={customerTypeOptions.length > 6}
                      options={customerTypeOptions}
                      value={value}
                      onChange={onChange}
                      errorMessage={
                        errors.customer_type_prices?.[index]?.customer_type_id
                          ?.message
                      }
                    />
                  )}
                />
              </View>

              <View>
                <Controller
                  control={control}
                  name={`customer_type_prices.${index}.amount`}
                  rules={{
                    required: "El precio es obligatorio.",
                    validate: validateDecimal,
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label="Precio"
                      placeholder="Ej. 35.00"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                      errorMessage={
                        errors.customer_type_prices?.[index]?.amount?.message
                      }
                    />
                  )}
                />
              </View>
            </View>
          </Box>
        ))}
      </ResponsiveCardGrid>

      <Controller
        control={control}
        name="has_wholesale_rule"
        render={({ field: { onChange, value } }) => (
          <HStack className="justify-between items-center mt-2">
            <Text style={{ color: "#000" }}>Aplica regla de mayoreo</Text>
            <Switch value={value} onValueChange={onChange} />
          </HStack>
        )}
      />

      {hasWholesaleRule && (
        <View style={[styles.fields, row]}>
          <View style={half}>
            <Controller
              control={control}
              name="wholesale_min_quantity"
              rules={{
                validate: (value: string, formValues) =>
                  !formValues.has_wholesale_rule || validateInteger(value),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Cantidad mínima"
                  placeholder="Ej. 10"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  errorMessage={errors.wholesale_min_quantity?.message}
                />
              )}
            />
          </View>

          <View style={half}>
            <Controller
              control={control}
              name="wholesale_discount_percentage"
              rules={{
                validate: (value: string, formValues) => {
                  if (!formValues.has_wholesale_rule) return true;
                  const decimalResult = validateDecimal(value);
                  if (decimalResult !== true) return decimalResult;
                  const parsed = toNumber(value);
                  return (
                    (parsed > 0 && parsed <= 100) ||
                    "Debe ser mayor a 0 y máximo 100."
                  );
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Descuento (%)"
                  placeholder="Ej. 5"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  errorMessage={errors.wholesale_discount_percentage?.message}
                />
              )}
            />
          </View>
        </View>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 12,
  },
});
