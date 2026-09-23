import { AppInput } from "@/components/atom/AppInput/AppInput";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useDimensions } from "@/src/utils/dimentions/dimentions";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import {
  AlertCircleIcon,
  ChevronDownIcon,
  SearchIcon,
  XIcon,
} from "lucide-react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface Product {
  id: number | string;
  name: string;
}

export function ProductSearchSelect({
  value,
  onChange,
  productData,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  productData: Product[];
  error?: string;
}) {
  const [query, setQuery] = React.useState("");
  const isDesktop = useDimensions();

  const sheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  const selectedProduct = useMemo(
    () => productData?.find((p) => String(p.id) === value),
    [productData, value],
  );

  const filtered = useMemo(() => {
    const list = productData ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => p.name?.toLowerCase().includes(q));
  }, [query, productData]);

  const handleOpen = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleSelect = useCallback(
    (p: Product) => {
      onChange(String(p.id));
      handleClose();
    },
    [onChange, handleClose],
  );

  // Enfocar el input al terminar de abrir
  const handleSheetChange = useCallback((index: number) => {
    if (index >= 0) inputRef.current?.focus();
  }, []);

  // Limpiar la búsqueda al cerrar por gesto, backdrop o botón
  const handleDismiss = useCallback(() => {
    setQuery("");
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item: p }: { item: Product }) => (
      <Pressable
        onPress={() => handleSelect(p)}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={({ pressed }) => [
          styles.item,
          pressed && { backgroundColor: "#f0f9ff" },
          String(p.id) === value && { backgroundColor: "#eff6ff" },
        ]}
      >
        <Text style={{ color: "#171717", fontSize: 16, margin: 15 }}>
          {p.name}
        </Text>
      </Pressable>
    ),
    [handleSelect, value],
  );

  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel>
        <FormControlLabelText style={{ color: "#000" }}>
          Producto
        </FormControlLabelText>
      </FormControlLabel>

      <Pressable onPress={handleOpen}>
        <Box style={styles.trigger} className="p-4">
          <Icon
            as={SearchIcon}
            size="sm"
            style={{ color: "#999", marginRight: isDesktop ? 15 : 8 }}
          />
          <Text
            style={{
              color: selectedProduct ? "#171717" : "#999",
              flex: 1,
              fontSize: 15,
            }}
            numberOfLines={1}
          >
            {selectedProduct?.name ?? "Toca para buscar un producto..."}
          </Text>
          <Icon as={ChevronDownIcon} size="sm" style={{ color: "#999" }} />
        </Box>
      </Pressable>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{error}</FormControlErrorText>
      </FormControlError>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        onDismiss={handleDismiss}
        backdropComponent={renderBackdrop}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Selecciona un producto</Text>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Icon as={XIcon} size="sm" style={{ color: "#fff" }} />
          </Pressable>
        </View>

        <AppInput
          ref={inputRef}
          TextInputComponent={BottomSheetTextInput}
          placeholder="Escribe para buscar..."
          value={query}
          onChangeText={setQuery}
          leftIcon={
            <Icon as={SearchIcon} size="sm" style={{ color: "#999" }} />
          }
          clearable
          containerStyle={styles.searchContainer}
          inputStyle={{ fontSize: 16 }}
        />

        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item: Product) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Sin resultados para “{query}”</Text>
          }
          renderItem={renderItem}
        />
      </BottomSheetModal>
    </FormControl>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 8,
    minHeight: 46,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    minWidth: 32,
    minHeight: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    backgroundColor: "#000",
  },
  searchContainer: {
    width: "auto",
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 24,
  },
  item: {
    minHeight: 60,
    justifyContent: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  emptyText: {
    padding: 16,
    color: "#999",
    textAlign: "center",
    fontSize: 15,
  },
});
