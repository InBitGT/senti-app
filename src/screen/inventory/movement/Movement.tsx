import { TableSkeleton } from "@/components/atom/TableSkeleton/TableSkeleton";
import { ModalMovementDetail } from "@/components/molecules/ModalMovementDetail/ModalMovementDetail";
import { MovementsTable } from "@/components/templates/MovementsTable/MovementsTable";
import { useMovement } from "@/src/hooks/useMovement/useMovement";
import { InventoryMovement } from "@/src/types/movement/movement.types";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function InventoryMovementsScreen() {
    const [selected, setSelected] = useState<InventoryMovement | null>(null)

  const { data: movement, isLoading } = useMovement();

  if (isLoading) return <TableSkeleton />


  return (
    <ScrollView style={{flex:1}}>

    <MovementsTable
      data={movement || []}
      itemsPerPage={8}
      onRowPress={(row) => {
        setSelected(row)
        }}
        />


        <ModalMovementDetail
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        data={selected ?? undefined}
        />
    </ScrollView>
  );
}