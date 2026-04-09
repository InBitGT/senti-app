// MovementsTable.tsx
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { InventoryMovement, MovementType } from '@/src/types/movement/movement.types';
import { SearchIcon } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { DataTable } from 'react-native-paper';

const MOVEMENT_CONFIG: Record<MovementType, { label: string; color: string; bg: string }> = {
  entry:              { label: 'Entrada',        color: '#0C447C', bg: '#E6F1FB' },
  sale_output:        { label: 'Salida venta',   color: '#633806', bg: '#FAEEDA' },
  recipe_consumption: { label: 'Consumo receta', color: '#3C3489', bg: '#EEEDFE' },
  adjustment_in:      { label: 'Ajuste entrada', color: '#27500A', bg: '#EAF3DE' },
  adjustment_out:     { label: 'Ajuste salida',  color: '#791F1F', bg: '#FCEBEB' },
};

interface FilterPillProps {
  label: string;
  active: boolean;
  color?: string;
  bg?: string;
  onPress: () => void;
}

function FilterPill({ label, active, color, bg, onPress }: FilterPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        active && { backgroundColor: bg ?? '#E6F1FB', borderColor: color ?? '#0C447C' },
      ]}
    >
      <Text style={[styles.pillText, active && { color: color ?? '#0C447C', fontWeight: '600' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MovementBadge({ type }: { type: MovementType }) {
  const cfg = MOVEMENT_CONFIG[type] ?? { label: type, color: '#444', bg: '#eee' };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

interface MovementsTableProps {
  data: InventoryMovement[];
  onRowPress?: (row: InventoryMovement) => void;
  itemsPerPage?: number;
}

export function MovementsTable({ data, onRowPress, itemsPerPage = 8 }: MovementsTableProps) {
  const [page, setPage]             = useState(0);
  const [search, setSearch]         = useState('');
  const [activeType, setActiveType] = useState<MovementType | null>(null);

  // ── Datos válidos (product nunca null) ──────────────────────────────────────
  const validData = useMemo(() => data.filter((r) => r?.product != null), [data]);

  // ── Filtrado combinado ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = validData;

    if (activeType) {
      rows = rows.filter((r) => r.movement_type === activeType);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.product.name.toLowerCase().includes(term) ||
          r.product.sku.toLowerCase().includes(term)  ||
          r.reference_number.toLowerCase().includes(term) ||
          (r.batch?.batch_number ?? '').toLowerCase().includes(term)
      );
    }

    return rows;
  }, [validData, activeType, search]);

  React.useEffect(() => { setPage(0); }, [filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const from       = page * itemsPerPage;
  const to         = Math.min(from + itemsPerPage, filtered.length);
  const paginated  = filtered.slice(from, to);

  // ── Contadores por tipo ─────────────────────────────────────────────────────
  const countByType = useMemo(() => {
    const map: Partial<Record<MovementType, number>> = {};
    validData.forEach((r) => {
      map[r.movement_type] = (map[r.movement_type] ?? 0) + 1;
    });
    return map;
  }, [validData]);

  return (
    <VStack style={styles.container}>

      {/* Búsqueda */}
      <Input className="bg-white rounded-lg mb-3" variant="outline" size="md">
        <InputSlot style={{ marginLeft: 10 }}>
          <InputIcon as={SearchIcon} size="sm" />
        </InputSlot>
        <InputField
          style={{ color:"#000000"}}
          placeholder="Buscar producto, SKU, referencia, lote…"
          value={search}
          onChangeText={setSearch}
        />
      </Input>

      {/* Pills */}
      <HStack style={styles.pillRow}>
        <FilterPill
          label={`Todos (${validData.length})`}
          active={activeType === null}
          onPress={() => setActiveType(null)}
        />
        {(Object.entries(MOVEMENT_CONFIG) as [MovementType, typeof MOVEMENT_CONFIG[MovementType]][]).map(
          ([type, cfg]) =>
            countByType[type] ? (
              <FilterPill
                key={type}
                label={`${cfg.label} (${countByType[type]})`}
                active={activeType === type}
                color={cfg.color}
                bg={cfg.bg}
                onPress={() => setActiveType(activeType === type ? null : type)}
              />
            ) : null
        )}
      </HStack>

      {/* Tabla */}
      <DataTable style={styles.table}>
       <DataTable.Header style={styles.headerRow}>
            <DataTable.Title style={{ flex: 1 }}>Producto</DataTable.Title>
            <DataTable.Title style={{ flex: 1, justifyContent: 'center' }}>Tipo</DataTable.Title>
            <DataTable.Title numeric style={{ justifyContent: 'center' }}>Cant.</DataTable.Title>
            <DataTable.Title numeric style={{ justifyContent: 'center' }}>Costo u.</DataTable.Title>
            <DataTable.Title numeric style={{ justifyContent: 'center' }}>Total</DataTable.Title>
            <DataTable.Title style={{ flex: 1.5, justifyContent: 'center' }}>Referencia</DataTable.Title>
        </DataTable.Header>

        {paginated.length === 0 ? (
          <DataTable.Row style={styles.row}>
            <DataTable.Cell>
              <Text style={styles.empty}>Sin movimientos</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginated.map((row) => (
            <DataTable.Row
              key={row.id}
              style={styles.row}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
            >
              <DataTable.Cell style={{ flex: 1, marginVertical: 10 }}>
                <VStack style={{ flex: 1 }}>
                    <Text style={styles.productName} numberOfLines={1}>
                    {row.product?.name ?? '—'}
                    </Text>
                    <Text style={styles.sku}>{row.product?.sku ?? '—'}</Text>
                    {row.batch?.batch_number ? (
                    <Text style={styles.batchLabel}>{row.batch.batch_number}</Text>
                    ) : null}
                </VStack>
                </DataTable.Cell>

                <DataTable.Cell style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignSelf:"center" }}>
                    <MovementBadge type={row.movement_type} />
                </DataTable.Cell>

                <DataTable.Cell numeric style={{ justifyContent: 'center' }}>
                    <Text style={styles.qty}>
                        {row.qty % 1 === 0 ? row.qty : row.qty.toFixed(2)}
                    </Text>
                </DataTable.Cell>

                <DataTable.Cell numeric style={{ justifyContent: 'center' }}>
                    <Text style={styles.cost}>Q{row.unit_cost.toFixed(2)}</Text>
                </DataTable.Cell>

                <DataTable.Cell numeric style={{ justifyContent: 'center' }}>
                    <Text style={styles.total}>
                        Q{(row.qty * row.unit_cost).toFixed(2)}
                    </Text>
                </DataTable.Cell>

                <DataTable.Cell style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.ref}>{row.reference_number ?? '—'}</Text>
                </DataTable.Cell>
            </DataTable.Row>
          ))
        )}

        <DataTable.Pagination
          page={page}
          numberOfPages={totalPages}
          onPageChange={setPage}
          label={filtered.length > 0 ? `${from + 1}-${to} de ${filtered.length}` : '0 de 0'}
          numberOfItemsPerPage={itemsPerPage}
          showFastPaginationControls
        />
      </DataTable>

      <HStack style={styles.summaryRow}>
        <SummaryCard label="Movimientos" value={String(filtered.length)} />
        <SummaryCard
          label="Cant. total"
          value={filtered.reduce((a, r) => a + r.qty, 0).toFixed(1)}
        />
        <SummaryCard
          label="Valor total"
          value={`Q${filtered.reduce((a, r) => a + r.qty * r.unit_cost, 0).toFixed(2)}`}
        />
        <SummaryCard
          label="Con lote"
          value={String(filtered.filter((r) => r.batch).length)}
        />
      </HStack>

    </VStack>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, paddingHorizontal: 16, paddingVertical: 20 },
  pillRow:      { flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 0.5, borderColor: '#d4d4d4',
    backgroundColor: '#fff',
  },
  pillText:     { fontSize: 12, color: '#666' },
  table: {
    backgroundColor: '#fff', borderColor: '#d4d4d4',
    borderWidth: 0.5, borderRadius: 15, marginBottom: 12,
  },
  headerRow:    { borderBottomWidth: 0.5, borderBottomColor: '#d4d4d4' },
  row:          { borderBottomWidth: 0.5, borderBottomColor: '#d4d4d4',minHeight: 64 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  badgeText:    { fontSize: 11, fontWeight: '500' },
  productName:  { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  sku:          { fontSize: 11, color: '#888' },
  batchLabel:   { fontSize: 10, color: '#0C447C', marginTop: 1 },
  qty:          { fontSize: 13, fontWeight: '500' },
  cost:         { fontSize: 13, color: '#555' },
  total:        { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  ref:          { fontSize: 11, color: '#888' },
  empty:        { color: '#aaa', fontSize: 13 },
  summaryRow:   { gap: 8, flexWrap: 'wrap', marginBottom:20 },
  summaryCard: {
    flex: 1, minWidth: 80, backgroundColor: '#f5f5f5',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
});