import { Button, ButtonText } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { ModalMenuItemResult } from '@/src/types/menuItem/menuItem.types'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

interface OrderLine {
  uid: string
  result: ModalMenuItemResult
}

interface Props {
  lines: OrderLine[]
  onRemove: (uid: string) => void
  onCancel: () => void
  onPay: (lines: OrderLine[], total: number) => void
}

function fmt(amount: number, currency = 'GTQ') {
  return `${currency === 'GTQ' ? 'Q' : currency} ${amount.toFixed(2)}`
}

export const OrderPanel: React.FC<Props> = ({ lines, onRemove, onCancel, onPay }) => {
  const total = lines.reduce((sum, l) => sum + l.result.totalPrice, 0)
  const currency = lines[0]?.result.item.price?.currency ?? 'GTQ'

  return (
    <View style={styles.panel}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orden</Text>
        {lines.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{lines.length}</Text>
          </View>
        )}
      </View>

      {/* Items */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {lines.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sin productos</Text>
          </View>
        ) : (
          lines.map((line) => {
            const { item, variant, modifiers, totalPrice } = line.result
            const details = [
              variant?.name,
              ...modifiers.map((m) => m.modifier_name),
            ].filter(Boolean).join(', ')

            return (
              <View key={line.uid} style={styles.lineItem}>
                <View style={styles.lineTop}>
                  <Text style={styles.lineName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity onPress={() => onRemove(line.uid)} hitSlop={8}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                {details ? (
                  <Text style={styles.lineDetail} numberOfLines={1}>{details}</Text>
                ) : null}
                <Text style={styles.linePrice}>{fmt(totalPrice, currency)}</Text>
              </View>
            )
          })
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{fmt(total, currency)}</Text>
        </View>

        <Button
          variant="outline"
          size="lg"
          onPress={onCancel}
          style={styles.btnCancel}
        >
          <ButtonText style={{ color: '#888' }}>Cancelar orden</ButtonText>
        </Button>

        <Button
          size="lg"
          style={[styles.btnPay, lines.length === 0 && styles.btnDisabled]}
          onPress={() => {
            if (lines.length === 0) return
            onPay(lines, total)
          }}
        >
          <ButtonText style={{ color: '#fff' }}>
            Pagar · {fmt(total, currency)}
          </ButtonText>
        </Button>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    width:"30%",
    backgroundColor: '#fff',
    borderLeftWidth: 0.5,
    borderLeftColor: '#e0e0e0',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  badge: {
    backgroundColor: '#3C3489',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 12,
    color: '#aaa',
  },
  lineItem: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ebebeb',
    padding: 10,
    marginBottom: 8,
  },
  lineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lineName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 6,
  },
  removeBtn: {
    fontSize: 13,
    color: '#bbb',
  },
  lineDetail: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 3,
  },
  linePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3C3489',
    marginTop: 4,
  },
  footer: {
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: '#888',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  btnCancel: {
    borderColor: '#e0e0e0',
  },
  btnPay: {
    backgroundColor: '#3C3489',
  },
  btnDisabled: {
    backgroundColor: '#c4c2e8',
  },
})