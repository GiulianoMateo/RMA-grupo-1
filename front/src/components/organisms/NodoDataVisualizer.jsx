import React, { useState, useMemo } from "react";
import { FiltroDatos } from "../molecules";
import { GraphView, TableView } from ".";
import { Card, TextToggleButton } from "../atoms";

const NodoDataVisualizer = ({
  dataByType,
  tipos,
  loading,
  onFilterChange,
  isExporting,
}) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => setIsToggled(!isToggled);

  /* =========================
     TABLA: TODOS LOS DATOS
  ========================= */
  const mergedData = useMemo(
    () =>
      Object.values(dataByType)
        .flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [dataByType]
  );

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        {!isExporting && (
          <TextToggleButton
            textLeft="Gráfico"
            textRight="Tabla"
            isToggled={isToggled}
            onToggled={handleToggle}
          />
        )}

        <FiltroDatos
          onFilterChange={onFilterChange}
          isExporting={isExporting}
        />
      </div>

      {!isToggled ? (
        <GraphView
          dataByType={dataByType}
          tipos={tipos}
          loading={loading}
        />
      ) : (
        <TableView data={{ items: mergedData }} loading={loading} />
      )}
    </Card>
  );
};

export default NodoDataVisualizer;
