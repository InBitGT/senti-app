import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

export interface ProductDetail {
  id: number
  tenant_id: number
  category_id: number
  name: string
  description?: string
  sku: string
  barcode?: string
  brand?: string | null
  type: string
  unit_of_measure: string
  average_cost: number
  requires_batch: boolean
  availability_status: string
  picture?: string | null
  is_modifier: boolean
  modifier_group?: string
  modifier_name?: string
  modifier_quantity?: number
  modifier_min_selection?: number
  modifier_max_selection?: number
  modifier_price_adjustment?: number
  modifier_is_default?: boolean
}

interface Props {
  isOpen: boolean
  onClose: () => void
  data?: ProductDetail
}

const InfoRow = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
  const display =
    value === null || value === undefined ? '—'
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

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    available:   { bg: '#dcfce7', text: '#16a34a', label: 'Disponible' },
    unavailable: { bg: '#fee2e2', text: '#dc2626', label: 'No disponible' },
    low_stock:   { bg: '#fef9c3', text: '#ca8a04', label: 'Stock bajo' },
  }
  const s = map[status ?? ''] ?? { bg: '#f3f4f6', text: '#6b7280', label: status ?? '—' }
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
    </View>
  )
}

const TypeBadge = ({ type }: { type?: string }) => (
  <View style={styles.typeBadge}>
    <Text style={styles.typeBadgeText}>{type ?? '—'}</Text>
  </View>
)

export const ModalProductDetail: React.FC<Props> = ({ isOpen, onClose, data }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>

        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            {/* Icono placeholder si no hay picture */}
            <View style={styles.imgBox}>
              <Text style={styles.imgText}>📦</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>{data?.name ?? '—'}</Heading>
              <Text style={styles.sku}>SKU: {data?.sku ?? '—'}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={data?.availability_status} />
                <TypeBadge type={data?.type} />
              </View>
            </View>
          </View>
        </ModalHeader>

        <ModalBody style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>

            <SectionTitle title="General" />
            <InfoRow label="Descripción"     value={data?.description} />
            <InfoRow label="Marca"           value={data?.brand} />
            <InfoRow label="Código de barras" value={data?.barcode} />
            <InfoRow label="Unidad de medida" value={data?.unit_of_measure} />
            <InfoRow label="Costo promedio"  value={`Q ${data?.average_cost?.toFixed(2)}`} />
            <InfoRow label="Requiere lote"   value={data?.requires_batch} />

            {data?.is_modifier && (
              <>
                <Divider />
                <SectionTitle title="Modificador" />
                <InfoRow label="Es modificador"  value={data?.is_modifier} />
                <InfoRow label="Grupo"           value={data?.modifier_group} />
                <InfoRow label="Nombre"          value={data?.modifier_name} />
                <InfoRow label="Cantidad"        value={data?.modifier_quantity} />
                <InfoRow label="Selec. mínima"   value={data?.modifier_min_selection} />
                <InfoRow label="Selec. máxima"   value={data?.modifier_max_selection} />
                <InfoRow label="Ajuste de precio" value={`Q ${data?.modifier_price_adjustment?.toFixed(2)}`} />
                <InfoRow label="Por defecto"     value={data?.modifier_is_default} />
              </>
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
  container:     { backgroundColor: '#fff', maxHeight: '85%' },
  header:        { paddingBottom: 12 },
  headerRow:     { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  imgBox:        { width: 52, height: 52, borderRadius: 12, backgroundColor: '#f3f4f6',
                   alignItems: 'center', justifyContent: 'center',
                   borderWidth: 0.5, borderColor: '#e5e7eb' },
  imgText:       { fontSize: 24 },
  name:          { color: '#111827', fontWeight: '600' },
  sku:           { color: '#6b7280', fontSize: 12, marginTop: 2 },
  badgeRow:      { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge:         { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:     { fontSize: 11, fontWeight: '500' },
  typeBadge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
                   backgroundColor: '#e0e7ff' },
  typeBadgeText: { fontSize: 11, fontWeight: '500', color: '#4338ca' },
  sectionTitle:  { fontSize: 11, fontWeight: '600', color: '#9ca3af',
                   textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  row:           { flexDirection: 'row', justifyContent: 'space-between',
                   paddingVertical: 6, alignItems: 'flex-start' },
  label:         { color: '#6b7280', fontSize: 13, flex: 1 },
  value:         { color: '#111827', fontSize: 13, flex: 1.5, textAlign: 'right' },
  divider:       { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
})