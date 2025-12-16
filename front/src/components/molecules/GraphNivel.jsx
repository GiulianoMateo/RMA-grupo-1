import React from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  dateFormatter,
  getMidnightTicks,
  tickFormatter,
} from "../utils/utils-graphs";
import CustomTooltip from "../utils/CustomTooltip";
import { useTheme } from "../../context/ThemeContext";

/*
  El prop "data" debe tener la forma:
  [
    {
      timestamp: 1694361600000, // en milisegundos
      data: 25.3                 // valor que se quiere graficar
    },
    ...
  ]
*/

export default function GraphNivel({ data, noBrush }) {
  // 🚨 Si no hay datos, mostramos un aviso
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-xs">
        No se recibieron datos de nivel hidrométrico.
      </div>
    );

  const { isDarkMode } = useTheme();

  // Genera marcas en la medianoche para el rango mostrado
  const midnightTicks = getMidnightTicks(
    data[0].timestamp,
    data[data.length - 1].timestamp
  );

  // ⚡ Normaliza: si timestamp no es número, lo convertimos con getTime()
  if (!Number.isInteger(data[0]?.timestamp)) {
    data.forEach((punto) => {
      punto.timestamp = new Date(punto.timestamp).getTime();
    });
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        width={500}
        height={200}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        {/* Grilla de fondo */}
        <CartesianGrid strokeDasharray="3 3" />

        {/* Eje X = tiempo */}
        <XAxis
          dataKey="timestamp"
          tickCount={10}
          type="number"
          domain={["dataMin", "dataMax"]}
          tick={true}
          tickFormatter={tickFormatter}
        />

        {/* Eje Y = valores en cm (puedes ajustar unidad según el tipo de dato) */}
        <YAxis unit={"cm"} />

        {/* Líneas de referencia en medianoche */}
        {midnightTicks.map((tick) => {
          const fecha = new Date(tick);
          const fechaStr = fecha.getDate() + "/" + (fecha.getMonth() + 1);
          return (
            <ReferenceLine key={tick} x={tick} stroke="gray">
              <Label value={fechaStr} position="insideBottomLeft" />
            </ReferenceLine>
          );
        })}

        {/* Tooltip personalizado */}
        <Tooltip content={CustomTooltip} />

        {/* Área principal con la clave "data" */}
        <Area type="linear" dataKey="data" stroke="#8884d8" fill="#8884d8" />

        {/* Selector de rango (Brush) */}
        {!noBrush ? (
          <Brush
            height={25}
            fill={isDarkMode ? "#333" : "#e5e5e5"}
            stroke="#8884d8"
            travellerWidth={10}
            tickFormatter={(val) => dateFormatter(val)}
          />
        ) : null}
      </AreaChart>
    </ResponsiveContainer>
  );
}
