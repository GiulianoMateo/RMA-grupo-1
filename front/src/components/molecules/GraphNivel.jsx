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

// Mapa de colores Tailwind a Hex
const tailwindColorMap = {
  "text-red-500": "#ef4444",
  "text-blue-500": "#3b82f6",
  "text-green-500": "#22c55e",
  "text-yellow-500": "#eab308",
  "text-purple-500": "#a855f7",
  "text-pink-500": "#ec4899",
  "text-orange-500": "#f97316",
  "text-cyan-500": "#06b6d4",
  "text-indigo-500": "#6366f1",
  "text-gray-500": "#6b7280",
};

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

export default function GraphNivel({ data, noBrush, color }) {
  // 🚨 Si no hay datos, mostramos un aviso
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-xs">
        No se recibieron datos de nivel hidrométrico.
      </div>
    );

  const { isDarkMode } = useTheme();

  // Convierte el color de Tailwind a hex, o usa el default
  const chartColor = tailwindColorMap[color] || "#8884d8";

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
        <Area type="linear" dataKey="data" stroke={chartColor} fill={chartColor} />

        {/* Selector de rango (Brush) */}
        {!noBrush ? (
          <Brush
            height={25}
            fill={isDarkMode ? "#333" : "#e5e5e5"}
            stroke={chartColor}
            travellerWidth={10}
            tickFormatter={(val) => dateFormatter(val)}
          />
        ) : null}
      </AreaChart>
    </ResponsiveContainer>
  );
}
