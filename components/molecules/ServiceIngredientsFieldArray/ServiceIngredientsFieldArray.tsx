import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect, AppSelectOption } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  EMPTY_SERVICE_RECIPE_INGREDIENT,
  ServiceProductFormValues,
} from "@/src/screen/inventory/service/form/service_product_form";
import { validateDecimal, validateFactor } from "@/src/utils/form/formHelpers";
import { Plus, Trash2 } from "lucide-react-native";
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Pressable } from "react-native";

export interface ServiceIngredientsFieldArrayProps {
  control: Control<ServiceProductFormValues>;
  errors: FieldErrors<ServiceProductFormValues>;
  supplyOptions: AppSelectOption[];
  supplyUnits: Record<string, string>;
  variantOptions: AppSelectOption[];
}

export function ServiceIngredientsFieldArray({
  control,
  errors,
  supplyOptions,
  supplyUnits,
  variantOptions,
}: ServiceIngredientsFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipe_ingredients",
  });

  const watchedIngredients = useWatch({ control, name: "recipe_ingredients" });

  const variantSelectOptions: AppSelectOption[] = [
    { label: "Todas las variantes", value: "" },
    ...variantOptions,
  ];

  return (
    <VStack space="md">
      {fields.length === 0 && (
        <Text size="sm" className="text-typography-400">
          La receta no tiene insumos.
        </Text>
      )}

      {fields.map((field, index) => {
        const supplyId = watchedIngredients?.[index]?.ingredient_id ?? "";
        const unit = supplyUnits[supplyId];

        return (
          <Box
            key={field.id}
            className="border border-outline-200 rounded-xl p-4"
          >
            <HStack className="justify-between items-center mb-3">
              <Text style={{ color: "#000" }}>Insumo {index + 1}</Text>
              <Pressable onPress={() => remove(index)} hitSlop={8}>
                <Trash2 size={18} color="#dc2626" />
              </Pressable>
            </HStack>

            <VStack space="md">
              <Controller
                control={control}
                name={`recipe_ingredients.${index}.ingredient_id`}
                rules={{ required: "El insumo es obligatorio." }}
                render={({ field: { onChange, value } }) => (
                  <AppSelect
                    label="Insumo"
                    placeholder="Selecciona insumo"
                    searchable={supplyOptions.length > 6}
                    options={supplyOptions}
                    value={value}
                    onChange={onChange}
                    errorMessage={
                      errors.recipe_ingredients?.[index]?.ingredient_id
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                control={control}
                name={`recipe_ingredients.${index}.quantity`}
                rules={{
                  required: "La cantidad es obligatoria.",
                  validate: validateDecimal,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label={unit ? `Cantidad (${unit})` : "Cantidad"}
                    placeholder="Ej. 0.25"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    errorMessage={
                      errors.recipe_ingredients?.[index]?.quantity?.message
                    }
                  />
                )}
              />

              <Controller
                control={control}
                name={`recipe_ingredients.${index}.waste_factor`}
                rules={{
                  validate: (value: string) =>
                    value.trim().length === 0 || validateFactor(value),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Merma (opcional)"
                    placeholder="Ej. 0.05"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    errorMessage={
                      errors.recipe_ingredients?.[index]?.waste_factor
                        ?.message
                    }
                  />
                )}
              />

              {variantOptions.length > 0 && (
                <Controller
                  control={control}
                  name={`recipe_ingredients.${index}.variant_name`}
                  rules={{
                    validate: (value: string) =>
                      value === "" ||
                      variantOptions.some((option) => option.value === value) ||
                      "La variante ya no existe.",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <AppSelect
                      label="Variante (opcional)"
                      placeholder="Todas las variantes"
                      searchable={false}
                      options={variantSelectOptions}
                      value={value}
                      onChange={onChange}
                      errorMessage={
                        errors.recipe_ingredients?.[index]?.variant_name
                          ?.message
                      }
                    />
                  )}
                />
              )}
            </VStack>
          </Box>
        );
      })}

      <AppButton
        label="Agregar insumo"
        icon={Plus}
        variant="black"
        outline
        onPress={() => append({ ...EMPTY_SERVICE_RECIPE_INGREDIENT })}
      />
    </VStack>
  );
}
