import { Action, ModalDelete } from '@/components';
import { TableSkeleton } from '@/components/atom/TableSkeleton/TableSkeleton';
import { ModalUserDetail } from '@/components/molecules/ModalUser/ModalUser';
import { UsersTable } from '@/components/templates/UsersTable/UsersTable';
import { useUser } from '@/src/hooks/useUser/useUser';
import { useUserStore } from '@/src/store/useUserStore/useUserStore';
import { Users } from '@/src/types/user/user.types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

export const User: React.FC = () => {
  const [showModal,setShowModal] = useState<boolean>(false)
  const [showModalData,setShowModalData] = useState<boolean>(false)
  const [modalData,setmodalData] = useState<Users| undefined>(undefined)
  const [modal,setmodal] = useState<Users| undefined>(undefined)
  const { data:users, isLoading, remove, removeAddress } = useUser()
  const {setData, setIsEdit}= useUserStore.getState()

  const hadleModalData = (data:Users)=>{
    setShowModalData(true)
    setmodalData(data)
  }

  const handleEdit = (data: Users) => {
    setIsEdit(true)
    setData(data)
    router.navigate("/(drawer)/(config)/(form)/users_form")
  }

  const hadleModal = (data:Users)=>{
    setShowModal(true)
    setmodal(data)
  }

  const handleDelete = ()=>{
    if(!modal) return
    remove.mutate(modal.id)
    removeAddress.mutate(modal.address_id)
    setShowModal(false)
  }
  const actions: Action<Users>[] = [
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

  const handleCreate = ()=>{
    router.navigate("/(drawer)/(config)/(form)/users_form")
  }

  if(isLoading){
    return <TableSkeleton/>
  }

  return (
    <View style={{ flex: 1 }}>
        <UsersTable
            data={users || []}
            itemsPerPage={5}
            onNewUser={handleCreate}
            onRowPress={hadleModalData}
            actions={actions}
        />
        <ModalUserDetail
            isOpen={showModalData}
            onClose={() => setShowModalData(false)}
            data={modalData}
        />
      <ModalDelete isOpen={showModal} onClose={()=>setShowModal(false)} onSuccess={handleDelete}/>
    </View>
  );
};