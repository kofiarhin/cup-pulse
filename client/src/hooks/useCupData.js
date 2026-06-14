import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../lib/api";

export function useCupData(key, path) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: ({ signal }) => fetchApi(path, signal),
  });
}
