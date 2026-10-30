import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface AppSelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  label?: string;
  placeholder?: string;
  options: AppSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

const MAX_HEIGHT_RATIO = 0.8;
const isWeb = Platform.OS === "web";

// Alto aproximado de cada parte del sheet, para calcularlo con TODAS las
// opciones y no con las filtradas: así no se encoge mientras se busca.
const ITEM_HEIGHT = 56;
const HANDLE_HEIGHT = 24;
const SEARCH_HEIGHT = 60;
const LIST_PADDING = 24;
// Aunque haya pocas opciones, el sheet deja espacio para al menos estas filas.
const MIN_VISIBLE_ROWS = 4;

const SheetInput = isWeb ? TextInput : BottomSheetTextInput;

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

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
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [internalQuery, setInternalQuery] = useState("");
  const query = searchValue ?? internalQuery;
  const setQuery = onSearchChange ?? setInternalQuery;
  const isControlledSearch = !!onSearchChange;

  const selected = options.find((o) => sameValue(o.value, value));
  const disabled = isDisabled || isLoading;

  const snapPoints = useMemo(() => {
    const rows = Math.max(options.length, MIN_VISIBLE_ROWS);
    const content =
      HANDLE_HEIGHT +
      (searchable ? SEARCH_HEIGHT : 0) +
      rows * ITEM_HEIGHT +
      LIST_PADDING +
      insets.bottom;
    return [Math.min(content, windowHeight * MAX_HEIGHT_RATIO)];
  }, [options.length, searchable, insets.bottom, windowHeight]);

  const filteredOptions = useMemo(() => {
    if (isControlledSearch) return options;
    const q = normalize(query);
    if (!q) return options;
    return options.filter((o) => normalize(o.label).includes(q));
  }, [options, query, isControlledSearch]);

  const handleOpen = useCallback(() => {
    if (!disabled) sheetRef.current?.present();
  }, [disabled]);

  const handleDismiss = useCallback(() => {
    setQuery("");
  }, [setQuery]);

  // Al buscar se vuelve arriba para que los resultados se vean de inmediato.
  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    },
    [setQuery],
  );

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      sheetRef.current?.dismiss();
    },
    [onChange],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppSelectOption }) => {
      const isSelected = sameValue(item.value, value);
      return (
        <Pressable
          onPress={() => handleSelect(item.value)}
          style={({ pressed }) => [
            styles.item,
            isSelected && styles.itemSelected,
            pressed && styles.itemPressed,
          ]}
        >
          <Text
            style={[styles.itemText, isSelected && styles.itemTextSelected]}
          >
            {item.label}
          </Text>
        </Pressable>
      );
    },
    [value, handleSelect],
  );

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
        snapPoints={snapPoints}
        enableDynamicSizing={false}
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
                onChangeText={handleQueryChange}
                placeholder={searchPlaceholder}
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <Pressable onPress={() => handleQueryChange("")} hitSlop={10}>
                  <X size={16} color="#9ca3af" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        <BottomSheetFlatList
          data={filteredOptions}
          keyExtractor={(item) => item.value}
          ref={listRef}
          keyboardShouldPersistTaps="handled"
          // Un solo objeto: en web la librería combina este estilo con
          // StyleSheet.compose(), que falla si recibe más de 2 estilos.
          contentContainerStyle={{
            ...styles.listContent,
            paddingBottom: LIST_PADDING + insets.bottom,
          }}
          initialNumToRender={15}
          windowSize={7}
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
          renderItem={renderItem}
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
  listContent: {
    paddingHorizontal: 16,
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
    minHeight: ITEM_HEIGHT,
    justifyContent: "center",
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
    paddingVertical: 16,
    paddingHorizontal: 15,
  },
  itemTextSelected: {
    color: "#111827",
    fontWeight: "700",
  },
});
