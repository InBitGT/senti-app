import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export interface EntryDetail {
  id: number
  document_number: string
  document_date: string
  total: number
  entry_status: string
  notes?: string
  supplier: {
    name: string
    nit: string
    phone: string
    email: string
    contact_name: string
    description?: string
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  data?: EntryDetail
}

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value ?? '—'}</Text>
  </View>
)

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
)

const Divider = () => <View style={styles.divider} />

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    confirmed: { bg: '#dcfce7', text: '#16a34a', label: 'Confirmado' },
    pending:   { bg: '#fef9c3', text: '#ca8a04', label: 'Pendiente'  },
    cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Cancelado'  },
  }
  const s = map[status ?? ''] ?? { bg: '#f3f4f6', text: '#6b7280', label: status ?? '—' }
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
    </View>
  )
}

export const ModalEntryDetail: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const formattedDate = data?.document_date
    ? new Date(data.document_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>

        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Heading size="md" style={styles.docNumber}>{data?.document_number ?? '—'}</Heading>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
            <StatusBadge status={data?.entry_status} />
          </View>
        </ModalHeader>

        <ModalBody>

          <SectionTitle title="Factura" />
          <InfoRow label="No. Documento" value={data?.document_number} />
          <InfoRow label="Fecha"         value={formattedDate} />
          <InfoRow label="Total"         value={`Q ${data?.total?.toFixed(2)}`} />
          <InfoRow label="Notas"         value={data?.notes} />

          <Divider />

          <SectionTitle title="Proveedor" />
          <InfoRow label="Nombre"        value={data?.supplier?.name} />
          <InfoRow label="NIT"           value={data?.supplier?.nit} />
          <InfoRow label="Teléfono"      value={data?.supplier?.phone} />
          <InfoRow label="Email"         value={data?.supplier?.email} />
          <InfoRow label="Contacto"      value={data?.supplier?.contact_name} />

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
  container:  { backgroundColor: '#fff', maxHeight: '85%' },
  header:     { paddingBottom: 12 },
  headerRow:  { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  docNumber:  { color: '#111827', fontWeight: '600' },
  date:       { color: '#6b7280', fontSize: 12, marginTop: 2 },
  badge:      { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:  { fontSize: 11, fontWeight: '500' },
  sectionTitle:{ fontSize: 11, fontWeight: '600', color: '#9ca3af',
                 textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  row:        { flexDirection: 'row', justifyContent: 'space-between',
                paddingVertical: 6, alignItems: 'flex-start' },
  label:      { color: '#6b7280', fontSize: 13, flex: 1 },
  value:      { color: '#111827', fontSize: 13, flex: 1.5, textAlign: 'right' },
  divider:    { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
})