import { Action, Buttons, ColumnDef, CustomTable, ModalDelete } from '@/components';
import { TableSkeleton } from '@/components/atom/TableSkeleton/TableSkeleton';
import { useProduct } from '@/src/hooks/useProduct/useProduct';
import { useProductStore } from '@/src/store/useProductStore/useProductStore';
import { Ingredien } from '@/src/types/product/product.types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

export const Product: React.FC = () => {
  const [showModal,setShowModal] = useState<boolean>(false)
  const [modal,setmodal] = useState<Ingredien| undefined>(undefined)
  const { data:categorie, isLoading, remove } = useProduct()
  const {setData, setIsEdit}= useProductStore.getState()

  const handleEdit = (data: Ingredien) => {
    setIsEdit(true)
    setData(data)
    router.navigate("/(drawer)/(inventory)/(form)/product_form")
  }

  const hadleModal = (data:Ingredien)=>{
    setShowModal(true)
    setmodal(data)
  }

  const handleDelete = ()=>{
    if(!modal) return
    remove.mutate(modal.id)
    setShowModal(false)
  }

  const columns: ColumnDef<Ingredien>[] = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Nombre' },
    { key: 'description', title: 'Descripción' },
  ];

  const actions: Action<Ingredien>[] = [
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
      name: "Crear Producto", 
      onPress: ()=> router.navigate("/(drawer)/(inventory)/(form)/product_form"),
      variant: "solid" 
    },
  ]

  if(isLoading){
    return <TableSkeleton/>
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomTable<Ingredien>
        columns={columns}
        data={categorie || []}
        keyExtractor={(row) => row.id}
        actions={actions}
        itemsPerPage={5}
        button={dataButton}
      />
      <ModalDelete isOpen={showModal} onClose={()=>setShowModal(false)} onSuccess={handleDelete}/>
    </View>
  );
};