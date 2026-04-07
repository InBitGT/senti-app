import { Action, Buttons, ColumnDef, CustomTable } from '@/components';
import { useCategorie } from '@/src/hooks';
import { Category } from '@/src/types';
import React, { useEffect } from 'react';



export const Categorie: React.FC = () => {
  const { categorie } = useCategorie()

  useEffect(() => {
    categorie.mutate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnDef<Category>[] = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Nombre' },
    { key: 'description', title: 'Descripción' },
    { key: 'sort_order', title: 'Orden', numeric: true },
  ];

  const actions: Action<Category>[] = [
    {
      icon: 'pencil',
      label: 'Editar',
      onPress: (row) => console.log('Editar:', row.id),
    },
    {
      icon: 'delete',
      label: 'Eliminar',
      onPress: (row) => console.log("press")
    },
  ];

  const dataButton :Buttons[]=[
    {
      name: "Crear Categoria", 
      onPress: ()=> console.log("press"),
      variant: "solid" 
    },
    {
      name: "Crear Categoria", 
      onPress: ()=> console.log("press2"),
      variant: "solid" 
    },
  ]

  if(!categorie?.data){
    return
  }

  return (
    <CustomTable<Category>
      columns={columns}
      data={categorie.data}
      keyExtractor={(row) => row.id}
      actions={actions}
      itemsPerPage={5}
      button={dataButton}
    />
  );
};