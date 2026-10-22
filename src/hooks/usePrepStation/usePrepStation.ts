import {
  DeletePrepStation,
  PostPrepStation,
  prepStationByIdFn,
  prepStationFn,
  PutPrepStation,
} from "@/src/service/prep_station/prep_station.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PREP_STATION_KEY = ["prepStation"];

export function usePrepStation() {
  const queryClient = useQueryClient();

  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: PREP_STATION_KEY });

  const { data, isLoading } = useQuery({
    queryKey: PREP_STATION_KEY,
    queryFn: prepStationFn,
  });

  const post = useMutation({
    mutationFn: PostPrepStation,
    onSuccess: invalidate,
  });

  const put = useMutation({
    mutationFn: PutPrepStation,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: DeletePrepStation,
    onSuccess: invalidate,
  });

  return { data, isLoading, post, put, remove };
}

/** Detalle de una estación: GET prep-station/full/{id}. */
export function usePrepStationById(idPrepStation: number | null) {
  const { data, isLoading, isError } = useQuery({
    queryKey: [...PREP_STATION_KEY, idPrepStation],
    queryFn: () => prepStationByIdFn(idPrepStation ?? 0),
    enabled: idPrepStation !== null && idPrepStation > 0,
  });

  return { data, isLoading, isError };
}
