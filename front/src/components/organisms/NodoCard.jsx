// NodoCard.jsx
import React, { useMemo } from "react";
import { MdOutlineSettingsInputAntenna } from "react-icons/md";
import { BsFillLightningChargeFill } from "react-icons/bs";

import "../../assets/font-awesome/css/font-awesome.min.css";
import { LinkComponent } from "../atoms";
import { useFetchNodoData } from "../../hooks";
import { useTipoDato } from "../../hooks";

const TENSION_DATA_TYPE = 16; // data_type que representa Tensión

const NodoCard = ({ nodo }) => {
  const now = useMemo(() => new Date(), []);
  const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const nowISOString = now.toISOString();

  // =========================
  // Fetch de datos del nodo
  // =========================
  const { data: paqueteResponse, error, isForbidden } = useFetchNodoData({
    nodo_id: nodo.id,
    filterStartDate: past24Hours,
    filterEndDate: nowISOString,
    orderBy: "date",
  });

  const { items = [] } = paqueteResponse || { items: [] };

  // Debug: Mostrar items del fetch
  if (items.some((i) => i.type_id === 26)) {
    console.log("=== VIENTO ENCONTRADO ===");
    console.log("Items con type_id 26:", items.filter((i) => i.type_id === 26));
  } else {
    console.log("=== NO HAY VIENTO EN ITEMS ===");
    console.log("Items type_ids disponibles:", [...new Set(items.map((i) => i.type_id))]);
  }

  // =========================
  // Fetch de tipos desde API
  // =========================
  const { tipos, loading: tiposLoading, error: tiposError } = useTipoDato();

  // ======================================
  // Agrupar paquetes por tipo de dato (DATA_TYPE, no type_id)
  // ======================================
  const groupedByType = useMemo(() => {
    const result = {};
    items.forEach((item) => {
      // Obtener el data_type del tipo
      const tipo = tipos.find((t) => t.id === item.type_id);
      const dataType = tipo?.data_type || item.type_id;
      
      if (!result[dataType]) result[dataType] = [];
      result[dataType].push(item);
    });
    return result;
  }, [items, tipos]);

  // ======================================
  // Configuración visual por tipo
  // ======================================
  const getTypeConfig = (tipoId) => {
    const tipo = tipos.find((t) => t.id === tipoId);

    if (!tipo) {
      return {
        icon: <i className="fa fa-database mx-2 text-xl" />,
        data_type: tipoId,
        data_symbol: "",
      };
    }

    const icon =
      tipo.nombre === "Temperatura" ? (
        <i className="fa fa-thermometer text-rose-500 mx-2 text-xl" />
      ) : tipo.nombre === "Nivel Hidrométrico" ? (
        <i className="fa fa-tint text-sky-500 mx-2 text-xl" />
      ) : tipo.nombre === "Tensión" ? (
        <BsFillLightningChargeFill className="mx-2 text-xl" />
      ) : tipo.nombre === "Precipitación" ? (
        <i className="fa fa-umbrella text-blue-400 mx-2 text-xl" />
      ) : tipo.nombre === "Viento" ? (    
        <i className="fa fa-flag text-gray-400 mx-2 text-xl" />
      ) : (
        <i className="fa fa-database mx-2 text-xl" />
      );

    return {
      icon,
      data_type: tipo.data_type || tipo.id,
      data_symbol: tipo.data_symbol || "",
    };
  };

  // =========================================================
  // FUNCIÓN CLAVE:
  // - Máximo 3 tipos
  // - Prioridad por ID más chico
  // - Tensión siempre en la posición correcta
  // =========================================================
  const getTiposParaMostrar = (tiposNodo) => {
    if (!tiposNodo || tiposNodo.length === 0) return [];

    // 1️⃣ Ordenamos por ID ascendente (prioridad)
    const ordered = [...tiposNodo].sort((a, b) => a - b);

    // 2️⃣ Detectamos si existe Tensión
    const tensionIndex = ordered.findIndex(
      (tipoId) => getTypeConfig(tipoId).data_type === TENSION_DATA_TYPE
    );

    let tensionTipo = null;
    if (tensionIndex !== -1) {
      tensionTipo = ordered.splice(tensionIndex, 1)[0];
    }

    // 3️⃣ Tomamos como base los primeros tipos (sin Tensión)
    let selected = ordered.slice(0, 3);

    // 5️⃣ Si hay Tensión, la ponemos SIEMPRE al inicio
    if (tensionTipo !== null) {
      selected.unshift(tensionTipo);
    }

    // 5️⃣ Aseguramos máximo 3 elementos
    return selected.slice(0, 3);
  };

  if (error) return <p>Error al obtener los datos: {error.message}</p>;
  if (isForbidden) return <p>Acceso prohibido.</p>;
  if (tiposError) return <p>Error al cargar tipos: {tiposError.message}</p>;

return (
  <div className="
    roboto border rounded-2xl p-3 shadow-sm
    dark:border-neutral-800 dark:text-neutral-50
    flex flex-row justify-between gap-3
  ">
    {/* Información principal del nodo */}
    <div className="flex-1 min-w-0">
      <h4 className="flex items-center text-lg sm:text-xl font-semibold truncate">
        <MdOutlineSettingsInputAntenna className="mr-2 shrink-0" />
        {nodo.identificador}
      </h4>

      <p className="text-sm text-neutral-500 mb-1 truncate">
        {nodo.descripcion}
      </p>

      <span className="text-xs text-neutral-600">
        <i className="fa fa-map-marker me-2" />
        <b>Lat:</b> {nodo.latitud?.toFixed(5) ?? "N/A"},{" "}
        <b>Lon:</b> {nodo.longitud?.toFixed(5) ?? "N/A"}
      </span>
    </div>

    {/* Valores recientes */}
    <div className="flex flex-col justify-between w-[290px] min-w-[290px]">
      <div className="flex items-center gap-2 mb-1">
        {getTiposParaMostrar(nodo.tipos).map((tipoId) => {
          const cfg = getTypeConfig(tipoId);
          const dataArr = groupedByType[cfg.data_type] || [];

          const lastVal =
            dataArr.length > 0
              ? dataArr[dataArr.length - 1].data.toFixed(1)
              : "--";

          return (
            <div key={tipoId} className="flex items-center gap-0">
              {cfg.icon}
              <span className="text-lg font-medium inline-block text-center w-[4ch]">
                {tiposLoading ? "--" : lastVal}
              </span>
              <span className="text-sm text-gray-500">
                {cfg.data_symbol}
              </span>
            </div>
          );
        })}
      </div>

      {/* Botón */}
      <LinkComponent
        to={`/sensor/${nodo.id}`}
        className="
          w-full h-10
          flex items-center justify-center
          bg-gray-300 hover:bg-gray-400
          dark:hover:bg-slate-900
          text-gray-800 font-bold
          rounded-2xl
          transition-all duration-100
          dark:bg-slate-800 dark:text-slate-200
        "
      >
        VER DATOS
      </LinkComponent>
    </div>
  </div>
);
};

export default NodoCard;
