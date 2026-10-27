import { DesktopScrollView } from "@/components/atom/DesktopScrollView/DesktopScrollView";
import { StockTransferTable } from "@/components/templates/StockTransferTable/StockTransferTable";
import {
  useIncomingTransfer,
  useStockTransfer,
} from "@/src/hooks/useStockTransfer/useStockTransfer";
import { useAuthStore } from "@/src/store";
import { useStockTransferStore } from "@/src/store/useStockTransferStore/useStockTransferStore";
import {
  StockTransfer as StockTransferRow,
  TransferStatus,
} from "@/src/types/stock_transfer/stock_transfer.types";
import { useDimensions } from "@/src/utils/dimentions/dimentions";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";

const PAGE_SIZE = 10;

type View = "incoming" | "history";

export const StockTransfer = () => {
  const { claims } = useAuthStore();
  const isDesktopWeb = useDimensions();
  const setSelectedId = useStockTransferStore((s) => s.setSelectedId);

  const branches = claims?.branches ?? [];

  const [view, setView] = useState<View>("incoming");
  const [branchId, setBranchId] = useState<string>(
    String(branches[0]?.branch_id ?? ""),
  );
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<TransferStatus | null>(null);
  const [search, setSearch] = useState<string>("");

  // Los filtros reinician la página en el mismo evento.
  const handleBranchChange = (value: string) => {
    setBranchId(value);
    setPage(1);
  };
  const handleStatusChange = (value: TransferStatus | null) => {
    setStatus(value);
    setPage(1);
  };
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const history = useStockTransfer({
    branch_id: branchId,
    status: status ? [status] : undefined,
    number: search,
    sort: "-created_at",
    page,
    page_size: PAGE_SIZE,
  });
  const incoming = useIncomingTransfer(branchId);

  // "Por recibir" no pagina en el servidor; la búsqueda se hace aquí.
  const incomingRows = useMemo(() => {
    const rows = incoming.data?.data ?? [];
    const term = search.trim().toLowerCase();
    return term
      ? rows.filter((r) => r.number.toLowerCase().includes(term))
      : rows;
  }, [incoming.data, search]);

  const handleRowPress = (row: StockTransferRow) => {
    setSelectedId(row.id);
    router.navigate("/(drawer)/(inventory)/(info)/stock_transfer_info");
  };

  const commonProps = {
    onRowPress: handleRowPress,
    search,
    onSearchChange: handleSearchChange,
    branchOptions: branches.map((b) => ({
      label: b.branch_name,
      value: String(b.branch_id),
    })),
    branchId,
    onBranchChange: handleBranchChange,
    viewOptions: [
      {
        label: `Por recibir (${incoming.data?.total ?? 0})`,
        value: "incoming",
      },
      { label: "Historial", value: "history" },
    ],
    view,
    onViewChange: (value: string) => setView(value as View),
  };

  if (view === "incoming" ? incoming.isLoading : history.isLoading) {
    return <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={{ flex: 1, margin: isDesktopWeb ? 20 : 5 }}>
      <DesktopScrollView>
        {view === "incoming" ? (
          <StockTransferTable
            {...commonProps}
            data={incomingRows}
            emptyLabel="No hay traslados por recibir"
          />
        ) : (
          <StockTransferTable
            {...commonProps}
            data={history.data?.data ?? []}
            summary={history.data?.summary}
            page={history.data?.page ?? page}
            totalPages={history.data?.total_pages}
            total={history.data?.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            activeStatus={status}
            onStatusChange={handleStatusChange}
          />
        )}
      </DesktopScrollView>
    </ScrollView>
  );
};
