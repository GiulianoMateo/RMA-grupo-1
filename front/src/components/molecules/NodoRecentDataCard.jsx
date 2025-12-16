import React from "react";
import { obtenerTimeAgoString } from "../utils/date";
import { CardData } from "../atoms";
import { getTypeConfig } from "../../utils/tiposIconosConfig.jsx";

const NodoRecentDataCard = React.memo(({ recentDataByType, tipos }) => {
  if (!recentDataByType || Object.keys(recentDataByType).length === 0) {
    return <p className="text-center">No hay datos disponibles.</p>;
  }

  // Determinar dinámicamente el número de columnas basado en la cantidad de tipos
  const gridColsClass = "grid-cols-2";

  return (
    <div className={`ms-2 grid ${gridColsClass} gap-4`}>
      {tipos.map((tipo) => {
        const lastData = recentDataByType[tipo.data_type];
        const typeConfig = getTypeConfig(tipo);

        return (
          <div key={tipo.id} className="flex flex-col items-center">
            <div className="flex items-center justify-center normal-text text-2xl font-medium mb-2">
              <span className="flex items-center">
                {typeConfig.icon}
                {lastData ? (
                  tipo.data_type === 25 
                    ? lastData.data.toFixed(2) + tipo.data_symbol
                    : lastData.data.toFixed(1) + tipo.data_symbol
                ) : (
                  "--"
                )}
              </span>
            </div>
            <h6 className="text-gray-500 text-sm text-center mb-1">
              {typeConfig.nombre}
            </h6>
            <h6 className="text-gray-400 text-xs text-center">
              {lastData ? obtenerTimeAgoString(lastData) : "--"}
            </h6>
          </div>
        );
      })}
    </div>
  );
});

export default NodoRecentDataCard;