import { storage } from "@/lib/storage/storage";
import { useCallback, useEffect, useState } from "react";

export interface StoredDraft<T> {
  userId: string;
  tenantId: string;
  savedAt: string;
  values: T;
}

export function useFormDraft<T>(
  formKey: string,
  userId?: string | number | null,
  tenantId?: string | number | null,
) {
  // SecureStore solo acepta letras, números, ".", "-" y "_" en las claves
  const storageKey = `draft_${formKey}`;
  const owner = userId != null ? String(userId) : null;
  const tenant = tenantId != null ? String(tenantId) : "";

  const [draft, setDraft] = useState<StoredDraft<T> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar el borrador al entrar (cuando ya se conoce el usuario)
  useEffect(() => {
    if (!owner) return;
    let cancelled = false;

    (async () => {
      try {
        const raw = await storage.getItem(storageKey);
        if (!raw) {
          if (!cancelled) setDraft(null);
          return;
        }

        const parsed = JSON.parse(raw) as StoredDraft<T>;

        // Es de otro usuario o de otra empresa: se elimina
        if (parsed.userId !== owner || parsed.tenantId !== tenant) {
          await storage.removeItem(storageKey);
          if (!cancelled) setDraft(null);
          return;
        }

        if (!cancelled) setDraft(parsed);
      } catch (error) {
        console.log("Error al leer el borrador", error);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storageKey, owner, tenant]);

  const saveDraft = useCallback(
    async (values: T) => {
      if (!owner) return false;
      const data: StoredDraft<T> = {
        userId: owner,
        tenantId: tenant,
        savedAt: new Date().toISOString(),
        values,
      };
      try {
        await storage.setItem(storageKey, JSON.stringify(data));
        setDraft(data);
        return true;
      } catch (error) {
        console.log("Error al guardar el borrador", error);
        return false;
      }
    },
    [storageKey, owner, tenant],
  );

  const clearDraft = useCallback(async () => {
    try {
      await storage.removeItem(storageKey);
    } catch (error) {
      console.log("Error al borrar el borrador", error);
    }
    setDraft(null);
  }, [storageKey]);

  return { draft, isLoaded, saveDraft, clearDraft };
}
