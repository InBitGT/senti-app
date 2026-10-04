import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ServiceModifierOption } from "@/src/types/service/service";
import { formatCurrency } from "@/src/utils/formatCurrency/formatCurrency";

export interface ServiceModifiersSelectorProps {
  options: ServiceModifierOption[];
  value: number[];
  onChange: (value: number[]) => void;
}

export function ServiceModifiersSelector({
  options,
  value,
  onChange,
}: ServiceModifiersSelectorProps) {
  const toggle = (id: number, isSelected: boolean): void => {
    if (isSelected) {
      onChange([...value, id]);
      return;
    }
    onChange(value.filter((item) => item !== id));
  };

  if (options.length === 0) {
    return (
      <Text size="sm" className="text-typography-400">
        No hay modificadores disponibles.
      </Text>
    );
  }

  return (
    <VStack space="sm">
      {options.map((option) => (
        <HStack
          key={option.product_modifier_id}
          className="justify-between items-center py-2 border-b border-outline-100"
        >
          <VStack>
            <Text style={{ color: "#000" }}>{option.name}</Text>
            <Text size="xs" className="text-typography-400">
              Ajuste: {formatCurrency(option.price_adjustment)}
            </Text>
          </VStack>
          <Switch
            value={value.includes(option.product_modifier_id)}
            onValueChange={(isSelected: boolean) =>
              toggle(option.product_modifier_id, isSelected)
            }
          />
        </HStack>
      ))}
    </VStack>
  );
}
