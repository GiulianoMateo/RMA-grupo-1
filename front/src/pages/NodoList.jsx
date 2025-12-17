import React from "react";
import { Container, Header, LoadingSpinner } from "../components/atoms";
import NodoCard from "../components/organisms/NodoCard";
import ErrorSimple from "../components/molecules/ErrorSimple";
import { useNodos, useBreadcrumbsUpdater } from "../hooks";
import { useAuth } from "../context/AuthProvider";

const NodoList = () => {
  const { permisos } = useAuth();

  const { nodos, loading, error} = useNodos();



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
      
      </Container>
  );
};

export default NodoList;
