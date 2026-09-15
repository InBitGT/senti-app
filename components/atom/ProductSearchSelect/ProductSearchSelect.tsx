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
import { Input, InputField } from "@/components/ui/input";
import {
    Modal,
    ModalBackdrop,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { useDimensions } from "@/src/utils/dimentions/dimentions";
import {
    AlertCircleIcon,
    ChevronDownIcon,
    SearchIcon,
    XIcon,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

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
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const isDesktop = useDimensions();

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

  const handleSelect = (p: Product) => {
    onChange(String(p.id));
    setIsOpen(false);
    setQuery("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel>
        <FormControlLabelText style={{ color: "#000" }}>
          Producto
        </FormControlLabelText>
      </FormControlLabel>

      <Pressable onPress={() => setIsOpen(true)}>
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

      <Modal isOpen={isOpen} onClose={handleClose} size="full">
        <ModalBackdrop />
        <ModalContent style={styles.modalContent}>
          <ModalHeader>
            <Text style={{ fontWeight: "bold", fontSize: 16, color: "#000" }}>
              Selecciona un producto
            </Text>
            <ModalCloseButton className="bg-black" style={styles.closeBtn}>
              <Icon as={XIcon} size="sm" style={{ color: "#fff" }} />
            </ModalCloseButton>
          </ModalHeader>
          <View style={styles.modalBody}>
            <Input style={styles.searchInput}>
              <Icon
                as={SearchIcon}
                size="sm"
                style={{ color: "#999", marginLeft: 10 }}
              />
              <InputField
                autoFocus
                style={{ color: "#171717", fontSize: 16 }}
                placeholder="Escribe para buscar..."
                value={query}
                onChangeText={setQuery}
              />
            </Input>

            <FlatList
              style={styles.list}
              contentContainerStyle={styles.listContent}
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Sin resultados para “{query}”
                </Text>
              }
              renderItem={({ item: p }) => (
                <Pressable
                  onPress={() => handleSelect(p)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && { backgroundColor: "#f0f9ff" },
                    String(p.id) === value && { backgroundColor: "#eff6ff" },
                  ]}
                >
                  <Text style={{ color: "#171717", fontSize: 16 }}>
                    {p.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </ModalContent>
      </Modal>
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
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  modalContent: {
    height: "90%",
    marginTop: "auto",
  },
  closeBtn: {
    minWidth: 32,
    minHeight: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  modalBody: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInput: {
    marginBottom: 8,
    minHeight: 48,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  item: {
    paddingVertical: 22,
    paddingHorizontal: 18,
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
