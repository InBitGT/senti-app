import { TableSkeleton } from '@/components/atom/TableSkeleton/TableSkeleton'
import { ComandaItem } from '@/components/molecules/CreateComanda/CreateComanda'
import { Comanda } from '@/components/templates/Comanda/Comanda'
import { OrderPanel } from '@/components/templates/OrderPanel/OrderPanel'
import { useCategorie } from '@/src/hooks'
import { useMenuItem } from '@/src/hooks/useMenuItem/useMenuItem'
import { MenuItem, ModalMenuItemResult } from '@/src/types/menuItem/menuItem.types'
import React, { useState } from 'react'
import { View } from 'react-native'

interface OrderLine {
  uid: string
  result: ModalMenuItemResult
}

export const Order = () => {
  const { data: products, isLoading } = useMenuItem()
  const { data: categorie } = useCategorie()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [lines, setLines] = useState<OrderLine[]>([])

  const handleAdd = (data: MenuItem) => {
    setIsOpen(true)
    setSelectedItem(data)
  }

  const handleConfirm = (result: ModalMenuItemResult) => {
    setLines((prev) => [
      ...prev,
      { uid: `${Date.now()}-${Math.random()}`, result },
    ])
    setIsOpen(false)
  }

  const handleRemove = (uid: string) => {
    setLines((prev) => prev.filter((l) => l.uid !== uid))
  }

  const handleCancel = () => {
    setLines([])
  }

  const handlePay = (lines: OrderLine[], total: number) => {
    console.log('Pagar', { lines, total })
    // aquí conectas tu lógica de pago / endpoint
  }

  if (isLoading) return <TableSkeleton />

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>

      {/* Menú izquierda */}
      <View style={{ flex: 1 }}>
        <Comanda
          data={products || []}
          numColumns={4}
          onSelect={handleAdd}
          categories={categorie || []}
        />
      </View>

      {/* Panel derecho */}
      <OrderPanel
        lines={lines}
        onRemove={handleRemove}
        onCancel={handleCancel}
        onPay={handlePay}
      />

      {/* Modal de configuración del ítem */}
      <ComandaItem
        isOpen={isOpen}
        item={selectedItem}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
      />

    </View>
  )
}