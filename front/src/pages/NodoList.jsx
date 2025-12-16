import React from "react";
import { Container, Header, LoadingSpinner } from "../components/atoms";
import NodoCard from "../components/organisms/NodoCard";
import ErrorSimple from "../components/molecules/ErrorSimple";
import { useNodos, useNodosInactivos } from "../hooks";
import { useBreadcrumbsUpdater } from "../hooks";
import ExpandableCard from "../components/molecules/ExpandableCard";
import { NodoInactivoCard } from "../components/organisms";
import { useAuth } from "../context/AuthProvider";

const NodoList = () => {
  const { permisos } = useAuth();

  const { nodos, loading, error, refresh } = useNodos();

  const {
    nodosInactivos,
    loading: loadingInactivos,
    error: errorInactivos,
    mutate,
  } = permisos.read_nodos_inactivos
    ? useNodosInactivos()
    : { nodosInactivos: [], loading: false, error: null };

  console.log("Permisos:", permisos);
  console.log("Nodos activos:", nodos);
  console.log("Nodos inactivos:", nodosInactivos);
  console.log("Error nodos activos:", error);
  console.log("Error nodos inactivos:", errorInactivos);

  useBreadcrumbsUpdater();

  if (error)
    return (
      <ErrorSimple
        title={"No se pudieron obtener los nodos"}
        description={"Error interno del servidor."}
      />
    );

  return (
    <Container>
      <Header title={"Lista de Nodos"} />

      {/* Nodos activos */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {nodos.map((nodo) => (
            <NodoCard key={nodo.identificador} nodo={nodo} />
          ))}
        </div>
      )}

      {/*
      { Nodos inactivos }
      {loadingInactivos ? (
        <LoadingSpinner />
      ) : (
        permisos.read_nodos_inactivos && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {nodosInactivos.map((nodo) => (
              <NodoInactivoCard
                key={nodo.identificador}
                nodo={nodo}
                mutate={mutate}
                refresh={refresh}
              />
            ))}
          </div>
        )
      )}

      
        /* Expandable card (crear nodo) 
        {permisos.create_nodos && (
          <div className="mb-6">
            <ExpandableCard />
          </div>
        )}
      */}
      </Container>
  );
};

export default NodoList;
