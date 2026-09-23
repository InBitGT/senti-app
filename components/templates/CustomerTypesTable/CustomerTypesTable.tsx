import { Action, ActionsMenu } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { CustomerType } from "@/src/types/customer_type/customer_type";
import { Plus, SearchIcon } from "lucide-react-native";
import React, { useState } from "react";
import { View, ViewStyle } from "react-native";
import { DataTable } from "react-native-paper";

export interface CustomerTypesTableProps {
  data: CustomerType[];
  actions?: Action<CustomerType>[];
  itemsPerPage?: number;
  onNewCustomerType?: () => void;
  onRowPress?: (row: CustomerType) => void;
}

export function CustomerTypesTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewCustomerType,
  onRowPress,
}: CustomerTypesTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((item) =>
      [item.name, item.description].some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const from = page * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  React.useEffect(() => {
    setPage(0);
  }, [search]);

  React.useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [filteredData.length, totalPages, page]);

  const defaultStyle: ViewStyle = {
    backgroundColor: "#ffffff",
    borderColor: "#d4d4d4",
    borderWidth: 0.5,
    borderRadius: 15,
    marginTop: 15,
  };

  const rowBorder: ViewStyle = {
    borderBottomWidth: 0.5,
    borderBottomColor: "#d4d4d4",
  };

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <HStack className="justify-between items-center mb-4 gap-2">
        <View className="flex-1 sm:w-64 sm:flex-none">
          <AppInput
            placeholder="Buscar tipo de cliente..."
            value={search}
            onChangeText={setSearch}
            leftIcon={<SearchIcon size={16} color="#9ca3af" />}
            inputStyle={{ color: "#000" }}
          />
        </View>

        {onNewCustomerType && (
          <AppButton
            label="Crear tipo"
            icon={Plus}
            variant="black"
            fullWidth={false}
            shrinkOnMobile
            onPress={onNewCustomerType}
          />
        )}
      </HStack>

      <DataTable style={defaultStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Nombre</DataTable.Title>
          <DataTable.Title>Descripción</DataTable.Title>
          {actions && actions.length > 0 && (
            <DataTable.Title>Acciones</DataTable.Title>
          )}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin tipos de cliente</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginatedData.map((item) => (
            <DataTable.Row
              key={item.id}
              style={rowBorder}
              onPress={onRowPress ? () => onRowPress(item) : undefined}
            >
              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>{item.name}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text
                  style={{ color: "#000000" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.description ?? "—"}
                </Text>
              </DataTable.Cell>

              {actions && actions.length > 0 && (
                <DataTable.Cell>
                  <ActionsMenu row={item} actions={actions} />
                </DataTable.Cell>
              )}
            </DataTable.Row>
          ))
        )}

        <DataTable.Pagination
          page={page}
          numberOfPages={totalPages}
          onPageChange={setPage}
          label={
            filteredData.length > 0
              ? `${from + 1}-${to} de ${filteredData.length}`
              : "0 de 0"
          }
          numberOfItemsPerPage={itemsPerPage}
          showFastPaginationControls
        />
      </DataTable>
    </VStack>
  );
}
