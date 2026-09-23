import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { AlertCircle, ChevronDown, Search, X } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
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
   * Opciones a mostrar. Si usas `searchValue`/`onSearchChange`, el
   * form que consume AppSelect debe pasar ya la lista filtrada
   * (AppSelect NO filtra ni normaliza texto internamente).
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
  /**
   * Valor controlado del buscador. Si se pasa junto con
   * `onSearchChange`, el filtrado/normalizacion lo maneja el form
   * padre (ver `options`). Si se omite, AppSelect usa un estado
   * interno solo para mostrar el texto escrito, sin filtrar nada
   * por si mismo.
   */
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

const MAX_HEIGHT_RATIO = 0.8;

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

  const selected = options.find((o) => o.value === value);
  const disabled = isDisabled || isLoading;

  // Tope maximo (80% de la pantalla). Por debajo de eso, gorhom
  // mide el contenido real (BottomSheetFlatList) y ajusta la altura
  // del sheet exactamente a lo que ocupa -- pocas opciones -> sheet
  // chico, muchas -> sheet grande, hasta este tope.
  const maxDynamicContentSize = windowHeight * MAX_HEIGHT_RATIO;

  const handleOpen = useCallback(() => {
    if (!disabled) sheetRef.current?.present();
  }, [disabled]);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
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
      >
        <BottomSheetFlatList
          data={options}
          keyExtractor={(item) => item.value}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
          ListHeaderComponent={
            searchable ? (
              <View style={styles.searchBox}>
                <Search size={16} color="#9ca3af" />
                <TextInput
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
            ) : null
          }
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
            const isSelected = item.value === value;
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
    color: "#9ca3af",
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
    color: "#374151",
    padding: 15,
  },
  itemTextSelected: {
    color: "#111827",
    fontWeight: "700",
  },
});
