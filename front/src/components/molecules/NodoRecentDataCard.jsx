import React from "react";
import { obtenerTimeAgoString } from "../utils/date";
import { CardData } from "../atoms";

const NodoRecentDataCard = React.memo(({ dataTemp, dataNivel }) => {
  // Validar correctamente si están vacíos o indefinidos
  if (
    !dataTemp || dataTemp.length === 0 ||
    !dataNivel || dataNivel.length === 0
  ) {
    return <p className="text-center">No hay datos disponibles.</p>;
  }

  // Para evitar error en reduce: si dataNivel está vacío, devolver null
  const lastDataNivel = dataNivel.length > 0 
    ? dataNivel.reduce((a, b) => (a?.date < b?.date ? b : a)) 
    : null;

  // Acceder seguro al último dato de dataTemp
  const lastDataTemp = dataTemp.length > 0 ? dataTemp[dataTemp.length - 1] : null;

  return (
    <div className="ms-2 grid grid-cols-[minmax(140px,auto)_minmax(140px,1fr)] ">
      <div className="flex items-center flex-col normal-text text-3xl font-medium ">
        {/* Temperatura */}
        <span className="flex items-center">
          <i className="fa fa-tint text-sky-500 mx-2" />
          {lastDataNivel ? lastDataNivel.data.toFixed(2) + "m" : "--"}
        </span>
      </div>
      <div className="flex items-center flex-col normal-text text-3xl font-medium">
        {/* Nivel Hidrometrico */}
        <span className="flex items-center">
          <i className="fa fa-thermometer text-rose-500 mx-2" />
          {lastDataTemp ? lastDataTemp.data.toFixed(1) + "ºC" : "--"}
        </span>
      </div>
      {/* Tiempo desde la ultima medición */}
      <h6 className="text-gray-500 text-base text-center mb-3">
        {lastDataNivel && obtenerTimeAgoString(lastDataNivel)}
      </h6>
      <h6 className="text-gray-500 text-base text-center mb-3">
        {lastDataTemp && obtenerTimeAgoString(lastDataTemp)}
      </h6>
    </div>
  );
});
export default NodoRecentDataCard;
