import { Buttons } from '@/components'
import { EntryDetail, ModalEntryDetail } from '@/components/molecules/EntryDetail/EntryDetail'
import { StockEntryTable } from '@/components/templates/StockEntryTable/StockEntryTable'
import { useEntryStock } from '@/src/hooks/useEntryStock/useEntryStock'
import { StockEntry } from '@/src/types/entry_stock/entry_stock.types'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView } from 'react-native'

export const Entry_stock = () => {
const { data: entries, isLoading } = useEntryStock()
  const [showModalData,setShowModalData] = useState<boolean>(false)
  const [modalData,setmodalData] = useState<EntryDetail>()


  const hadleModalData = (data:StockEntry)=>{
      setShowModalData(true)
      setmodalData(data as EntryDetail)
    }


  const dataButton :Buttons[]=[
    {
      name: "Agregar ingreso de inventario", 
      onPress: ()=> router.navigate("/(drawer)/(inventory)/(form)/entry_stock_form"),
      variant: "solid" 
    },
    {
      name: "Agregar ajuste de inventario", 
      onPress: ()=> router.navigate("/(drawer)/(inventory)/(form)/inventory_adjustment_form"),
      variant: "outline" 
    },
  ]

  if (isLoading) return null

  return (
    <ScrollView style={{flex:1}}>
      <StockEntryTable
        data={entries ||[]}
        itemsPerPage={8}
        onRowPress={hadleModalData}
        button={dataButton}
      />

      <ModalEntryDetail isOpen={showModalData} onClose={()=>setShowModalData(false)} data={modalData} />
    </ScrollView>
  )
}

