import useSWR from "swr";
import { useAxios } from "../context/AxiosProvider";
import { fetcher } from "../utils";

export const useNodos = ({ nodo_id } = {}) => {
  const axios = useAxios();

  const endpoint = nodo_id ? `/nodos/${nodo_id}` : "/nodos";
  const { data, error, isValidating, mutate } = useSWR(
    endpoint,
    (url) => fetcher(url, axios),
    {
      revalidateOnFocus: true,
      errorRetryCount: 3,
      errorRetryInterval: 10000,
      dedupingInterval: 60000,
    }
  );

  const addNodo = async (nodo) => {
    await axios.post("/nodos", nodo);
    mutate();
  };

  const updateNodo = async (nodoId, nodo) => {
    await axios.put(`/nodos/${nodoId}`, nodo);
    mutate();
  };

  const deleteNodo = async (nodoId) => {
    await axios.delete(`/nodos/${nodoId}`);
    mutate();
  };

  // Si nodo_id está especificado, el endpoint devuelve un objeto único.
  // Si no está especificado, devuelve un array.
  const nodos = nodo_id ? (data ? [data] : []) : (data ?? []);

  return {
    nodos,
    loading: isValidating,
    error,
    addNodo,
    updateNodo,
    deleteNodo,
    refresh: mutate,
  };
};

export default useNodos;
