import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

export interface MenuItemModifier {
  product_modifier_id: number
  modifier_product_id: number
  name: string
  modifier_group: string
  modifier_name: string
  quantity: number
  min_selection: number
  max_selection: number
  price_adjustment: number
  is_default: boolean
  status: boolean
}

export interface MenuItemVariant {
  id: number
  product_id: number
  name: string
  price_adjustment: number
  adjustment_type: string
  status: boolean
}

export interface MenuItemIngredient {
  id: number
  ingredient_id: number
  quantity: number
  unit: string
  waste_factor: number
}

export interface MenuItemDetail {
  product: {
    id: number
    name: string
    description?: string
    sku: string
    barcode?: string
    brand?: string
    type: string
    unit_of_measure: string
    average_cost: number
    requires_batch: boolean
    availability_status: string
    picture?: string
    status: boolean
  }
  price?: {
    id: number
    amount: number
    currency: string
    is_base: boolean
    status: boolean
  } | null
  recipe?: {
    id: number
    name: string
    version: number
    ingredients: MenuItemIngredient[]
  } | null
  variants: MenuItemVariant[]
  modifiers: MenuItemModifier[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
  data?: MenuItemDetail
}

const InfoRow = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
  const display =
    value === null || value === undefined || value === '' ? '—'
    : typeof value === 'boolean' ? (value ? 'Sí' : 'No')
    : value
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(display)}</Text>
    </View>
  )
}

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
)

const Divider = () => <View style={styles.divider} />

const EmptyHint = ({ label }: { label: string }) => (
  <Text style={styles.emptyHint}>{label}</Text>
)

const Pill = ({
  label,
  color = '#e0e7ff',
  textColor = '#4338ca',
}: {
  label: string
  color?: string
  textColor?: string
}) => (
  <View style={[styles.pill, { backgroundColor: color }]}>
    <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
  </View>
)

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    available:   { bg: '#dcfce7', text: '#16a34a', label: 'Disponible'    },
    unavailable: { bg: '#fee2e2', text: '#dc2626', label: 'No disponible' },
    low_stock:   { bg: '#fef9c3', text: '#ca8a04', label: 'Stock bajo'    },
  }
  const s = map[status ?? ''] ?? { bg: '#f3f4f6', text: '#6b7280', label: status ?? '—' }
  return <Pill label={s.label} color={s.bg} textColor={s.text} />
}

export const ModalMenuItemDetail: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const hasVariants    = (data?.variants?.length   ?? 0) > 0
  const hasModifiers   = (data?.modifiers?.length  ?? 0) > 0
  const hasRecipe      = !!data?.recipe
  const hasIngredients = (data?.recipe?.ingredients?.length ?? 0) > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>

        {/* Header */}
        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.imgBox}>
              <Text style={styles.imgText}>🍽️</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>{data?.product?.name ?? '—'}</Heading>
              <Text style={styles.sku}>SKU: {data?.product?.sku ?? '—'}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={data?.product?.availability_status} />
                <Pill label={data?.product?.type ?? '—'} />
              </View>
            </View>
            {/* Precio destacado */}
            {data?.price && (
              <View style={styles.priceBox}>
                <Text style={styles.priceAmount}>
                  {data.price.currency} {data.price.amount.toFixed(2)}
                </Text>
                {data.price.is_base && (
                  <Text style={styles.priceBase}>Precio base</Text>
                )}
              </View>
            )}
          </View>
        </ModalHeader>

        <ModalBody style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>

            {/* Producto */}
            <SectionTitle title="Producto" />
            <InfoRow label="Descripción"      value={data?.product?.description} />
            <InfoRow label="Marca"            value={data?.product?.brand} />
            <InfoRow label="Código de barras" value={data?.product?.barcode} />
            <InfoRow label="Unidad"           value={data?.product?.unit_of_measure} />
            <InfoRow label="Costo promedio"   value={`Q ${data?.product?.average_cost?.toFixed(2)}`} />
            <InfoRow label="Requiere lote"    value={data?.product?.requires_batch} />

            {/* Receta */}
            <Divider />
            <SectionTitle title="Receta" />
            {hasRecipe ? (
              <>
                <InfoRow label="Nombre"  value={data?.recipe?.name} />
                <InfoRow label="Versión" value={data?.recipe?.version} />

                <Text style={styles.subTitle}>
                  Ingredientes ({data?.recipe?.ingredients?.length ?? 0})
                </Text>

                {hasIngredients ? (
                  data?.recipe?.ingredients.map((ing) => (
                    <View key={ing.id} style={styles.cardRow}>
                      <View style={styles.ingredientLeft}>
                        <Text style={styles.cardLabel}>Ingrediente #{ing.ingredient_id}</Text>
                        <Text style={styles.cardSub}>{ing.quantity} {ing.unit}</Text>
                      </View>
                      {ing.waste_factor > 0 && (
                        <Pill
                          label={`Factor: ${ing.waste_factor}`}
                          color="#fef9c3"
                          textColor="#ca8a04"
                        />
                      )}
                    </View>
                  ))
                ) : (
                  <EmptyHint label="Sin ingredientes registrados" />
                )}
              </>
            ) : (
              <EmptyHint label="Sin receta asignada" />
            )}

            {/* Variantes */}
            <Divider />
            <SectionTitle title={`Variantes (${data?.variants?.length ?? 0})`} />
            {hasVariants ? (
              data?.variants.map((v) => (
                <View key={v.id} style={styles.cardRow}>
                  <Text style={styles.cardLabel}>{v.name}</Text>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardValue}>
                      {v.adjustment_type === 'fixed'
                        ? `+Q ${v.price_adjustment.toFixed(2)}`
                        : `+${v.price_adjustment}%`}
                    </Text>
                    <Pill
                      label={v.status ? 'Activo' : 'Inactivo'}
                      color={v.status ? '#dcfce7' : '#fee2e2'}
                      textColor={v.status ? '#16a34a' : '#dc2626'}
                    />
                  </View>
                </View>
              ))
            ) : (
              <EmptyHint label="Sin variantes" />
            )}

            {/* Modificadores */}
            <Divider />
            <SectionTitle title={`Modificadores (${data?.modifiers?.length ?? 0})`} />
            {hasModifiers ? (
              data?.modifiers.map((m) => (
                <View key={m.product_modifier_id} style={styles.modifierCard}>
                  <View style={styles.modifierHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardLabel}>{m.name}</Text>
                      <Text style={styles.cardSub}>{m.modifier_name} · Grupo: {m.modifier_group}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      {m.price_adjustment > 0 && (
                        <Text style={styles.cardValue}>+Q {m.price_adjustment.toFixed(2)}</Text>
                      )}
                      {m.is_default && (
                        <Pill label="Default" color="#fef9c3" textColor="#ca8a04" />
                      )}
                    </View>
                  </View>
                  <View style={styles.modifierFooter}>
                    <Text style={styles.modifierMeta}>
                      Cantidad: {m.quantity}
                    </Text>
                    <Text style={styles.modifierMeta}>
                      Selección: {m.min_selection}–{m.max_selection}
                    </Text>
                    <Pill
                      label={m.status ? 'Activo' : 'Inactivo'}
                      color={m.status ? '#dcfce7' : '#fee2e2'}
                      textColor={m.status ? '#16a34a' : '#dc2626'}
                    />
                  </View>
                </View>
              ))
            ) : (
              <EmptyHint label="Sin modificadores" />
            )}

          </ScrollView>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" size="sm" onPress={onClose}>
            <ButtonText>Cerrar</ButtonText>
          </Button>
        </ModalFooter>

      </ModalContent>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container:       { backgroundColor: '#fff', maxHeight: '85%' },
  header:          { paddingBottom: 12 },
  headerRow:       { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  imgBox:          { width: 52, height: 52, borderRadius: 12, backgroundColor: '#f3f4f6',
                     alignItems: 'center', justifyContent: 'center',
                     borderWidth: 0.5, borderColor: '#e5e7eb' },
  imgText:         { fontSize: 24 },
  name:            { color: '#111827', fontWeight: '600' },
  sku:             { color: '#6b7280', fontSize: 12, marginTop: 2 },
  badgeRow:        { flexDirection: 'row', gap: 6, marginTop: 6 },
  pill:            { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  pillText:        { fontSize: 11, fontWeight: '500' },
  priceBox:        { alignItems: 'flex-end', marginLeft: 8 },
  priceAmount:     { fontSize: 16, fontWeight: '600', color: '#111827' },
  priceBase:       { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  sectionTitle:    { fontSize: 11, fontWeight: '600', color: '#9ca3af',
                     textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  subTitle:        { fontSize: 12, fontWeight: '500', color: '#6b7280',
                     marginTop: 8, marginBottom: 6 },
  row:             { flexDirection: 'row', justifyContent: 'space-between',
                     paddingVertical: 6, alignItems: 'flex-start' },
  label:           { color: '#6b7280', fontSize: 13, flex: 1 },
  value:           { color: '#111827', fontSize: 13, flex: 1.5, textAlign: 'right' },
  divider:         { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
  emptyHint:       { color: '#9ca3af', fontSize: 13, fontStyle: 'italic', marginBottom: 4 },
  cardRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                     paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f3f4f6' },
  cardRight:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel:       { color: '#111827', fontSize: 13, fontWeight: '500' },
  cardSub:         { color: '#9ca3af', fontSize: 11, marginTop: 2 },
  cardValue:       { color: '#374151', fontSize: 13 },
  ingredientLeft:  { flex: 1 },
  modifierCard:    { borderWidth: 0.5, borderColor: '#e5e7eb', borderRadius: 10,
                     padding: 10, marginBottom: 8 },
  modifierHeader:  { flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'flex-start', marginBottom: 8 },
  modifierFooter:  { flexDirection: 'row', alignItems: 'center', gap: 8,
                     borderTopWidth: 0.5, borderTopColor: '#f3f4f6', paddingTop: 8 },
  modifierMeta:    { fontSize: 11, color: '#6b7280' },
})