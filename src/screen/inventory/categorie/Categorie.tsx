import { Action, Buttons, ColumnDef, CustomTable, ModalDelete } from '@/components';
import { useCategorie } from '@/src/hooks';
import { useCategorieStore } from '@/src/store/useCategorieStore';
import { Category, CategoryDetail } from '@/src/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

export const Categorie: React.FC = () => {
  const [showModal,setShowModal] = useState<boolean>(false)
  const [modal,setmodal] = useState<Category| undefined>(undefined)
  const { categorie, remove } = useCategorie()
  const {setData, setIsEdit}= useCategorieStore.getState()

  const handleEdit = (data: Category) => {
    setIsEdit(true)
    setData(data as unknown as CategoryDetail)
    router.navigate("/(drawer)/(inventory)/(form)/categorie_form")
  }

  const hadleModal = (data:Category)=>{
    setShowModal(true)
    setmodal(data)
  }

  const handleDelete = ()=>{
    if(!modal) return
    remove.mutate(modal.id)
    setShowModal(false)
  }

  const columns: ColumnDef<Category>[] = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Nombre' },
    { key: 'description', title: 'Descripción' },
  ];

  const actions: Action<Category>[] = [
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
      name: "Crear Categoria", 
      onPress: ()=> router.navigate("/(drawer)/(inventory)/(form)/categorie_form"),
      variant: "solid" 
    },
  ]

  if(!categorie?.data){
    return
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomTable<Category>
        columns={columns}
        data={categorie.data}
        keyExtractor={(row) => row.id}
        actions={actions}
        itemsPerPage={5}
        button={dataButton}
      />
      <ModalDelete isOpen={showModal} onClose={()=>setShowModal(false)} onSuccess={handleDelete}/>
    </View>
  );
};