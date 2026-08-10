import { ArrowLeftIcon, Icon } from "@/components/ui/icon";
import { Pressable, Text } from "react-native";

interface Props {
  onPress: () => void;
}

export function BotonBack({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <Icon as={ArrowLeftIcon} size="xl" style={{ color: "#000" }} />
      <Text style={{ color: "#000", marginLeft: 8, fontSize: 16 }}>
        Regresar
      </Text>
    </Pressable>
  );
}
