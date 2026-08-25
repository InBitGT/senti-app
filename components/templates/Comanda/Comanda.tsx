import { Category } from '@/src/types'
import { MenuItem } from '@/src/types/menuItem/menuItem.types'
import React, { useMemo, useState } from 'react'
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

type Props = {
  data: MenuItem[]
  onSelect?: (item: MenuItem) => void
  numColumns?: 4 | 5
  categories: Category[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const H_PADDING = 16
const CARD_GAP = 8

// ── Helpers ───────────────────────────────────────────────────────────────────

function cardWidth(containerWidth: number, numColumns: number) {
  return (containerWidth - H_PADDING * 2 - CARD_GAP * (numColumns - 1)) / numColumns
}

function formatPrice(amount: number, currency: string) {
  return `${currency === 'GTQ' ? 'Q' : currency} ${amount.toFixed(2)}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CategoryPill({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
      activeOpacity={0.7}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function ProductCard({
  item,
  colWidth,
  onPress,
}: {
  item: MenuItem
  colWidth: number
  onPress: () => void
}) {
  const amount = item?.price?.amount ?? 0
  const currency = item?.price?.currency ?? 'GTQ'

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { width: colWidth }]}
    >
      <View
        style={[
          styles.dot,
          {
            alignSelf: 'flex-end',
            backgroundColor:
              item.product.availability_status === 'available' ? '#1D9E75' : '#E24B4A',
          },
        ]}
      />
      <Text style={styles.cardName} numberOfLines={2}>
        {item.product.name}
      </Text>
      <Text style={styles.cardSku} numberOfLines={1}>
        {item.product.sku}
      </Text>
      <Text style={styles.cardPrice}>{formatPrice(amount, currency)}</Text>
    </TouchableOpacity>
  )
}

function CategorySection({
  title,
  items,
  colWidth,
  numColumns,
  onSelect,
  showTitle,
}: {
  title: string
  items: MenuItem[]
  colWidth: number
  numColumns: number
  onSelect?: (item: MenuItem) => void
  showTitle: boolean
}) {
  return (
    <View style={styles.section}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.product.id)}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            colWidth={colWidth}
            onPress={() => onSelect?.(item)}
          />
        )}
      />
    </View>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function Comanda({ data, onSelect, numColumns = 4, categories }: Props) {
  const [activeCat, setActiveCat] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width) // fallback inicial

  const colWidth = cardWidth(containerWidth, numColumns)

  // FIX 1: find usaba {} en vez de => , nunca retornaba nada
  const presentCats = useMemo(() => {
    const seen = new Map<number, string>()
    for (const d of data) {
      if (!seen.has(d.product.category_id)) {
        const cat = (categories ?? []).find((c) => c.id === d.product.category_id)
        seen.set(d.product.category_id, cat?.name ?? `Categoría ${d.product.category_id}`)
      }
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }))
  }, [data, categories])

  // FIX 2: cuando activeCat === null (Todos), un solo grupo sin título
  const grouped = useMemo(() => {
    if (activeCat === null) {
      return [{ catId: -1, label: '', items: data }]
    }
    const source = data.filter((d) => d.product.category_id === activeCat)
    const map: Record<number, { label: string; items: MenuItem[] }> = {}
    for (const item of source) {
      const cid = item.product.category_id
      const label = presentCats.find((c) => c.id === cid)?.label ?? `Categoría ${cid}`
      if (!map[cid]) map[cid] = { label, items: [] }
      map[cid].items.push(item)
    }
    return Object.entries(map).map(([id, val]) => ({ catId: Number(id), ...val }))
  }, [data, activeCat, presentCats])

  return (
    <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {/* Category filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsContent}
      >
        <CategoryPill
          label="Todos"
          active={activeCat === null}
          onPress={() => setActiveCat(null)}
        />
        {presentCats.map((cat) => (
          <CategoryPill
            key={cat.id}
            label={cat.label}
            active={activeCat === cat.id}
            onPress={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
          />
        ))}
      </ScrollView>

      {/* Sections */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {grouped.map((group) => (
          <CategorySection
            key={group.catId}
            title={group.label}
            items={group.items}
            colWidth={colWidth}
            numColumns={numColumns}
            onSelect={onSelect}
            showTitle={activeCat !== null}
          />
        ))}

        {grouped.length === 0 && (
          <Text style={styles.empty}>Sin productos en esta categoría.</Text>
        )}
      </ScrollView>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
  },
  pillsScroll: { marginBottom: 16, flexGrow: 0,
  flexShrink: 0, },
  pillsContent: { gap: 6, paddingBottom: 4 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#d4d4d4',
    backgroundColor: '#fff',
  },
  pillActive: {
    borderColor: '#3C3489',
    backgroundColor: '#EEEDFE',
  },
  pillText: { fontSize: 12, color: '#666' },
  pillTextActive: { color: '#3C3489', fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  columnWrapper: { gap: CARD_GAP, marginBottom: CARD_GAP },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 10,
    minHeight: 90,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 5,
  },
  cardName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 16,
    marginBottom: 2,
  },
  cardSku: {
    fontSize: 10,
    color: '#aaa',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C3489',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '600' },
  badgeVariant: { backgroundColor: '#E6F1FB' },
  badgeTextVariant: { color: '#185FA5' },
  badgeMod: { backgroundColor: '#FAEEDA' },
  badgeTextMod: { color: '#854F0B' },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 13,
    marginTop: 40,
  },
})