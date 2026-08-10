import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const storage = {
  async getItem(name: string): Promise<string | null> {
    if (isWeb) {
      return AsyncStorage.getItem(name);
    }
    return SecureStore.getItemAsync(name);
  },
  async setItem(name: string, value: string): Promise<void> {
    if (isWeb) {
      await AsyncStorage.setItem(name, value);
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },
  async removeItem(name: string): Promise<void> {
    if (isWeb) {
      await AsyncStorage.removeItem(name);
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};
