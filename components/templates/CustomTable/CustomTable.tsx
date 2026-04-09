import { Action, ActionsMenu } from '@/components/atom';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { SearchIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { DataTable } from 'react-native-paper';

export interface Buttons {
  key?: string;
  name: string;
  onPress: () => void;
  variant?: 'link' | 'solid' | 'outline' | undefined;
  style?: StyleProp<ViewStyle>;
}

export interface ColumnDef<T> {
  key: string;
  title: string;
  numeric?: boolean;
  render?: (row: T) => React.ReactNode;
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
  onRowPress?: (row: T) => void; 
}

export function CustomTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  actions,
  itemsPerPage = 5,
  emptyLabel = 'Sin datos',
  style,
  button,
  searchKeys,
  onRowPress, 
}: CustomTableProps<T>) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    const keys = searchKeys ?? columns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((key) => String(row[key] ?? '').toLowerCase().includes(term))
    );
  }, [data, search, searchKeys, columns]);

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
    backgroundColor: '#ffffff',
    borderColor: '#d4d4d4',
    borderWidth: 0.5,
    borderRadius: 15,
    marginTop:15
  };

  const rowBorder: ViewStyle = {
    borderBottomWidth: 0.5,
    borderBottomColor: '#d4d4d4',
  };

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <HStack className="justify-between items-center mb-4">
        <Input className="w-64 bg-white rounded-lg" variant="outline" size="md">
          <InputSlot style={{marginLeft:10}}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
          />
        </Input>

        <HStack className="gap-3">
          {button?.map((btn) => (
            <Button
              key={btn.key}
              size="md"
              variant={btn.variant}
              style={[btn.style, {borderColor: "#d4d4d4", borderWidth: 1}]}
              onPress={btn.onPress}
            >
              <ButtonText>{btn.name}</ButtonText>
            </Button>
          ))}
        </HStack>
      </HStack>

      <DataTable style={[defaultStyle, style]}>
        <DataTable.Header style={rowBorder}>
          {columns.map((col) => (
            <DataTable.Title key={col.key} numeric={col.numeric}>
              {col.title}
            </DataTable.Title>
          ))}
          {actions && actions.length > 0 && (
            <DataTable.Title style={{ marginLeft: 10 }}>Acciones</DataTable.Title>
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
            <DataTable.Row key={keyExtractor(row)} style={rowBorder} onPress={onRowPress ? () => onRowPress(row) : undefined}>
              {columns.map((col) => (
                <DataTable.Cell key={col.key} numeric={col.numeric}>
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
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
              : '0 de 0'
          }
          numberOfItemsPerPage={itemsPerPage}
          showFastPaginationControls
        />
      </DataTable>
    </VStack>
  );
}