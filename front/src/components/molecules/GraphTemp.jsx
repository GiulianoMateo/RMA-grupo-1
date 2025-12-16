import React from "react";

import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getMidnightTicks, tickFormatter } from "../utils/utils-graphs";
import CustomTooltip from "../utils/CustomTooltip";

/*
    El prop "data" debe tener la forma:
    {
        date (en ticks, obteniendose mediante el metodo getTime() de los objetos Date),
        nivel_hidrométrico (m),
        temperatura (ºC)
    }
*/

export default function GraphTemp({ data }) {
  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-xs">
        No se recibieron datos de temperatura.
      </div>
    );

  // si las fechas no son un nro de ticks, se parsea
  if (!Number.isInteger(data[0] && data[0].timestamp)) {
    data.forEach((punto, i) => {
      punto.timestamp = new Date(punto.timestamp).getTime();
    });
  }

  let midnightTicks;

  if (data?.length)
    midnightTicks = getMidnightTicks(data[0].timestamp, data[data.length - 1].timestamp);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          type="number"
          tickCount={10}
          domain={["dataMin", "dataMax"]}
          tick={true}
          tickFormatter={tickFormatter}
        />
        <YAxis
          unit={"ºC"}
          data={data}
          ticks={[-10, 0, 10, 20, 30, 40]}
          domain={["dataMin", "dataMax"]}
        />
        <Line
          type="monotone"
          dataKey="data"
          stroke="#ff5733"
          strokeWidth={3}
          dot={false}
        />
        {midnightTicks.map((tick) => {
          const fecha = new Date(tick);
          const fechaStr = fecha.getDate() + "/" + fecha.getMonth();
          return (
            <ReferenceLine key={tick} x={tick} stroke="gray">
              <Label value={fechaStr} position="insideBottomLeft" />
            </ReferenceLine>
          );
        })}
        <ReferenceLine
          key={0}
          y={0}
          stroke="gray"
          strokeDasharray={8}
        ></ReferenceLine>
        <Tooltip content={CustomTooltip} />
      </LineChart>
    </ResponsiveContainer>
  );
}
