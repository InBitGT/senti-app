import {
  cancelTransferFn,
  createTransferFn,
  dispatchTransferFn,
  incomingTransferFn,
  receiveTransferFn,
  stockTransferByIDFn,
  stockTransferFn,
  transferReceptionFn,
} from "@/src/service/stock_transfer/stock_transfer.services";
import { useStockTransferStore } from "@/src/store/useStockTransferStore/useStockTransferStore";
import {
  StockTransferFilters,
  TransferStatus,
} from "@/src/types/stock_transfer/stock_transfer.types";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const RECEIVED_STATUSES: TransferStatus[] = [
  "received",
  "received_with_differences",
  "rejected",
];

export const isTransferReceived = (status?: TransferStatus) =>
  !!status && RECEIVED_STATUSES.includes(status);

export const useStockTransfer = (filters: StockTransferFilters) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["stock_transfer", "list", filters],
    queryFn: () => stockTransferFn(filters),
    placeholderData: keepPreviousData,
  });

  return { data, isLoading, isFetching };
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransferFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_transfer"] });
    },
  });
};

export const useIncomingTransfer = (branchId?: number | string) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["stock_transfer", "incoming", branchId],
    queryFn: () => incomingTransferFn(branchId ?? ""),
    enabled: !!branchId,
  });

  return { data, isLoading, isFetching };
};

export const useStockTransferDetail = () => {
  const queryClient = useQueryClient();
  const selectedId = useStockTransferStore((s) => s.selectedId);

  const { data, isLoading } = useQuery({
    queryKey: ["stock_transfer", "detail", selectedId],
    queryFn: () => stockTransferByIDFn(selectedId ?? ""),
    enabled: selectedId !== undefined && selectedId !== 0,
  });

  const { data: reception, isLoading: isLoadingReception } = useQuery({
    queryKey: ["stock_transfer", "reception", selectedId],
    queryFn: () => transferReceptionFn(selectedId ?? ""),
    enabled: !!selectedId && isTransferReceived(data?.status),
  });

  // Despachar, recibir y cancelar cambian stock y estados; se refresca todo
  // lo de traslados y el inventario.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["stock_transfer"] });
    queryClient.invalidateQueries({ queryKey: ["merchandise"] });
    queryClient.invalidateQueries({ queryKey: ["pos-catalog"] });
  };

  const dispatch = useMutation({
    mutationFn: dispatchTransferFn,
    onSuccess: invalidate,
  });

  const receive = useMutation({
    mutationFn: receiveTransferFn,
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: cancelTransferFn,
    onSuccess: invalidate,
  });

  return {
    data,
    isLoading,
    reception,
    isLoadingReception,
    dispatch,
    receive,
    cancel,
  };
};
