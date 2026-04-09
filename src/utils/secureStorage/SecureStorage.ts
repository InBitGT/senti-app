import * as SecureStore from 'expo-secure-store';

const store = {
  async save({ name, value }: { name: string; value: string }): Promise<void> {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('Error al guardar el valor:', error);
      throw error;
    }
  },

  async get({ name }: { name: string }): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.error('Error al obtener el valor:', error);
      return null;
    }
  },

  async remove({ name }: { name: string }): Promise<void> {
    await SecureStore.deleteItemAsync(name);
  },
};

export default store;