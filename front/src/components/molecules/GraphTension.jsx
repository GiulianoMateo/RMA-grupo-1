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
import { dateFormatter, getMidnightTicks } from "../utils/utils-graphs";
import CustomTooltip from "../utils/CustomTooltip";

const GraphTension = ({ data }) => {
  return (
    <div className="battery-monitor m-2">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <defs>
            <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={dateFormatter}
            ticks={getMidnightTicks(data)}
          >
            <Label value="Fecha" offset={40} position="bottom" />
          </XAxis>

          <YAxis>
            <Label value="Tensión (V)" angle={-90} position="insideLeft" />
          </YAxis>

          <Tooltip content={<CustomTooltip />} animationDuration={0} />

          <ReferenceLine
            y={3}
            label={{
              value: "Nivel normal de batería",
              position: "insideTop",
              style: { fill: "red", fontWeight: "bold" }, // Cambiar el color y estilo
            }}
            stroke="red"
            strokeWidth={5}
            strokeDasharray="10 10"
          />

          <Area
            type="monotone"
            dataKey="data"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorVoltage)"
            isAnimationActive={false}
          />

          <Brush dataKey="timestamp" height={30} stroke="#82ca9d" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraphTension;
