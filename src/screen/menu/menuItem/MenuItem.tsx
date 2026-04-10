import { Action, Buttons, ModalDelete } from '@/components';
import { TableSkeleton } from '@/components/atom/TableSkeleton/TableSkeleton';
import { ModalMenuItemDetail } from '@/components/molecules/ModalMenuItemDetail/ModalMenuItemDetail';
import { MenuItemsTable } from '@/components/templates/MenuItemsTable/MenuItemsTable';
import { useMenuItem } from '@/src/hooks/useMenuItem/useMenuItem';
import { useMenuItemStore } from '@/src/store/useMenuItemStore/useMenuItemStore';
import { MenuItem } from '@/src/types/menuItem/menuItem.types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';

export const MenuItemScreen: React.FC = () => {
  const [showModal,setShowModal] = useState<boolean>(false)
  const [modal,setmodal] = useState<MenuItem| undefined>(undefined)
  const [showModalData,setShowModalData] = useState<boolean>(false)
  const [modalData,setmodalData] = useState<MenuItem>()
  const { data:menuItems, isLoading, remove } = useMenuItem()
  const {setData, setIsEdit}= useMenuItemStore.getState()

  const hadleModalData = (data:MenuItem)=>{
      setShowModalData(true)
      setmodalData(data)
    }

  const handleEdit = (data: MenuItem) => {
    setIsEdit(true)
    setData(data)
    router.navigate("/(drawer)/(menu)/(form)/recipe_form")
  }

  const hadleModal = (data:MenuItem)=>{
    setShowModal(true)
    setmodal(data)
  }

  const handleDelete = ()=>{
    if(!modal) return
    remove.mutate(modal.product.id)
    setShowModal(false)
  }


  const actions: Action<MenuItem>[] = [
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
      onPress: ()=> router.navigate("/(drawer)/(menu)/(form)/recipe_form"),
      variant: "solid" 
    },
  ]

  if(isLoading){
    return <TableSkeleton/>
  }

  return (
    <ScrollView style={{ flex: 1 }}>
    <MenuItemsTable
      data={menuItems || []}
      itemsPerPage={8}
      button={dataButton}
      actions={actions}
      onRowPress={hadleModalData}
    />
    <ModalMenuItemDetail isOpen={showModalData} onClose={()=>setShowModalData(false)} data={modalData}/>
    <ModalDelete isOpen={showModal} onClose={()=>setShowModal(false)} onSuccess={handleDelete}/>
    </ScrollView>
  );
};