import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Container, LoadingSpinner, MiniMap } from "../components/atoms";
import {
  MaxLevelCard,
  NodoHeader,
  NodoRecentDataCard,
} from "../components/molecules";
import { NodoDataVisualizer } from "../components/organisms";
import { useFetchNodoData, useNodos } from "../hooks";
import PDFNodo from "../components/molecules/PDFNodo";
import BateriaDataVisualizer from "../components/organisms/BateriaDataVisualizer";

const TIMEFRAME_24H = 1000 * 60 * 60 * 24;
const TIMEFRAME_7D = 1000 * 60 * 60 * 24 * 7;

const NodoPage = () => {
  const { id } = useParams();

  /* =========================
     ESTADOS
  ========================= */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Datos legacy (solo para cards superiores)
  const [dataTemp, setDataTemp] = useState([]);
  const [dataNivel, setDataNivel] = useState([]);

  // Tipos disponibles del sistema
  const [tiposDisponibles, setTiposDisponibles] = useState([]);

  /* =========================
     FETCH DATOS DEL NODO
  ========================= */
  const { data, loading, error } = useFetchNodoData({
    offset: 1,
    nodo_id: id,
    filterStartDate: startDate || "",
    filterEndDate: endDate || "",
    order: "asc",
    orderBy: "date",
  });

  const {
    nodos: sensorDataArray,
    loading: loadingNodo,
  } = useNodos({ nodo_id: id });

  // Cuando pasamos nodo_id, el hook retorna [nodo] con un elemento
  const sensorData = sensorDataArray[0] || {};

  /* =========================
     FETCH TIPOS
  ========================= */
  useEffect(() => {
    fetch("http://localhost:8000/tipos")
      .then((res) => res.json())
      .then(setTiposDisponibles)
      .catch((err) => console.error("Error cargando tipos:", err));
  }, []);

  /* =========================
     DATOS AGRUPADOS POR TYPE_ID
     (CLAVE PARA LOS GRÁFICOS)
  ========================= */
  const dataByType = useMemo(() => {
    if (!Array.isArray(data?.items)) return {};

    return data.items.reduce((acc, item) => {
      if (!acc[item.type_id]) acc[item.type_id] = [];
      acc[item.type_id].push(item);
      return acc;
    }, {});
  }, [data?.items]);

  /* =========================
     TIPOS QUE REALMENTE TIENE EL NODO
  ========================= */
const tiposDelNodo = useMemo(() => {
  if (!sensorData?.tipos || !tiposDisponibles.length) return [];

  // Maneja tanto si sensorData.tipos es un array de IDs como de objetos
  const tiposDelNodoIds = Array.isArray(sensorData.tipos) 
    ? sensorData.tipos.map(tipo => typeof tipo === 'object' ? tipo.id : tipo)
    : [];

  return tiposDisponibles.filter((tipo) =>
    tiposDelNodoIds.includes(tipo.id) && tipo.id !== 3 // Excluir Tensión (id: 3)
  );
}, [sensorData?.tipos, tiposDisponibles]);


  /* =========================
     ÚLTIMOS DATOS POR TIPO (DINÁMICO)
  ========================= */
  const recentDataByType = useMemo(() => {
    if (!Array.isArray(data?.items) || !tiposDelNodo.length) return {};

    const result = {};
    tiposDelNodo.forEach((tipo) => {
      const typeData = data.items.filter((item) => item.type_id === tipo.data_type);
      console.log(`Tipo: ${tipo.nombre} (id: ${tipo.id}, data_type: ${tipo.data_type}), datos encontrados: ${typeData.length}`);
      
      if (typeData.length > 0) {
        // Obtener el último dato (asumiendo que están ordenados)
        const lastData = typeData[typeData.length - 1];
        
        // Procesar nivel hidrométrico (convertir cm a m)
        if (tipo.data_type === 25) {
          result[tipo.data_type] = {
            ...lastData,
            data: parseFloat((lastData.data / 100).toFixed(2)),
          };
        } else {
          result[tipo.data_type] = lastData;
        }
      }
    });
    console.log("recentDataByType:", result);
    return result;
  }, [data?.items, tiposDelNodo]);

  /* =========================
     DATOS PARA CARDS SUPERIORES (legacy)
     (solo temperatura y nivel)
  ========================= */
  useEffect(() => {
    if (!Array.isArray(data?.items)) return;

    setDataTemp(data.items.filter((i) => i.type_id === 1));   // temperatura
    setDataNivel(data.items.filter((i) => i.type_id === 25)); // nivel
  }, [data]);

  /* =========================
     CONVERSIÓN NIVEL cm → m (legacy)
  ========================= */
  const processedDataNivel = useMemo(
    () =>
      dataNivel.map((p) => ({
        ...p,
        data: parseFloat((p.data / 100).toFixed(2)),
      })),
    [dataNivel]
  );

  /* =========================
     EXPORTACIÓN PDF
  ========================= */
  const chartRef = useRef(null);
  const bateriaChartRef = useRef(null);

  const handleFilterChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleExportClick = () => setIsExporting(true);
  const handleExportComplete = () => setIsExporting(false);

  /* =========================
     GUARDAS
  ========================= */
  if (loading || loadingNodo) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;
  if (!tiposDelNodo.length) return <LoadingSpinner />;


  /* =========================
     RENDER
  ========================= */
  return (
    <Container>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
          <div className="col-span-2">
            <NodoHeader sensor={sensorData} />
          </div>

          <div className="row-span-2 rounded-lg overflow-hidden">
            {sensorData.latitud && sensorData.longitud ? (
              <MiniMap lat={sensorData.latitud} lng={sensorData.longitud} />
            ) : (
              <LoadingSpinner />
            )}
          </div>

          <div className="col-span-2 flex gap-4">
            <div className="w-1/2">
              <NodoRecentDataCard
                recentDataByType={recentDataByType}
                tipos={tiposDelNodo}
              />
            </div>
            {/*
            <div className="w-1/2 flex gap-4">
              <MaxLevelCard data={processedDataNivel} timeFrame={TIMEFRAME_7D} />
              <MaxLevelCard data={processedDataNivel} timeFrame={TIMEFRAME_24H} />
            </div>
            */}
          </div>
        </div>
      </Card>

      {/* ===== GRÁFICOS DINÁMICOS ===== */}
      <div ref={chartRef}>
        <NodoDataVisualizer
          dataByType={dataByType}
          tipos={tiposDelNodo}
          loading={loading}
          onFilterChange={handleFilterChange}
          isExporting={isExporting}
        />
      </div>

      {/* ===== BATERÍA (solo PDF) ===== */}
      <div
        ref={bateriaChartRef}
        style={{ display: isExporting ? "block" : "none" }}
      >
        <BateriaDataVisualizer
          data={data?.items}
          loading={loading}
          isExporting={isExporting}
        />
      </div>

      <PDFNodo
        data={sensorData}
        chartRef={chartRef}
        bateriaChartRef={bateriaChartRef}
        startDate={startDate}
        endDate={endDate}
        onExport={handleExportClick}
        onExportComplete={handleExportComplete}
        isExporting={isExporting}
      />
    </Container>
  );
};

export default NodoPage;
