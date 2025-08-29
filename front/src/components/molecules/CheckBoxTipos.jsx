import React from "react";

/**
 * Componente que renderiza los tipos de datos como checkboxes
 * 
 * Props:
 * - tipos: array de objetos {id, nombre} que son los tipos opcionales
 * - selectedTipos: array de ids seleccionados actualmente
 * - onChange: función para actualizar el estado del formulario
 */
const CheckBoxTipos = ({ tipos, selectedTipos, onChange }) => {
 const handleCheckboxChange = (id, checked) => {
    onChange(id, checked);
  };

  return (
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {/* Tensión primero, siempre activado y deshabilitado */}
        <div className="flex items-center gap-2 p-2 border border-gray-300 rounded bg-gray-200 col-span-1">
            <input type="checkbox" id="tipo-tension" checked disabled />
            <label htmlFor="tipo-tension" className="font-semibold">
            Tensión (Obligatorio)
            </label>
        </div>

        {/* Tipos opcionales */}
        {tipos.map((tipo) => (
            <div
            key={tipo.id}
            className="flex items-center gap-2 p-2 border border-gray-300 rounded hover:shadow-sm transition"
            >
            <input
                type="checkbox"
                id={`tipo-${tipo.id}`}
                checked={selectedTipos.includes(tipo.id)}
                onChange={(e) => handleCheckboxChange(tipo.id, e.target.checked)}
            />
            <label htmlFor={`tipo-${tipo.id}`}>{tipo.nombre}</label>
            </div>
        ))}
    </div>
  );
};

export default CheckBoxTipos;
