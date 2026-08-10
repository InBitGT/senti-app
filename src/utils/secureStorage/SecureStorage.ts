import { storage } from "@/lib/storage/storage";

const store = {
  async save({ name, value }: { name: string; value: string }): Promise<void> {
    try {
      await storage.setItem(name, value);
    } catch (error) {
      console.error("Error al guardar el valor:", error);
      throw error;
    }
  },

  async get({ name }: { name: string }): Promise<string | null> {
    try {
      return await storage.getItem(name);
    } catch (error) {
      console.error("Error al obtener el valor:", error);
      return null;
    }
  },

  async remove({ name }: { name: string }): Promise<void> {
    await storage.removeItem(name);
  },
};

export default store;
