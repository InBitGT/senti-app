import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import { InventoryStockDetail } from '@/src/types/inventory_stock/inventory_stock.types'
import React from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'

interface Props {
  isOpen: boolean
  onClose: () => void
  data?: InventoryStockDetail
}

interface InfoRowProps {
  label: string
  value: string | number | undefined
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value ?? '—'}</Text>
  </View>
)

export const ModalInventoryStockDetail: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const SCREEN_HEIGHT = Dimensions.get('window').height

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={[styles.container, { maxHeight: SCREEN_HEIGHT * 0.75 }]}>
        <ModalHeader>
          <Heading size="lg" style={styles.title}>Detalle de Inventario</Heading>
        </ModalHeader>

        <ModalBody style={{ maxHeight: SCREEN_HEIGHT * 0.55 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bodega</Text>
              <InfoRow label="ID Bodega" value={data?.warehouse_id} />
              <InfoRow label="Nombre"    value={data?.warehouse_name} />
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Producto</Text>
              <InfoRow label="ID Producto" value={data?.product_id} />
              <InfoRow label="Nombre"      value={data?.product_name} />
              <InfoRow label="SKU"         value={data?.sku} />
              <InfoRow label="Unidad"      value={data?.unit_of_measure} />
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stock</Text>
              <InfoRow label="En Mano"     value={data?.total_qty_on_hand} />
              <InfoRow label="Reservada"   value={data?.total_qty_reserved} />
              <InfoRow label="Disponible"  value={data?.available_qty} />
              <InfoRow label="Costo Prom." value={data?.average_cost} />
              <InfoRow label="Lotes"       value={data?.batch_lines} />
            </View>
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
  container:    { backgroundColor: '#fff', maxHeight: '80%' },  // 👈
  title:        { color: '#000' },
  section:      { marginBottom: 4 },
  sectionTitle: { color: '#6b7280', fontSize: 11, fontWeight: '600',
                  textTransform: 'uppercase', marginBottom: 6 },
  row:          { flexDirection: 'row', justifyContent: 'space-between',
                  paddingVertical: 4 },
  label:        { color: '#374151', fontWeight: '500', flex: 1 },
  value:        { color: '#111827', flex: 1, textAlign: 'right' },
  divider:      { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
})
