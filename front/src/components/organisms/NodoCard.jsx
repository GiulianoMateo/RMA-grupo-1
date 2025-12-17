// NodoCard.jsx
import React, { useMemo } from "react";
import { MdOutlineSettingsInputAntenna } from "react-icons/md";
import "../../assets/font-awesome/css/font-awesome.min.css";
import { LinkComponent } from "../atoms";
import { useFetchNodoData, useTipoDato } from "../../hooks";
import { getTypeConfig } from "../../utils/tiposIconosConfig.jsx";

const TENSION_DATA_TYPE = 16; 

const NodoCard = ({ nodo }) => {
  const now = useMemo(() => new Date(), []);
  const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // SOLUCIÓN 1: Pedimos 100 items en lugar de los 10 por defecto para que los 
  // paquetes de Viento no "empujen" fuera a la Tensión y Humedad.
  const { data: paqueteResponse, error } = useFetchNodoData({
    nodo_id: nodo.id,
    filterStartDate: past24Hours,
    filterEndDate: now.toISOString(),
    orderBy: "date",
    pageSize: 100, // <--- Aumentamos el alcance
  });

  const { items = [] } = paqueteResponse || { items: [] };
  const { tipos, loading: tiposLoading } = useTipoDato();

  // SOLUCIÓN 2: Agrupamos usando el type_id del paquete (que es el data_type lógico)
  const latestDataByDataType = useMemo(() => {
    const map = {};
    // Al estar ordenados por fecha, el último que procese el loop será el más reciente
    items.forEach((item) => {
      map[String(item.type_id)] = item.data;
    });
    return map;
  }, [items]);

  // SOLUCIÓN 3: Mapear los tipos asociados al nodo con sus configuraciones e iconos
  const tiposConfigurados = useMemo(() => {
    if (!tipos.length || !nodo.tipos) return [];

    return nodo.tipos.map(tId => {
      // tId es el ID de la tabla 'tipos' (ej: 3 para Tensión)
      const maestro = tipos.find(m => m.id === tId);
      if (!maestro) return null;

      const configVisual = getTypeConfig(maestro);
      return {
        id: maestro.id,
        dataType: maestro.data_type, // ej: 16
        symbol: maestro.data_symbol,
        icon: configVisual.icon,
        nombre: maestro.nombre,
        // Buscamos el valor usando el dataType lógico
        valor: latestDataByDataType[String(maestro.data_type)]
      };
    }).filter(Boolean);
  }, [tipos, nodo.tipos, latestDataByDataType]);

  // SOLUCIÓN 4: Lógica de orden (Tensión primero, máximo 3)
  const tiposAMostrar = useMemo(() => {
    const tension = tiposConfigurados.find(t => t.dataType === TENSION_DATA_TYPE);
    const otros = tiposConfigurados.filter(t => t.dataType !== TENSION_DATA_TYPE);
    
    const final = [];
    if (tension) final.push(tension);
    return [...final, ...otros].slice(0, 3);
  }, [tiposConfigurados]);

  if (error) return null;

  return (
    <div className="roboto border rounded-2xl p-3 shadow-sm flex justify-between gap-3 bg-white">
      <div className="flex-1 min-w-0">
        <h4 className="flex items-center text-lg font-semibold truncate">
          <MdOutlineSettingsInputAntenna className="mr-2 text-blue-500" />
          {nodo.identificador}
        </h4>
        <p className="text-sm text-neutral-500 truncate">{nodo.descripcion}</p>
      </div>

      <div className="flex flex-col justify-between w-[300px]">
        <div className="flex items-center justify-end gap-3">
          {tiposAMostrar.map((t) => (
            <div key={t.id} className="flex items-center gap-1" title={t.nombre}>
              {t.icon}
              <span className="text-lg font-bold min-w-[2.5ch] text-right">
                {tiposLoading ? "..." : (t.valor !== undefined ? t.valor.toFixed(1) : "--")}
              </span>
              <span className="text-xs text-gray-400">{t.symbol}</span>
            </div>
          ))}
        </div>

        <LinkComponent
          to={`/sensor/${nodo.id}`}
          className="w-full h-9 mt-2 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
        >
          VER DETALLES
        </LinkComponent>
      </div>
    </div>
  );
};

export default NodoCard;