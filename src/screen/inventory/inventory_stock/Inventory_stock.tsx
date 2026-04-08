import { ColumnDef, CustomTable } from '@/components';
import { ModalInventoryStockDetail } from '@/components/molecules/ModalInventoryStock/ModalInventoryStock';
import { useInventoryStock } from '@/src/hooks/useInventoryStock/useInventoryStock';
import { InventoryStockDetail } from '@/src/types/inventory_stock/inventory_stock.types';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

export const InventoryStock: React.FC = () => {
  const [showModal,setShowModal] = useState<boolean>(false)
  const [modal,setmodal] = useState<InventoryStockDetail| undefined>(undefined)
    const { stockData } = useInventoryStock()
  const hadleModal = (data:InventoryStockDetail)=>{
    setShowModal(true)
    setmodal(data)
  }

  const columns: ColumnDef<InventoryStockDetail>[] = [
        { key: 'warehouse_id', title: 'ID Bodega' },
        { key: 'warehouse_name', title: 'Bodega' },
        { key: 'product_id', title: 'ID Producto' },
        { key: 'product_name', title: 'Producto' },
        { key: 'sku', title: 'SKU' },
        { key: 'unit_of_measure', title: 'Unidad de Medida' },
        { key: 'total_qty_on_hand', title: 'Cantidad en Mano' },
        { key: 'total_qty_reserved', title: 'Cantidad Reservada' },
        { key: 'available_qty', title: 'Cantidad Disponible' },
        { key: 'average_cost', title: 'Costo Promedio' },
        { key: 'batch_lines', title: 'Líneas de Lote' },
    ];



  if(!stockData?.data){
  return <Text style={{color:"#000000"}}>Cargando...</Text>
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomTable<InventoryStockDetail>
        columns={columns}
        data={stockData.data}
        keyExtractor={(row) => `${row.warehouse_id}-${row.product_id}`}
        itemsPerPage={5}
        onRowPress={hadleModal} 
      />

      <ModalInventoryStockDetail
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={modal}
      />
    </View>
  );
};