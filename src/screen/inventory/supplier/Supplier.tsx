import { Action, Buttons, ColumnDef, CustomTable, ModalDelete } from '@/components';
import { TableSkeleton } from '@/components/atom/TableSkeleton/TableSkeleton';
import { useSupplier } from '@/src/hooks/useSupplier/useSupplier';
import { useSupplierStore } from '@/src/store/useSupplierStore/useSupplierStore';
import { SupplierDetail } from '@/src/types/supplier/supplier.types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

export const Supplier: React.FC = () => {
  const [showModal,setShowModal] = useState<boolean>(false)
  const [modal,setmodal] = useState<SupplierDetail| undefined>(undefined)
  const {setData, setIsEdit}= useSupplierStore.getState()
  const {remove, data: supplier, isLoading} = useSupplier()

  const handleEdit = (data: SupplierDetail) => {
    setIsEdit(true)
    setData(data as unknown as SupplierDetail)
    router.navigate("/(drawer)/(inventory)/(form)/supplier_form")
  }

  const hadleModal = (data:SupplierDetail)=>{
    setShowModal(true)
    setmodal(data)
  }

  const handleDelete = ()=>{
    if(!modal?.id) return
    remove.mutate(modal.id)
    setShowModal(false)
  }

  const columns: ColumnDef<SupplierDetail>[] = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Nombre' },
    { key: 'description', title: 'Descripción' },
    { key: 'nit', title: 'NIT' },
    { key: 'phone', title: 'Telefono' },
  ];

  const actions: Action<SupplierDetail>[] = [
    {
      icon: 'pencil',
      label: 'Editar',
      onPress: (row) => handleEdit(row),
    },
    {
      icon: 'delete',
      label: 'Eliminar',
      onPress: (row) => hadleModal(row)
    },
  ];

  const dataButton :Buttons[]=[
    {
      name: "Crear Proveedor", 
      onPress: ()=> router.navigate("/(drawer)/(inventory)/(form)/supplier_form"),
      variant: "solid" 
    },
  ]

  if(isLoading){
    return <TableSkeleton/>
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomTable<SupplierDetail>
        columns={columns}
        data={supplier || []}
        keyExtractor={(row) => row.id ?? 0}
        actions={actions}
        itemsPerPage={5}
        button={dataButton}
      />
      <ModalDelete isOpen={showModal} onClose={()=>setShowModal(false)} onSuccess={handleDelete}/>
    </View>
  );
};