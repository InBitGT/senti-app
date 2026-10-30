import { AppInput } from "@/components/atom/AppInput/AppInput";
import {
  AppSelect,
  AppSelectOption,
} from "@/components/atom/AppSelect/AppSelect";
import { ResponsiveCardGrid } from "@/components/atom/ResponsiveCardGrid/ResponsiveCardGrid";
import { SectionAddHeader } from "@/components/atom/SectionAddHeader/SectionAddHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  EMPTY_SERVICE_RECIPE_INGREDIENT,
  ServiceProductFormValues,
} from "@/src/screen/inventory/service/form/service_product_form";
import { validateDecimal } from "@/src/utils/form/formHelpers";
import { Trash2 } from "lucide-react-native";
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Pressable } from "react-native";

export interface ServiceIngredientsFieldArrayProps {
  title: string;
  control: Control<ServiceProductFormValues>;
  errors: FieldErrors<ServiceProductFormValues>;
  supplyOptions: AppSelectOption[];
  supplyUnits: Record<string, string>;
  variantOptions: AppSelectOption[];
}

export function ServiceIngredientsFieldArray({
  title,
  control,
  errors,
  supplyOptions,
  supplyUnits,
  variantOptions,
}: ServiceIngredientsFieldArrayProps) {
  // En el API se llama "recipe_ingredients"; en pantalla son los materiales del servicio.
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
      <SectionAddHeader
        title={title}
        addLabel="Agregar material"
        onAdd={() => append({ ...EMPTY_SERVICE_RECIPE_INGREDIENT })}
      />

      {fields.length === 0 && (
        <Text size="sm" className="text-typography-400">
          No has agregado materiales.
        </Text>
      )}

      <ResponsiveCardGrid>
        {fields.map((field, index) => {
          const supplyId = watchedIngredients?.[index]?.ingredient_id ?? "";
          const unit = supplyUnits[supplyId];

          return (
            <Box
              key={field.id}
              className="border border-outline-200 rounded-xl p-4"
            >
              <HStack className="justify-between items-center mb-3">
                <Text style={{ color: "#000" }}>Material {index + 1}</Text>
                <Pressable onPress={() => remove(index)} hitSlop={8}>
                  <Trash2 size={18} color="#dc2626" />
                </Pressable>
              </HStack>

              <VStack space="md">
                <Controller
                  control={control}
                  name={`recipe_ingredients.${index}.ingredient_id`}
                  rules={{ required: "El material es obligatorio." }}
                  render={({ field: { onChange, value } }) => (
                    <AppSelect
                      label="Material"
                      placeholder="Ej. Papel bond carta"
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
                      placeholder="Ej. 1"
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

                {/*
                Merma: oculta por ahora. El campo waste_factor sigue en el form
                y el mapper lo omite del payload cuando va vacío.
                Para reactivarla, descomentar esto y volver a importar validateFactor.

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
                      errors.recipe_ingredients?.[index]?.waste_factor?.message
                    }
                  />
                )}
              />
              */}

                {variantOptions.length > 0 && (
                  <Controller
                    control={control}
                    name={`recipe_ingredients.${index}.variant_name`}
                    rules={{
                      validate: (value: string) =>
                        value === "" ||
                        variantOptions.some(
                          (option) => option.value === value,
                        ) ||
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
      </ResponsiveCardGrid>
    </VStack>
  );
}
