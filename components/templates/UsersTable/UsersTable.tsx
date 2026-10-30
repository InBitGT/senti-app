import { Action, ActionsMenu } from "@/components/atom";
import { AppButton } from "@/components/atom/AppButton/AppButton";
import { AppInput } from "@/components/atom/AppInput/AppInput";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Users } from "@/src/types/user/user.types";
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
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

interface OptionalColumn {
  key: OptionalColumnKey;
  label: string;
}

const OPTIONAL_COLUMNS: OptionalColumn[] = [
  { key: "username", label: "Usuario" },
  { key: "role", label: "Rol" },
];

const tableStyle: ViewStyle = {
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

const getFullName = (user: Users): string =>
  `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—";

export function UsersTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewUser,
  onRowPress,
}: UsersTableProps) {
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<
    Record<OptionalColumnKey, boolean>
  >({
    username: false,
    role: false,
  });

  const hasActions = actions !== undefined && actions.length > 0;

  const toggleColumn = (key: OptionalColumnKey): void => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // La búsqueda reinicia la página en el mismo evento,
  // en lugar de hacerlo dentro de un useEffect.
  const handleSearchChange = (text: string): void => {
    setSearch(text);
    setPage(0);
  };

  const filteredData = useMemo<Users[]>(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((user) =>
      [
        user.first_name,
        user.last_name,
        getFullName(user),
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
  // Valor derivado: si los datos cambian y la página queda fuera de rango,
  // se ajusta sin necesidad de un efecto.
  const safePage = Math.min(page, totalPages - 1);
  const from = safePage * itemsPerPage;
  const to = Math.min(from + itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(from, to);

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <HStack className="justify-between items-center mb-4 gap-2">
        <View className="flex-1 sm:w-64 sm:flex-none">
          <AppInput
            placeholder="Buscar usuario..."
            value={search}
            onChangeText={handleSearchChange}
            leftIcon={<SearchIcon size={16} color="#9ca3af" />}
            inputStyle={{ color: "#000" }}
          />
        </View>

        <HStack className="gap-2 items-center shrink-0">
          {/* Filtro de columnas: icono solo en mobile, con texto en desktop */}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <AppButton
                label="Columnas"
                icon={SlidersHorizontal}
                outline
                outlineBorderColor="#d4d4d4"
                outlineTextColor="#374151"
                fullWidth={false}
                shrinkOnMobile
                onPress={() => setMenuVisible(true)}
              />
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
            <AppButton
              label="Crear usuario"
              icon={Plus}
              variant="black"
              fullWidth={false}
              shrinkOnMobile
              onPress={onNewUser}
            />
          )}
        </HStack>
      </HStack>

      <DataTable style={tableStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Nombre</DataTable.Title>
          {visibleColumns.username && (
            <DataTable.Title>Usuario</DataTable.Title>
          )}
          <DataTable.Title>Correo</DataTable.Title>
          <DataTable.Title>Teléfono</DataTable.Title>
          {visibleColumns.role && <DataTable.Title>Rol</DataTable.Title>}
          {hasActions && <DataTable.Title>Acciones</DataTable.Title>}
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
                <Text style={{ color: "#000000" }}>{getFullName(user)}</Text>
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

              {hasActions && (
                <DataTable.Cell>
                  <ActionsMenu row={user} actions={actions ?? []} />
                </DataTable.Cell>
              )}
            </DataTable.Row>
          ))
        )}

        <DataTable.Pagination
          page={safePage}
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
