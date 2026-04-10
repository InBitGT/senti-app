import { Action, ActionsMenu } from '@/components/atom'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { MenuItem } from '@/src/types/menuItem/menuItem.types'
import { SearchIcon } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { DataTable } from 'react-native-paper'
import { Buttons } from '../CustomTable'

// ── Paleta dinámica ───────────────────────────────────────────────────────────

const COLOR_PALETTE = [
  { bg: '#EAF3DE', color: '#27500A' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#E6F1FB', color: '#0C447C' },
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#FCEBEB', color: '#791F1F' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FBEAF0', color: '#72243E' },
]

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
        active && { backgroundColor: bg ?? '#EEEDFE', borderColor: color ?? '#3C3489' },
      ]}
    >
      <Text style={[styles.pillText, active && { color: color ?? '#3C3489', fontWeight: '600' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

function CountBadge({ count, bg, color }: { count: number; bg: string; color: string }) {
  if (count === 0) return <Text style={styles.muted}>—</Text>
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{count}</Text>
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

function StatusDot({ active }: { active: boolean }) {
  return (
    <View style={[styles.dot, { backgroundColor: active ? '#1D9E75' : '#d4d4d4' }]} />
  )
}

// ── Tipos ─────────────────────────────────────────────────────────────────────


interface MenuItemsTableProps {
  data: MenuItem[]
  onRowPress?: (row: MenuItem) => void
  itemsPerPage?: number
  button?: Buttons[]
  actions?: Action<MenuItem>[]
}

// ── Main component ────────────────────────────────────────────────────────────

export function MenuItemsTable({
  data,
  onRowPress,
  itemsPerPage = 8,
  button,
  actions,
}: MenuItemsTableProps) {
  const [page, setPage]                   = useState(0)
  const [search, setSearch]               = useState('')
  const [activeFilter, setActiveFilter]   = useState<'all' | 'with_recipe' | 'with_price' | 'with_variants' | 'with_modifiers'>('all')

  // ── Datos válidos ───────────────────────────────────────────────────────────
  const validData = useMemo(() => data.filter((r) => r?.product != null), [data])

  // ── Filtrado combinado ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = validData

    if (activeFilter === 'with_recipe')    rows = rows.filter((r) => r.recipe != null)
    if (activeFilter === 'with_price')     rows = rows.filter((r) => r.price != null)
    if (activeFilter === 'with_variants')  rows = rows.filter((r) => r.variants.length > 0)
    if (activeFilter === 'with_modifiers') rows = rows.filter((r) => r.modifiers.length > 0)

    if (search.trim()) {
      const term = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.product.name.toLowerCase().includes(term) ||
          r.product.sku.toLowerCase().includes(term)  ||
          r.product.brand.toLowerCase().includes(term) ||
          (r.recipe?.name ?? '').toLowerCase().includes(term)
      )
    }

    return rows
  }, [validData, activeFilter, search])

  React.useEffect(() => { setPage(0) }, [filtered.length])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const from       = page * itemsPerPage
  const to         = Math.min(from + itemsPerPage, filtered.length)
  const paginated  = filtered.slice(from, to)

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
            placeholder="Buscar producto, SKU, marca, receta…"
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
              style={{ borderColor: '#d4d4d4', borderWidth: 1 }}
              onPress={btn.onPress}
            >
              <ButtonText>{btn.name}</ButtonText>
            </Button>
          ))}
        </HStack>
      </HStack>

      {/* Pills de filtro */}
      <HStack style={styles.pillRow}>
        <FilterPill
          label={`Todos (${validData.length})`}
          active={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        <FilterPill
          label={`Con receta (${validData.filter((r) => r.recipe).length})`}
          active={activeFilter === 'with_recipe'}
          color={COLOR_PALETTE[0].color}
          bg={COLOR_PALETTE[0].bg}
          onPress={() => setActiveFilter(activeFilter === 'with_recipe' ? 'all' : 'with_recipe')}
        />
        <FilterPill
          label={`Con precio (${validData.filter((r) => r.price).length})`}
          active={activeFilter === 'with_price'}
          color={COLOR_PALETTE[1].color}
          bg={COLOR_PALETTE[1].bg}
          onPress={() => setActiveFilter(activeFilter === 'with_price' ? 'all' : 'with_price')}
        />
        <FilterPill
          label={`Con variantes (${validData.filter((r) => r.variants.length > 0).length})`}
          active={activeFilter === 'with_variants'}
          color={COLOR_PALETTE[2].color}
          bg={COLOR_PALETTE[2].bg}
          onPress={() => setActiveFilter(activeFilter === 'with_variants' ? 'all' : 'with_variants')}
        />
        <FilterPill
          label={`Con modificadores (${validData.filter((r) => r.modifiers.length > 0).length})`}
          active={activeFilter === 'with_modifiers'}
          color={COLOR_PALETTE[3].color}
          bg={COLOR_PALETTE[3].bg}
          onPress={() => setActiveFilter(activeFilter === 'with_modifiers' ? 'all' : 'with_modifiers')}
        />
      </HStack>

      {/* Resumen */}
      <HStack style={[styles.summaryRow, { marginBottom: 12 }]}>
        <SummaryCard label="Items"       value={String(filtered.length)} />
        <SummaryCard label="Con receta"  value={String(filtered.filter((r) => r.recipe).length)} />
        <SummaryCard label="Con precio"  value={String(filtered.filter((r) => r.price).length)} />
        <SummaryCard
          label="Precio prom."
          value={
            filtered.filter((r) => r.price).length
              ? `Q${(
                  filtered
                    .filter((r) => r.price)
                    .reduce((a, r) => a + (r.price?.amount ?? 0), 0) /
                  filtered.filter((r) => r.price).length
                ).toFixed(2)}`
              : '—'
          }
        />
      </HStack>

      {/* Tabla */}
      <DataTable style={styles.table}>
        <DataTable.Header style={styles.headerRow}>
          <DataTable.Title style={{ flex: 2 }}>Producto</DataTable.Title>
          <DataTable.Title style={{ flex: 1.5, justifyContent: 'center' }}>Precio</DataTable.Title>
          <DataTable.Title style={{ flex: 1.5, justifyContent: 'center' }}>Receta</DataTable.Title>
          <DataTable.Title numeric style={{ justifyContent: 'center' }}>Variantes</DataTable.Title>
          <DataTable.Title numeric style={{ justifyContent: 'center' }}>Mods.</DataTable.Title>
          <DataTable.Title style={{ justifyContent: 'center' }}>Activo</DataTable.Title>
          {actions && actions.length > 0 && (
            <DataTable.Title style={{ marginLeft: 10 }}>Acciones</DataTable.Title>
          )}
        </DataTable.Header>

        {paginated.length === 0 ? (
          <DataTable.Row style={styles.row}>
            <DataTable.Cell>
              <Text style={styles.muted}>Sin items de menú</Text>
            </DataTable.Cell>
          </DataTable.Row>
        ) : (
          paginated.map((row) => (
            <DataTable.Row
              key={row.product.id}
              style={styles.row}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
            >
              {/* Producto */}
              <DataTable.Cell style={{ flex: 2, marginVertical: 10 }}>
                <View style={{ width: '100%' }}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {row.product.name}
                  </Text>
                  <Text style={styles.sku} numberOfLines={1}>{row.product.sku}</Text>
                  {row.product.brand ? (
                    <Text style={styles.brand} numberOfLines={1}>{row.product.brand}</Text>
                  ) : null}
                </View>
              </DataTable.Cell>

              {/* Precio */}
              <DataTable.Cell style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                {row.price ? (
                  <View style={[styles.badge, { backgroundColor: COLOR_PALETTE[1].bg }]}>
                    <Text style={[styles.badgeText, { color: COLOR_PALETTE[1].color }]}>
                      Q{row.price.amount.toFixed(2)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.muted}>Sin precio</Text>
                )}
              </DataTable.Cell>

              {/* Receta */}
              <DataTable.Cell style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                {row.recipe ? (
                  <View style={{ alignItems: 'center' }}>
                    <View style={[styles.badge, { backgroundColor: COLOR_PALETTE[0].bg }]}>
                      <Text style={[styles.badgeText, { color: COLOR_PALETTE[0].color }]}>
                        {row.recipe.name}
                      </Text>
                    </View>
                    <Text style={styles.version}>v{row.recipe.version} · {row.recipe.ingredients.length} ing.</Text>
                  </View>
                ) : (
                  <Text style={styles.muted}>Sin receta</Text>
                )}
              </DataTable.Cell>

              {/* Variantes */}
              <DataTable.Cell numeric style={{ justifyContent: 'center' }}>
                <CountBadge
                  count={row.variants.length}
                  bg={COLOR_PALETTE[2].bg}
                  color={COLOR_PALETTE[2].color}
                />
              </DataTable.Cell>

              {/* Modificadores */}
              <DataTable.Cell numeric style={{ justifyContent: 'center' }}>
                <CountBadge
                  count={row.modifiers.length}
                  bg={COLOR_PALETTE[3].bg}
                  color={COLOR_PALETTE[3].color}
                />
              </DataTable.Cell>

              {/* Activo */}
              <DataTable.Cell style={{ justifyContent: 'center', alignItems: 'center' }}>
                <StatusDot active={row.product.status} />
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
  productName:  { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  sku:          { fontSize: 11, color: '#888' },
  brand:        { fontSize: 10, color: '#0C447C', marginTop: 1 },
  version:      { fontSize: 10, color: '#888', marginTop: 2 },
  muted:        { fontSize: 12, color: '#aaa' },
  dot:          { width: 10, height: 10, borderRadius: 5 },
  summaryRow:   { gap: 8, flexWrap: 'wrap' },
  summaryCard: {
    flex: 1, minWidth: 80, backgroundColor: '#f5f5f5',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
})