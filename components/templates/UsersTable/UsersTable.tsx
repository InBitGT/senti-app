import { Action, ActionsMenu } from "@/components/atom";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Users } from "@/src/types/user/user.types";
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { View, ViewStyle } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";

export interface UsersTableProps {
  data: Users[];
  actions?: Action<Users>[];
  itemsPerPage?: number;
  onNewUser?: () => void;
  onRowPress?: (row: Users) => void;
}

type OptionalColumnKey = "username" | "role";

const OPTIONAL_COLUMNS: { key: OptionalColumnKey; label: string }[] = [
  { key: "username", label: "Usuario" },
  { key: "role", label: "Rol" },
];

export function UsersTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewUser,
  onRowPress,
}: UsersTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    username: false,
    role: false,
  });

  const toggleColumn = (key: OptionalColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((user) =>
      [
        user.first_name,
        user.last_name,
        user.username,
        user.email,
        user.phone,
        user.role?.name,
      ].some((val) =>
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
            placeholder="Buscar usuario..."
            value={search}
            onChangeText={setSearch}
          />
        </Input>

        <HStack className="gap-2 items-center shrink-0">
          {/* Filtro de columnas: icono solo en mobile, con texto desde sm */}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                size="md"
                variant="outline"
                style={{ borderColor: "#d4d4d4" }}
                className="px-3 sm:px-4"
                onPress={() => setMenuVisible(true)}
              >
                <SlidersHorizontal size={16} color="#374151" />
                <ButtonText className="text-gray-700 hidden sm:flex sm:ml-1.5">
                  Columnas
                </ButtonText>
              </Button>
            }
            contentStyle={{ backgroundColor: "#ffffff" }}
          >
            {OPTIONAL_COLUMNS.map((col) => (
              <Menu.Item
                key={col.key}
                onPress={() => toggleColumn(col.key)}
                title={col.label}
                leadingIcon={() => (
                  <View style={{ transform: [{ scale: 0.8 }], width: 30 }}>
                    <Checkbox
                      status={visibleColumns[col.key] ? "checked" : "unchecked"}
                      onPress={() => toggleColumn(col.key)}
                    />
                  </View>
                )}
              />
            ))}
          </Menu>

          {onNewUser && (
            <Button
              size="md"
              variant="solid"
              style={{ borderColor: "#d4d4d4", borderWidth: 1 }}
              className="px-3 sm:px-4"
              onPress={onNewUser}
            >
              <Plus size={16} color="#ffffff" className="sm:hidden" />
              <ButtonText className="hidden sm:flex">Crear usuario</ButtonText>
            </Button>
          )}
        </HStack>
      </HStack>

      <DataTable style={defaultStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Nombre</DataTable.Title>
          {visibleColumns.username && (
            <DataTable.Title>Usuario</DataTable.Title>
          )}
          <DataTable.Title>Correo</DataTable.Title>
          <DataTable.Title>Teléfono</DataTable.Title>
          {visibleColumns.role && <DataTable.Title>Rol</DataTable.Title>}
          {actions && actions.length > 0 && (
            <DataTable.Title>Acciones</DataTable.Title>
          )}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>Sin usuarios</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginatedData.map((user) => (
            <DataTable.Row
              key={user.id}
              style={rowBorder}
              onPress={onRowPress ? () => onRowPress(user) : undefined}
            >
              <DataTable.Cell>
                <Text
                  style={{ color: "#000000" }}
                >{`${user.first_name} ${user.last_name}`}</Text>
              </DataTable.Cell>

              {visibleColumns.username && (
                <DataTable.Cell>
                  <Text style={{ color: "#000000" }}>{user.username}</Text>
                </DataTable.Cell>
              )}

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>{user.email}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{ color: "#000000" }}>{user.phone}</Text>
              </DataTable.Cell>

              {visibleColumns.role && (
                <DataTable.Cell>
                  <Text style={{ color: "#000000" }}>
                    {user.role?.name ?? "—"}
                  </Text>
                </DataTable.Cell>
              )}

              {actions && actions.length > 0 && (
                <DataTable.Cell>
                  <ActionsMenu row={user} actions={actions} />
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
