import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { AlertCircle, ChevronDown, Search, X } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

export interface AppSelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  label?: string;
  placeholder?: string;
  /**
   * Opciones a mostrar. Si NO pasas `onSearchChange`, AppSelect filtra
   * internamente por `label` (ignorando mayúsculas y acentos).
   * Si pasas `onSearchChange`, el padre controla la búsqueda y debe
   * mandar la lista ya filtrada.
   */
  options: AppSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  /** Muestra el buscador dentro del sheet. Default: true. */
  searchable?: boolean;
  /** Placeholder del input de busqueda. */
  searchPlaceholder?: string;
  /** Valor controlado del buscador (opcional). */
  searchValue?: string;
  /** Si se pasa, el filtrado lo hace el padre. */
  onSearchChange?: (text: string) => void;
}

const MAX_HEIGHT_RATIO = 0.8;
const isWeb = Platform.OS === "web";

// En web BottomSheetTextInput truena (currentlyFocusedInput no existe)
const SheetInput = isWeb ? TextInput : BottomSheetTextInput;

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Compara valores de forma laxa: si a alguien se le escapa pasar un
// number (o el uom_id, product_id, etc. no viene ya convertido a
// string) la comparación estricta `o.value === value` nunca matchea y
// el trigger se queda mostrando el placeholder en vez de la opción
// seleccionada. Coercionar ambos lados a String evita ese caso.
function sameValue(a: string | undefined, b: string | undefined) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export function AppSelect({
  label,
  placeholder = "Selecciona una opción",
  options,
  value,
  onChange,
  isDisabled,
  isLoading,
  errorMessage,
  searchable = true,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
}: AppSelectProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { height: windowHeight } = useWindowDimensions();

  const [internalQuery, setInternalQuery] = useState("");
  const query = searchValue ?? internalQuery;
  const setQuery = onSearchChange ?? setInternalQuery;
  const isControlledSearch = !!onSearchChange;

  const selected = options.find((o) => sameValue(o.value, value));
  const disabled = isDisabled || isLoading;

  const maxDynamicContentSize = windowHeight * MAX_HEIGHT_RATIO;

  const filteredOptions = useMemo(() => {
    if (isControlledSearch) return options;
    const q = normalize(query);
    if (!q) return options;
    return options.filter((o) => normalize(o.label).includes(q));
  }, [options, query, isControlledSearch]);

  const handleOpen = useCallback(() => {
    if (!disabled) sheetRef.current?.present();
  }, [disabled]);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleDismiss = useCallback(() => {
    setQuery("");
  }, [setQuery]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={handleOpen}
        style={[
          styles.trigger,
          errorMessage && styles.triggerError,
          isDisabled && styles.triggerDisabled,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text
            style={selected ? styles.triggerText : styles.triggerPlaceholder}
            numberOfLines={1}
          >
            {selected?.label || placeholder}
          </Text>
        )}
        <ChevronDown size={18} color="#6b7280" />
      </Pressable>

      {!!errorMessage && (
        <View style={styles.errorRow}>
          <AlertCircle size={14} color="#dc2626" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        maxDynamicContentSize={maxDynamicContentSize}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.dragIndicator}
        backgroundStyle={styles.sheetBackground}
        onDismiss={handleDismiss}
        keyboardBehavior={isWeb ? undefined : "extend"}
        keyboardBlurBehavior={isWeb ? "none" : "restore"}
        android_keyboardInputMode="adjustResize"
      >
        {searchable && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={16} color="#9ca3af" />
              <SheetInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} hitSlop={10}>
                  <X size={16} color="#9ca3af" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        <BottomSheetFlatList
          data={filteredOptions}
          keyExtractor={(item) => item.value}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {query
                  ? `Sin resultados para "${query}"`
                  : options.length === 0
                    ? "No hay opciones"
                    : ""}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = sameValue(item.value, value);
            return (
              <Pressable
                onPress={() => {
                  onChange(item.value);
                  handleClose();
                }}
                style={({ pressed }) => [
                  styles.item,
                  isSelected && styles.itemSelected,
                  pressed && styles.itemPressed,
                ]}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  triggerError: {
    borderColor: "#dc2626",
  },
  triggerDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },
  triggerText: {
    color: "#000",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  triggerPlaceholder: {
    color: "#000",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
  },
  sheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  dragIndicator: {
    backgroundColor: "#d1d5db",
    width: 40,
    height: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 4,
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  item: {
    borderRadius: 8,
  },
  itemSelected: {
    backgroundColor: "#f3f4f6",
  },
  itemPressed: {
    backgroundColor: "#e5e7eb",
  },
  itemText: {
    fontSize: 15,
    color: "#000",
    padding: 15,
  },
  itemTextSelected: {
    color: "#111827",
    fontWeight: "700",
  },
});
