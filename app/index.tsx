import { ActivityIndicator, View } from "react-native";

export default function Index() {
  console.log("esta aqui ");
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
