import React from "react";
import { GraphNivel } from "../molecules";
import { LoadingSpinner } from "../atoms";


const GraphView = ({ dataByType, tipos, loading }) => {
  if (loading) return <LoadingSpinner />;

  
  return (
    <div className="w-full">
      {tipos.map((tipo) => {
        const rawData = dataByType[tipo.data_type];
        if (!rawData || rawData.length === 0) return null;

        const data = rawData.map((p) => ({
          ...p,
          date:
            typeof p.date === "number"
              ? p.date
              : new Date(p.timestamp).getTime(),
        }));

        return (
          <div key={tipo.id} className="mb-10">
            <h4 className="roboto-bold text-2xl text-center py-3 dark:text-slate-100">
              {tipo.nombre} ({tipo.data_symbol})
            </h4>

            {/* Por ahora usamos el mismo gráfico */}
            <GraphNivel data={data} />
          </div>
        );
      })}
    </div>
  );
};
export default GraphView;
