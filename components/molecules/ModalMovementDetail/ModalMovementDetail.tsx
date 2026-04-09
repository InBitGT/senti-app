import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import { InventoryMovement, MovementType } from '@/src/types/movement/movement.types'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface Props {
  isOpen: boolean
  onClose: () => void
  data?: InventoryMovement
}

interface InfoRowProps {
  label: string
  value: string | number | undefined | null
}

const MOVEMENT_CONFIG: Record<MovementType, { label: string; color: string; bg: string }> = {
  entry:              { label: 'Entrada',        color: '#0C447C', bg: '#E6F1FB' },
  sale_output:        { label: 'Salida venta',   color: '#633806', bg: '#FAEEDA' },
  recipe_consumption: { label: 'Consumo receta', color: '#3C3489', bg: '#EEEDFE' },
  adjustment_in:      { label: 'Ajuste entrada', color: '#27500A', bg: '#EAF3DE' },
  adjustment_out:     { label: 'Ajuste salida',  color: '#791F1F', bg: '#FCEBEB' },
}

const REASON_LABELS: Record<string, string> = {
  stock_entry:        'Entrada stock',
  sale:               'Venta',
  recipe_consumption: 'Receta',
  expired:            'Vencido',
  damage:             'Daño',
  manual_correction:  'Corrección manual',
  physical_count:     'Conteo físico',
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value ?? '—'}</Text>
  </View>
)

export const ModalMovementDetail: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const movCfg = data ? MOVEMENT_CONFIG[data.movement_type] : null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>

        <ModalHeader>
          <View style={styles.headerRow}>
            <Heading size="lg" style={styles.title}>Detalle de Movimiento</Heading>
            {movCfg && (
              <View style={[styles.badge, { backgroundColor: movCfg.bg }]}>
                <Text style={[styles.badgeText, { color: movCfg.color }]}>
                  {movCfg.label}
                </Text>
              </View>
            )}
          </View>
        </ModalHeader>

        <ModalBody>

          {/* Movimiento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Movimiento</Text>
            <InfoRow label="ID"          value={data?.id} />
            <InfoRow label="Referencia"  value={data?.reference_number} />
            <InfoRow label="Razón"       value={data?.reason ? REASON_LABELS[data.reason] ?? data.reason : undefined} />
            <InfoRow label="Cantidad"    value={data?.qty} />
            <InfoRow label="Costo unit." value={data?.unit_cost != null ? `Q${data.unit_cost.toFixed(2)}` : undefined} />
            <InfoRow
              label="Total"
              value={data?.qty != null && data?.unit_cost != null
                ? `Q${(data.qty * data.unit_cost).toFixed(2)}`
                : undefined}
            />
          </View>

          <View style={styles.divider} />

          {/* Producto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Producto</Text>
            <InfoRow label="Nombre"  value={data?.product?.name} />
            <InfoRow label="SKU"     value={data?.product?.sku} />
            <InfoRow label="Marca"   value={data?.product?.brand} />
            <InfoRow label="Unidad"  value={data?.product?.unit_of_measure} />
            <InfoRow label="Tipo"    value={data?.product?.type} />
          </View>

          <View style={styles.divider} />

          {/* Bodega */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bodega</Text>
            <InfoRow label="Nombre"      value={data?.warehouse?.name} />
            <InfoRow label="Tipo"        value={data?.warehouse?.type} />
            <InfoRow label="Por defecto" value={data?.warehouse?.is_default ? 'Sí' : 'No'} />
          </View>

          {/* Lote — solo si aplica */}
          {data?.batch && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lote</Text>
                <InfoRow label="Número"      value={data.batch.batch_number} />
                <InfoRow label="Costo unit." value={`Q${data.batch.unit_cost.toFixed(2)}`} />
                <InfoRow label="Vencimiento" value={data.batch.expiration_date
                  ? new Date(data.batch.expiration_date).toLocaleDateString('es-GT')
                  : undefined}
                />
                <InfoRow label="Estado"      value={data.batch.batch_status} />
                {data.batch.notes && (
                  <InfoRow label="Notas" value={data.batch.notes} />
                )}
              </View>
            </>
          )}

          {/* Notas del movimiento */}
          {data?.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notas</Text>
                <Text style={styles.notes}>{data.notes}</Text>
              </View>
            </>
          )}

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
  container:    { backgroundColor: '#fff', maxHeight: '85%', },
  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  title:        { color: '#000' },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '600' },
  section:      { marginBottom: 4 },
  sectionTitle: { color: '#6b7280', fontSize: 11, fontWeight: '600',
                  textTransform: 'uppercase', marginBottom: 6 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label:        { color: '#374151', fontWeight: '500', flex: 1 },
  value:        { color: '#111827', flex: 1, textAlign: 'right' },
  notes:        { color: '#374151', fontSize: 13, lineHeight: 20 },
  divider:      { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
})