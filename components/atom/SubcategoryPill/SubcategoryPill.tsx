import { Box } from "@/components/ui/box";
import { Text, TouchableOpacity } from "react-native";

export function SubcategoryPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Box
        className={`rounded-full border px-2.5 py-1 ${
          active ? "border-violet-500 bg-violet-50" : "border-gray-300 bg-white"
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            active ? "text-violet-700" : "text-gray-600"
          }`}
        >
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
