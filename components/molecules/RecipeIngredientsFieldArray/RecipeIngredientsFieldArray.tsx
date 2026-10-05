import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { AppSelect, AppSelectOption } from "@/components/atom/AppSelect/AppSelect";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  EMPTY_RECIPE_INGREDIENT,
  RecipeFormValues,
} from "@/src/screen/kitchen/Recipe/form/recipe_form_values";
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

export interface RecipeIngredientsFieldArrayProps {
  control: Control<RecipeFormValues>;
  errors: FieldErrors<RecipeFormValues>;
  ingredientOptions: AppSelectOption[];
  ingredientUnits: Record<string, string>;
  variantOptions: AppSelectOption[];
}

export function RecipeIngredientsFieldArray({
  control,
  errors,
  ingredientOptions,
  ingredientUnits,
  variantOptions,
}: RecipeIngredientsFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipe_ingredients",
    rules: {
      validate: (value) =>
        value.length > 0 || "Agrega al menos un ingrediente.",
    },
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
          Esta receta no tiene ingredientes.
        </Text>
      )}

      {fields.map((field, index) => {
        const ingredientId = watchedIngredients?.[index]?.ingredient_id ?? "";
        const unit = ingredientUnits[ingredientId];

        return (
          <Box
            key={field.id}
            className="border border-outline-200 rounded-xl p-4"
          >
            <HStack className="justify-between items-center mb-3">
              <Text style={{ color: "#000" }}>Ingrediente {index + 1}</Text>
              <Pressable onPress={() => remove(index)} hitSlop={8}>
                <Trash2 size={18} color="#dc2626" />
              </Pressable>
            </HStack>

            <VStack space="md">
              <Controller
                control={control}
                name={`recipe_ingredients.${index}.ingredient_id`}
                rules={{ required: "El ingrediente es obligatorio." }}
                render={({ field: { onChange, value } }) => (
                  <AppSelect
                    label="Ingrediente"
                    placeholder="Selecciona ingrediente"
                    searchable={ingredientOptions.length > 6}
                    options={ingredientOptions}
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

      {!!errors.recipe_ingredients?.root?.message && (
        <Text size="sm" style={{ color: "#dc2626" }}>
          {errors.recipe_ingredients.root.message}
        </Text>
      )}

      <AppButton
        label="Agregar ingrediente"
        icon={Plus}
        variant="black"
        outline
        onPress={() => append({ ...EMPTY_RECIPE_INGREDIENT })}
      />
    </VStack>
  );
}
