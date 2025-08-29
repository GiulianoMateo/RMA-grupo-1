import { Container, Header, LoadingSpinner } from "../components/atoms";
import NodoCard from "../components/organisms/NodoCard";
import ErrorSimple from "../components/molecules/ErrorSimple";
import { useNodos, useNodosInactivos } from "../hooks";
import { useBreadcrumbsUpdater } from "../hooks";
import ExpandableCard from "../components/molecules/ExpandableCard";
import { NodoInactivoCard } from "../components/organisms";
import { useAuth } from "../context/AuthProvider";

const NodoList = () => {
  // Se obtienen los permisos del usuario autenticado
  const { permisos } = useAuth();

  // Hook personalizado para obtener nodos activos
  const { nodos, loading, error, refresh } = useNodos();

  // Hook para obtener nodos inactivos (solo si el usuario tiene permiso)
  const {
    nodosInactivos,
    loading: loadingInactivos,
    error: errorInactivos,
    mutate,
  } = permisos.read_nodos_inactivos
    ? useNodosInactivos()
    : { nodosInactivos: [], loading: false, error: null }; // fallback si no tiene permisos

  // Logs para depuración (ver permisos, datos y errores en consola)
  console.log("Permisos:", permisos);
  console.log("Nodos activos:", nodos);
  console.log("Nodos inactivos:", nodosInactivos);
  console.log("Error nodos activos:", error);
  console.log("Error nodos inactivos:", errorInactivos);

  // Actualiza las migas de pan (breadcrumbs) de la interfaz
  useBreadcrumbsUpdater();

  // Si hay error al cargar los nodos activos, mostrar mensaje de error
  if (error)
    return (
      <ErrorSimple
        title={"No se pudieron obtener los nodos"}
        description={"Error interno del servidor."}
      />
    );

  return (
    <Container>
      {/* Cabecera de la página */}
      <Header title={"Lista de Nodos"} />

      {/* Renderizado de nodos activos */}
      {loading ? (
        <LoadingSpinner /> // Mostrar spinner mientras carga
      ) : (
        <>
          {nodos.map((nodo) => (
            <div className="mb-3" key={nodo.identificador}>
              <NodoCard nodo={nodo} /> {/* Renderiza cada nodo activo */}
            </div>
          ))}
        </>
      )}

      {/* Renderizado de nodos inactivos (si hay permisos) */}
      {loadingInactivos ? (
        <LoadingSpinner />
      ) : (
        <>
          {permisos.read_nodos_inactivos && (
            <>
              {nodosInactivos.map((nodo) => (
                <div className="mb-3" key={nodo.identificador}>
                  <NodoInactivoCard
                    nodo={nodo}
                    mutate={mutate}   // Permite actualizar el estado de un nodo
                    refresh={refresh} // Refresca lista de nodos activos si hay cambios
                  />
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* Renderizado de card expandible (crear nodo) solo si el usuario tiene permiso */}
      {permisos.create_nodos && (
        <div className="mb-3">
          <ExpandableCard />
        </div>
      )}
    </Container>
  );
};

export default NodoList;