import { Box } from "@/components/ui/box";
import { Text, TouchableOpacity } from "react-native";

export function CategoryPill({
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
        className={`rounded-full px-3 py-1.5 ${
          active ? "bg-violet-500" : "bg-gray-100"
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            active ? "text-white" : "text-gray-700"
          }`}
        >
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
