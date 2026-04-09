import { Action, Buttons, ModalDelete } from '@/components';
import { TableSkeleton } from '@/components/atom/TableSkeleton/TableSkeleton';
import { ModalProductDetail, ProductDetail } from '@/components/molecules/ModalProductDetail/ModalProductDetail';
import { MenuIngredientsTable } from '@/components/templates/MenuIngredientsTable/MenuIngredientsTable';
import { useProduct } from '@/src/hooks/useProduct/useProduct';
import { useProductStore } from '@/src/store/useProductStore/useProductStore';
import { MenuIngredient } from '@/src/types/product/product.types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';

export const Product: React.FC = () => {
  const [showModal,setShowModal] = useState<boolean>(false)
  const [modal,setmodal] = useState<MenuIngredient| undefined>(undefined)
  const [showModalData,setShowModalData] = useState<boolean>(false)
  const [modalData,setmodalData] = useState<MenuIngredient>()
  const { data:ingredients, isLoading, remove } = useProduct()
  const {setData, setIsEdit}= useProductStore.getState()

  const hadleModalData = (data:MenuIngredient)=>{
      setShowModalData(true)
      setmodalData(data)
    }

  const handleEdit = (data: MenuIngredient) => {
    setIsEdit(true)
    setData(data)
    router.navigate("/(drawer)/(inventory)/(form)/product_form")
  }

  const hadleModal = (data:MenuIngredient)=>{
    setShowModal(true)
    setmodal(data)
  }

  const handleDelete = ()=>{
    if(!modal) return
    remove.mutate(modal.id)
    setShowModal(false)
  }


  const actions: Action<MenuIngredient>[] = [
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
    <ScrollView style={{ flex: 1 }}>
    <MenuIngredientsTable
      data={ingredients || []}
      itemsPerPage={8}
      button={dataButton}
      actions={actions}
      onRowPress={hadleModalData}
    />
    <ModalProductDetail isOpen={showModalData} onClose={()=>setShowModalData(false)} data={modalData as ProductDetail}/>
      <ModalDelete isOpen={showModal} onClose={()=>setShowModal(false)} onSuccess={handleDelete}/>
    </ScrollView>
  );
};