import { Action, ActionsMenu } from "@/components/atom";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { CustomerCredit } from "@/src/types/credit/credit";
import { History, Plus, SearchIcon } from "lucide-react-native";
import React, { useState } from "react";
import { View, ViewStyle } from "react-native";
import { DataTable } from "react-native-paper";

export interface CustomerCreditsTableProps {
  data: CustomerCredit[];
  actions?: Action<CustomerCredit>[];
  itemsPerPage?: number;
  onNewCustomerCredit?: () => void;
  onRowPress?: (row: CustomerCredit) => void;
  onCreditPrevious?: () => void;
}

const Badge = ({
  active,
  labels = ["Sí", "No"],
}: {
  active: boolean;
  labels?: [string, string];
}) => (
  <View
    style={{
      backgroundColor: active ? "#dcfce7" : "#fee2e2",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      alignSelf: "center",
    }}
  >
    <Text
      style={{
        color: active ? "#16a34a" : "#dc2626",
        fontSize: 12,
        fontWeight: "500",
      }}
    >
      {active ? labels[0] : labels[1]}
    </Text>
  </View>
);

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function CustomerCreditsTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewCustomerCredit,
  onRowPress,
  onCreditPrevious,
}: CustomerCreditsTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((item) =>
      [item.customer?.name, item.customer?.document_number].some((val) =>
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
        <Input
          className="flex-1 sm:w-64 sm:flex-none bg-white rounded-lg"
          variant="outline"
          size="md"
        >
          <InputSlot style={{ marginLeft: 10 }}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            style={{ color: "#000" }}
            placeholder="Buscar cliente..."
            value={search}
            onChangeText={setSearch}
          />
        </Input>
        <HStack>
          {onCreditPrevious && (
            <Button
              size="md"
              variant="outline"
              style={{ borderColor: "#d4d4d4", borderWidth: 1 }}
              className="px-3 sm:px-4 mr-2"
              onPress={onCreditPrevious}
            >
              <History size={16} color="#000000" className="sm:hidden" />{" "}
              <ButtonText className="hidden sm:flex">
                Asignar crédito anterior
              </ButtonText>
            </Button>
          )}

          {onNewCustomerCredit && (
            <Button
              size="md"
              variant="solid"
              style={{ borderColor: "#d4d4d4", borderWidth: 1 }}
              className="px-3 sm:px-4"
              onPress={onNewCustomerCredit}
            >
              <Plus size={16} color="#ffffff" className="sm:hidden" />
              <ButtonText className="hidden sm:flex">
                Asignar crédito
              </ButtonText>
            </Button>
          )}
        </HStack>
      </HStack>

      <DataTable style={defaultStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Cliente</DataTable.Title>
          {/* <DataTable.Title>Tiene crédito</DataTable.Title> */}
          <DataTable.Title numeric>Límite</DataTable.Title>
          <DataTable.Title numeric>Disponible</DataTable.Title>
          <DataTable.Title numeric>Usado</DataTable.Title>
          <DataTable.Title numeric>Plazo (días)</DataTable.Title>
          {actions && actions.length > 0 && (
            <DataTable.Title>Acciones</DataTable.Title>
          )}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin créditos asignados</Text>
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
                <Text style={{ color: "#000000" }}>{item.customer?.name}</Text>
              </DataTable.Cell>
              {/* 
              <DataTable.Cell>
                <Badge active={item.has_credit} />
              </DataTable.Cell> */}

              <DataTable.Cell numeric>
                <Text style={{ color: "#000000" }}>
                  {formatCurrency(item.credit_limit)}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell numeric>
                <Text style={{ color: "#16a34a" }}>
                  {formatCurrency(item.credit_available)}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell numeric>
                <Text style={{ color: "#dc2626" }}>
                  {formatCurrency(item.credit_used)}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell numeric>
                <Text style={{ color: "#000000" }}>
                  {item.payment_term_days}
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
