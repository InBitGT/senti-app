import { Action, ActionsMenu } from '@/components/atom';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Users } from '@/src/types/user/user.types';
import { SearchIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { ViewStyle } from 'react-native';
import { DataTable } from 'react-native-paper';

export interface UsersTableProps {
  data: Users[];
  actions?: Action<Users>[];
  itemsPerPage?: number;
  onNewUser?: () => void;
  onRowPress?: (row: Users) => void;
}

export function UsersTable({
  data,
  actions,
  itemsPerPage = 5,
  onNewUser,
  onRowPress,
}: UsersTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

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
      ].some((val) => String(val ?? '').toLowerCase().includes(term))
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
    backgroundColor: '#ffffff',
    borderColor: '#d4d4d4',
    borderWidth: 0.5,
    borderRadius: 15,
    marginTop: 15,
  };

  const rowBorder: ViewStyle = {
    borderBottomWidth: 0.5,
    borderBottomColor: '#d4d4d4',
  };

  const activeBadge: ViewStyle = {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  };

  const inactiveBadge: ViewStyle = {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  };

  return (
    <VStack className="flex-1 px-4 py-6 md:px-10">
      <HStack className="justify-between items-center mb-4">
        <Input className="w-64 bg-white rounded-lg" variant="outline" size="md">
          <InputSlot style={{ marginLeft: 10 }}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            placeholder="Buscar usuario..."
            value={search}
            onChangeText={setSearch}
          />
        </Input>

        {onNewUser && (
          <Button
            size="md"
            variant="solid"
            style={{ borderColor: '#d4d4d4', borderWidth: 1 }}
            onPress={onNewUser}
          >
            <ButtonText>Crear usuario</ButtonText>
          </Button>
        )}
      </HStack>

      <DataTable style={defaultStyle}>
        <DataTable.Header style={rowBorder}>
          <DataTable.Title>Nombre</DataTable.Title>
          <DataTable.Title>Usuario</DataTable.Title>
          <DataTable.Title>Correo</DataTable.Title>
          <DataTable.Title>Teléfono</DataTable.Title>
          <DataTable.Title>Rol</DataTable.Title>
          <DataTable.Title>Estado</DataTable.Title>
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
                <Text style={{color:"#000000"}}>{`${user.first_name} ${user.last_name}`}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{color:"#000000"}}>{user.username}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{color:"#000000"}}>{user.email}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{color:"#000000"}}>{user.phone}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <Text style={{color:"#000000"}}>{user.role?.name ?? '—'}</Text>
              </DataTable.Cell>

              <DataTable.Cell>
                <VStack style={user.is_active ? activeBadge : inactiveBadge}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: user.is_active ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </Text>
                </VStack>
              </DataTable.Cell>

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
              : '0 de 0'
          }
          numberOfItemsPerPage={itemsPerPage}
          showFastPaginationControls
        />
      </DataTable>
    </VStack>
  );
}