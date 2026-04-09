// StockEntryTable.tsx
import { Action, ActionsMenu } from '@/components/atom'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { EntryStatus, StockEntry } from '@/src/types/entry_stock/entry_stock.types'
import { SearchIcon } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { DataTable } from 'react-native-paper'

// ── Config de estados ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<EntryStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmado', color: '#27500A', bg: '#EAF3DE' },
  pending:   { label: 'Pendiente',  color: '#633806', bg: '#FAEEDA' },
  cancelled: { label: 'Cancelado',  color: '#791F1F', bg: '#FCEBEB' },
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

interface FilterPillProps {
  label: string
  active: boolean
  color?: string
  bg?: string
  onPress: () => void
}

function FilterPill({ label, active, color, bg, onPress }: FilterPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        active && { backgroundColor: bg ?? '#EAF3DE', borderColor: color ?? '#27500A' },
      ]}
    >
      <Text style={[styles.pillText, active && { color: color ?? '#27500A', fontWeight: '600' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

function StatusBadge({ status }: { status: EntryStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#444', bg: '#eee' }
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  )
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Buttons {
  key?: string
  name: string
  onPress: () => void
  variant?: 'link' | 'solid' | 'outline' | undefined
}

interface StockEntryTableProps {
  data: StockEntry[]
  onRowPress?: (row: StockEntry) => void
  itemsPerPage?: number
  button?: Buttons[]
  actions?: Action<StockEntry>[]
}

// ── Main component ────────────────────────────────────────────────────────────

export function StockEntryTable({
  data,
  onRowPress,
  itemsPerPage = 8,
  button,
  actions,
}: StockEntryTableProps) {
  const [page, setPage]               = useState(0)
  const [search, setSearch]           = useState('')
  const [activeStatus, setActiveStatus] = useState<EntryStatus | null>(null)

  // ── Datos válidos ───────────────────────────────────────────────────────────
  const validData = useMemo(() => data.filter((r) => r?.id != null), [data])

  // ── Contadores por estado ───────────────────────────────────────────────────
  const countByStatus = useMemo(() => {
    const map: Partial<Record<EntryStatus, number>> = {}
    validData.forEach((r) => {
      map[r.entry_status] = (map[r.entry_status] ?? 0) + 1
    })
    return map
  }, [validData])

  // ── Filtrado combinado ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = validData

    if (activeStatus) {
      rows = rows.filter((r) => r.entry_status === activeStatus)
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.document_number.toLowerCase().includes(term) ||
          r.supplier.name.toLowerCase().includes(term)   ||
          r.warehouse.name.toLowerCase().includes(term)  ||
          (r.notes ?? '').toLowerCase().includes(term)
      )
    }

    return rows
  }, [validData, activeStatus, search])

  React.useEffect(() => { setPage(0) }, [filtered.length])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const from       = page * itemsPerPage
  const to         = Math.min(from + itemsPerPage, filtered.length)
  const paginated  = filtered.slice(from, to)

  const totalAmount = filtered.reduce((a, r) => a + r.total, 0)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <VStack style={styles.container}>

      {/* Búsqueda + botones */}
      <HStack className="justify-between items-center mb-4">
        <Input
          className="bg-white rounded-lg"
          variant="outline"
          size="md"
          style={{ flex: 1, marginRight: button?.length ? 12 : 0 }}
        >
          <InputSlot style={{ marginLeft: 10 }}>
            <InputIcon as={SearchIcon} size="sm" />
          </InputSlot>
          <InputField
            placeholder="Buscar documento, proveedor, bodega…"
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
              style={{ borderColor: '#949292', borderWidth: 1 }}
              onPress={btn.onPress}
            >
              <ButtonText style={{color:"#000000"}}>{btn.name}</ButtonText>
            </Button>
          ))}
        </HStack>
      </HStack>

      {/* Pills de estado */}
      <HStack style={styles.pillRow}>
        <FilterPill
          label={`Todos (${validData.length})`}
          active={activeStatus === null}
          onPress={() => setActiveStatus(null)}
        />
        {(Object.entries(STATUS_CONFIG) as [EntryStatus, typeof STATUS_CONFIG[EntryStatus]][]).map(
          ([status, cfg]) =>
            countByStatus[status] ? (
              <FilterPill
                key={status}
                label={`${cfg.label} (${countByStatus[status]})`}
                active={activeStatus === status}
                color={cfg.color}
                bg={cfg.bg}
                onPress={() => setActiveStatus(activeStatus === status ? null : status)}
              />
            ) : null
        )}
      </HStack>

      {/* Tabla */}
      <DataTable style={styles.table}>
        <DataTable.Header style={styles.headerRow}>
          <DataTable.Title style={{ flex: 1.5 }}>Documento</DataTable.Title>
          <DataTable.Title style={{ flex: 2 }}>Proveedor</DataTable.Title>
          <DataTable.Title style={{ flex: 2 }}>Bodega</DataTable.Title>
          <DataTable.Title style={{ flex: 1.5, justifyContent: 'center' }}>Estado</DataTable.Title>
          <DataTable.Title numeric style={{ justifyContent: 'center' }}>Total</DataTable.Title>
          <DataTable.Title style={{ flex: 1.5, justifyContent: 'center' }}>Fecha</DataTable.Title>
          {actions && actions.length > 0 && (
            <DataTable.Title style={{ marginLeft: 10 }}>Acciones</DataTable.Title>
          )}
        </DataTable.Header>

        {paginated.length === 0 ? (
          <DataTable.Row style={styles.row}>
            <DataTable.Cell>
              <Text style={styles.muted}>Sin ingresos</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginated.map((row) => (
            <DataTable.Row
              key={row.id}
              style={styles.row}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
            >
              {/* Documento */}
              <DataTable.Cell style={{ flex: 1.5, marginVertical: 10 }}>
                <View style={{ width: '100%' }}>
                  <Text style={styles.docNumber} numberOfLines={1}>
                    {row.document_number}
                  </Text>
                  <Text style={styles.subText}>#{row.id}</Text>
                </View>
              </DataTable.Cell>

              {/* Proveedor */}
              <DataTable.Cell style={{ flex: 2, marginVertical: 10 }}>
                <View style={{ width: '100%' }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {row.supplier.name}
                  </Text>
                  <Text style={styles.subText} numberOfLines={1}>
                    {row.supplier.contact_name}
                  </Text>
                </View>
              </DataTable.Cell>

              {/* Bodega */}
              <DataTable.Cell style={{ flex: 2, marginVertical: 10 }}>
                <View style={{ width: '100%' }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {row.warehouse.name}
                  </Text>
                  <Text style={styles.subText} numberOfLines={1}>
                    {row.warehouse.type}
                  </Text>
                </View>
              </DataTable.Cell>

              {/* Estado */}
              <DataTable.Cell style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center', alignSelf:"center" }}>
                <StatusBadge status={row.entry_status} />
              </DataTable.Cell>

              {/* Total */}
              <DataTable.Cell numeric style={{ justifyContent: 'center' }}>
                <Text style={styles.total}>Q{row.total.toFixed(2)}</Text>
              </DataTable.Cell>

              {/* Fecha */}
              <DataTable.Cell style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.subText}>
                  {new Date(row.document_date).toLocaleDateString('es-GT')}
                </Text>
              </DataTable.Cell>

              {/* Acciones */}
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
          label={filtered.length > 0 ? `${from + 1}-${to} de ${filtered.length}` : '0 de 0'}
          numberOfItemsPerPage={itemsPerPage}
          showFastPaginationControls
        />
      </DataTable>

      {/* Resumen */}
      <HStack style={[styles.summaryRow, { marginBottom: 12 }]}>
        <SummaryCard label="Ingresos"    value={String(filtered.length)} />
        <SummaryCard label="Confirmados" value={String(filtered.filter((r) => r.entry_status === 'confirmed').length)} />
        <SummaryCard label="Pendientes"  value={String(filtered.filter((r) => r.entry_status === 'pending').length)} />
        <SummaryCard label="Total"       value={`Q${totalAmount.toFixed(2)}`} />
      </HStack>

    </VStack>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  row:          { borderBottomWidth: 0.5, borderBottomColor: '#d4d4d4', minHeight: 64 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  badgeText:    { fontSize: 11, fontWeight: '500' },
  docNumber:    { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  productName:  { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  subText:      { fontSize: 11, color: '#888' },
  total:        { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  muted:        { fontSize: 13, color: '#aaa' },
  summaryRow:   { gap: 8, flexWrap: 'wrap' },
  summaryCard: {
    flex: 1, minWidth: 80, backgroundColor: '#f5f5f5',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
})