import { Action, ActionsMenu } from "@/components/atom";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  LucideIcon,
  Plus,
  SearchIcon,
  SlidersHorizontal,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Checkbox, DataTable, Menu } from "react-native-paper";

export interface Buttons {
  key?: string;
  name: string;
  onPress: () => void;
  variant?: "link" | "solid" | "outline" | undefined;
  style?: StyleProp<ViewStyle>;
  icon?: LucideIcon;
}

export interface ColumnDef<T> {
  key: string;
  title: string;
  numeric?: boolean;
  render?: (row: T) => React.ReactNode;
  optional?: boolean;
  defaultVisible?: boolean;
}

export interface CustomTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  actions?: Action<T>[];
  itemsPerPage?: number;
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
  button?: Buttons[];
  searchKeys?: string[];
  getSearchableText?: (row: T) => string; // usar cuando los datos vienen anidados
  onRowPress?: (row: T) => void;
}

export function CustomTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  actions,
  itemsPerPage = 5,
  emptyLabel = "Sin datos",
  style,
  button,
  searchKeys,
  getSearchableText,
  onRowPress,
}: CustomTableProps<T>) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const optionalColumns = useMemo(
    () => columns.filter((c) => c.optional),
    [columns],
  );

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () =>
      optionalColumns.reduce(
        (acc, col) => {
          acc[col.key] = col.defaultVisible ?? true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
  );

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const displayedColumns = useMemo(
    () => columns.filter((col) => !col.optional || visibleColumns[col.key]),
    [columns, visibleColumns],
  );

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();

    if (getSearchableText) {
      return data.filter((row) =>
        getSearchableText(row).toLowerCase().includes(term),
      );
    }

    const keys = searchKeys ?? columns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [data, search, searchKeys, columns, getSearchableText]);

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
      <HStack className="justify-between items-center mb-4">
        <Input
          className="bg-white rounded-lg flex-1"
          variant="outline"
          size="md"
          style={{ marginRight: 12 }}
        >
          <InputSlot style={{ marginLeft: 10 }}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
          />
        </Input>

        <HStack className="gap-3 items-center">
          {optionalColumns.length > 0 && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  size="md"
                  variant="outline"
                  className="px-3 sm:px-4"
                  style={{ borderColor: "#d4d4d4", borderWidth: 1 }}
                  onPress={() => setMenuVisible(true)}
                >
                  <SlidersHorizontal size={16} color="#374151" />
                  <ButtonText className="hidden sm:flex sm:ml-1.5">
                    Columnas
                  </ButtonText>
                </Button>
              }
              contentStyle={{ backgroundColor: "#ffffff" }}
            >
              {optionalColumns.map((col) => (
                <Menu.Item
                  key={col.key}
                  onPress={() => toggleColumn(col.key)}
                  title={col.title}
                  leadingIcon={() => (
                    <View style={{ transform: [{ scale: 0.8 }] }}>
                      <Checkbox
                        status={
                          visibleColumns[col.key] ? "checked" : "unchecked"
                        }
                        onPress={() => toggleColumn(col.key)}
                      />
                    </View>
                  )}
                />
              ))}
            </Menu>
          )}

          {button?.map((btn) => {
            const Icon = btn.icon ?? Plus;
            return (
              <Button
                key={btn.key}
                size="md"
                variant={btn.variant}
                className="px-3 sm:px-4"
                style={[btn.style, { borderColor: "#d4d4d4", borderWidth: 1 }]}
                onPress={btn.onPress}
              >
                <Icon
                  size={16}
                  color={btn.variant === "solid" ? "#ffffff" : "#374151"}
                />
                <ButtonText className="hidden sm:flex sm:ml-1.5">
                  {btn.name}
                </ButtonText>
              </Button>
            );
          })}
        </HStack>
      </HStack>

      <DataTable style={[defaultStyle, style]}>
        <DataTable.Header style={rowBorder}>
          {displayedColumns.map((col) => (
            <DataTable.Title key={col.key} numeric={col.numeric}>
              {col.title}
            </DataTable.Title>
          ))}
          {actions && actions.length > 0 && (
            <DataTable.Title style={{ marginLeft: 10 }}>
              Acciones
            </DataTable.Title>
          )}
        </DataTable.Header>

        {paginatedData.length === 0 ? (
          <DataTable.Row style={rowBorder}>
            <DataTable.Cell>
              <Text>{emptyLabel}</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginatedData.map((row) => (
            <DataTable.Row
              key={keyExtractor(row)}
              style={rowBorder}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
            >
              {displayedColumns.map((col) => (
                <DataTable.Cell key={col.key} numeric={col.numeric}>
                  {col.render ? col.render(row) : (row[col.key] ?? "—")}
                </DataTable.Cell>
              ))}
              {actions && actions.length > 0 && (
                <DataTable.Cell>
                  <ActionsMenu row={row} actions={actions} />
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
