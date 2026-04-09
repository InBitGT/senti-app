import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

export interface UserDetail {
  id: number
  username: string
  email: string
  phone: string
  first_name: string
  last_name: string
  is_active: boolean
  two_fa_enabled: boolean
  status: boolean
  created_at: string
  updated_at: string
  role: {
    id: number
    name: string
    description: string
    status: boolean
  }
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    country: string
    postal_code: string
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  data?: UserDetail
}

const InfoRow = ({ label, value }: { label: string; value?: string | number | boolean }) => {
  const display =
    typeof value === 'boolean'
      ? value ? 'Sí' : 'No'
      : value ?? '—'

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

const Avatar = ({ name }: { name: string }) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
  </View>
)

const Badge = ({ active }: { active: boolean }) => (
  <View style={[styles.badge, { backgroundColor: active ? '#dcfce7' : '#fee2e2' }]}>
    <Text style={[styles.badgeText, { color: active ? '#16a34a' : '#dc2626' }]}>
      {active ? 'Activo' : 'Inactivo'}
    </Text>
  </View>
)

export const ModalUserDetail: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const fullName = data ? `${data.first_name} ${data.last_name}` : ''

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent style={styles.container}>

        <ModalHeader style={styles.header}>
          <View style={styles.headerRow}>
            <Avatar name={data?.first_name ?? '?'} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Heading size="md" style={styles.name}>{fullName || '—'}</Heading>
              <Text style={styles.username}>@{data?.username}</Text>
            </View>
            <Badge active={data?.is_active ?? false} />
          </View>
        </ModalHeader>

        <ModalBody>
          <ScrollView showsVerticalScrollIndicator={false}>

            <SectionTitle title="Información personal" />
            <InfoRow label="Nombre"    value={fullName} />
            <InfoRow label="Usuario"   value={data?.username} />
            <InfoRow label="Email"     value={data?.email} />
            <InfoRow label="Teléfono"  value={data?.phone} />

            <Divider />

            <SectionTitle title="Rol" />
            <InfoRow label="Nombre"      value={data?.role?.name} />
            <InfoRow label="Descripción" value={data?.role?.description} />
            <InfoRow label="Estado"      value={data?.role?.status} />

            <Divider />

            <SectionTitle title="Dirección" />
            <InfoRow label="Línea 1"   value={data?.address?.line1} />
            <InfoRow label="Línea 2"   value={data?.address?.line2} />
            <InfoRow label="Ciudad"    value={data?.address?.city} />
            <InfoRow label="Depto."    value={data?.address?.state} />
            <InfoRow label="País"      value={data?.address?.country} />
            <InfoRow label="C. Postal" value={data?.address?.postal_code} />

            <Divider />

            <SectionTitle title="Seguridad" />
            <InfoRow label="2FA habilitado" value={data?.two_fa_enabled} />
            <InfoRow label="Cuenta activa"  value={data?.is_active} />

            <Divider />

            <SectionTitle title="Registro" />
            <InfoRow label="Creado"      value={data?.created_at ? new Date(data.created_at).toLocaleString('es-GT') : '—'} />
            <InfoRow label="Actualizado" value={data?.updated_at ? new Date(data.updated_at).toLocaleString('es-GT') : '—'} />

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
  container:   { backgroundColor: '#fff',maxHeight: '85%', },
  header:      { paddingBottom: 12 },
  headerRow:   { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e7ff',
                 alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 20, fontWeight: '600', color: '#4338ca' },
  name:        { color: '#111827', fontWeight: '600' },
  username:    { color: '#6b7280', fontSize: 13, marginTop: 2 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:   { fontSize: 12, fontWeight: '500' },
  sectionTitle:{ fontSize: 11, fontWeight: '600', color: '#9ca3af',
                 textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  row:         { flexDirection: 'row', justifyContent: 'space-between',
                 paddingVertical: 6, alignItems: 'flex-start' },
  label:       { color: '#6b7280', fontSize: 13, flex: 1 },
  value:       { color: '#111827', fontSize: 13, flex: 1.5, textAlign: 'right' },
  divider:     { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
})