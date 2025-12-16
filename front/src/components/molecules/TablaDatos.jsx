import React from "react";
import './TablaDatos.css';
import { useTable } from "react-table";
import { Card } from "../atoms";
import { dateFormatter } from "../utils/utils-graphs";
import { useTipoDato }  from "../../hooks"; // Asegúrate de importar useTipos



const TablaDatos = ({ items, tipo }) => {
  const data = React.useMemo(() => items, [items]);
  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        Header: "Dato",
        accessor: "data",
        Cell: ({ value }) => value.toFixed(1),
      },
      {
        Header: "Fecha y Hora",
        accessor: "timestamp",
        Cell: ({ value }) => {
          const date = new Date(value);
          return date.toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        },
      },
    ];
    if (!tipo) {
      return [
        {
          Header: "Tipo de Dato", 
          accessor: "type_id",
        },
        ...baseColumns,
      ];
    }
    return baseColumns;
  }, [tipo]);



  const { tipos} = useTipoDato();
  
  // Crear un objeto de búsqueda rápida para los tipos de datos
  const tiposMap = tipos.reduce((acc, tipo) => {
    acc[tipo.data_type] = tipo.data_symbol; // Mapeamos `data_type` a `data_symbol`
    return acc;
  }, {});
  
  
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
  useTable({ columns, data });
  
  const copiarFila = (row) => {
    const texto = row.cells.map((cell) => cell.value).join(" | ");
    navigator.clipboard.writeText(texto).then(() => {
      console.log("copiado");
    });
  };

  const getTipoName = typeid => {
    try {
      tipo = tipos.reduce((a, b) => b.data_type == typeid ? b : a)
      return tipo?.nombre
    } catch(e) {
      return ""
    }
  }
  
  return (
    <Card>
      <table
        className="table-container"
        style={{ tableLayout: "fixed", width: "100%" }} // Eliminar márgenes
        {...getTableProps()}
      >
        <thead className="table-definir">
          {headerGroups.map((headerGroup) => {
            const { key, ...headerGroupProps } =
              headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...headerGroupProps}>
                {headerGroup.headers.map((column) => {
                  const { key, ...columnProps } = column.getHeaderProps();
                  return (
                    <th key={key} {...columnProps} className="table-header">
                      {column.render("Header")}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody className="separador-header" {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const { key, ...rowProps } = row.getRowProps();
            return (
              <tr
                key={key}
                {...rowProps}
                onClick={() => copiarFila(row)}
                className="table-row"
              >
                {row.cells.map((cell) => {
                  const { key, ...cellProps } = cell.getCellProps();
                  return (
                    <td key={key} {...cellProps} className="table-row-cell">
                      {cell.column.Header === "Tipo de Dato" && `${getTipoName(cell.value)}`}
                      {cell.column.Header === "Dato" && `${Number(cell.value).toFixed(1)} ${tiposMap[cell.row.original.type_id]}`} 
                      {cell.column.Header === 'Fecha y Hora' && dateFormatter(cell.value) }
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
};

export default TablaDatos;
