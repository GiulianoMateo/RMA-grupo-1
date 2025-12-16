import React, { useState, useEffect } from "react";
import { ConfirmationPopover, LoadingSpinner } from "../atoms";
import { MdOutlineSettingsInputAntenna } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useNodos } from "../../hooks";
import { useNotification } from "../../context/NotificationContext";

const NodoHeader = ({ sensor, loading }) => {
  const navigate = useNavigate();
  const { deleteNodo, updateNodo, loading: loadingNodo } = useNodos();
  const { showNotification } = useNotification();

  // =========================
  // Estados
  // =========================
  const [isEditing, setIsEditing] = useState(false);

  const [editableSensor, setEditableSensor] = useState({
    identificador: sensor.identificador,
    porcentajeBateria: sensor.porcentajeBateria || 0,
    latitud: sensor.latitud || 0,
    longitud: sensor.longitud || 0,
    descripcion: sensor.descripcion || "",
  });

  // Tipos de datos
  const [tiposDisponibles, setTiposDisponibles] = useState([]);
  const [tiposSeleccionados, setTiposSeleccionados] = useState(
    sensor.tipos || []
  );

  // =========================
  // Traer tipos desde backend
  // =========================
  useEffect(() => {
    fetch("http://localhost:8000/tipos")
      .then((res) => res.json())
      .then((data) => setTiposDisponibles(data))
      .catch((error) => {
        console.error("Error cargando tipos:", error);
        showNotification("Error al cargar tipos de datos", "error");
      });
  }, []);

  // =========================
  // Handlers
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditableSensor((prev) => ({
      ...prev,
      [name]:
        name === "latitud" || name === "longitud"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleTipoToggle = (tipoId) => {
    setTiposSeleccionados((prev) =>
      prev.includes(tipoId)
        ? prev.filter((id) => id !== tipoId)
        : [...prev, tipoId]
    );
  };

  const handleUpdate = async () => {
    if (isEditing) {
      try {
        await updateNodo(sensor.id, {
          ...editableSensor,
          tipos: tiposSeleccionados,
        });

        showNotification("Nodo actualizado exitosamente", "success");
      } catch (error) {
        console.error("Error actualizando nodo:", error);
        showNotification("Error actualizando el nodo", "error");
      }
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = async () => {
    try {
      await deleteNodo(sensor.id);
      showNotification("Nodo eliminado exitosamente", "success");
    } catch (error) {
      console.error("Error eliminando nodo:", error);
      showNotification("Error eliminando el nodo", "error");
    }
  };

  const monitorearBateria = () => {
    navigate(`/sensor/${sensor.id}/bateria-page`);
  };

  // =========================
  // Render
  // =========================
  return (
    <div id="header" className="relative flex items-start justify-between">
      {loading || loadingNodo ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* =========================
              Información del Nodo
          ========================= */}
          <div className="flex-grow max-w-2xl flex flex-col space-y-3">
            <h1 className="flex text-3xl items-center font-semibold">
              <MdOutlineSettingsInputAntenna className="mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  name="identificador"
                  value={editableSensor.identificador}
                  onChange={handleChange}
                  className="input-text border rounded px-2 py-1 w-48"
                />
              ) : (
                editableSensor.identificador
              )}
            </h1>

            {/* Descripción */}
            {isEditing ? (
              <>
                <textarea
                  className="input-text max-w-xl"
                  name="descripcion"
                  value={editableSensor.descripcion}
                  onChange={handleChange}
                  rows={4}
                  maxLength={256}
                />
                <div className="text-right text-xs text-gray-500">
                  {256 - editableSensor.descripcion.length} caracteres restantes
                </div>
              </>
            ) : (
              <p className="max-w-lg text-sm">{editableSensor.descripcion}</p>
            )}

            {/* Coordenadas */}
            <span className="flex flex-wrap items-center gap-2 text-sm">
              <i className="fa fa-map-marker" />
              <b>Lat:</b>
              {isEditing ? (
                <input
                  type="number"
                  step="0.00001"
                  name="latitud"
                  value={editableSensor.latitud}
                  onChange={handleChange}
                  className="input-text w-24"
                />
              ) : (
                editableSensor.latitud.toFixed(5)
              )}

              <b>Lon:</b>
              {isEditing ? (
                <input
                  type="number"
                  step="0.00001"
                  name="longitud"
                  value={editableSensor.longitud}
                  onChange={handleChange}
                  className="input-text w-24"
                />
              ) : (
                editableSensor.longitud.toFixed(5)
              )}
            </span>

            {/* =========================
                Tipos de datos (solo edición)
            ========================= */}
            {isEditing && (
              <div className="mt-4 space-y-2">
                <label className="font-semibold">
                  Tipos de datos asociados:
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {tiposDisponibles
                    .filter((tipo) => tipo.nombre.toLowerCase() !== "tensión")
                    .map((tipo) => (
                      <label
                        key={tipo.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={tiposSeleccionados.includes(tipo.id)}
                          onChange={() => handleTipoToggle(tipo.id)}
                        />
                        <span>{tipo.nombre}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* =========================
              Botones de acción
          ========================= */}
          <div className="flex flex-row space-x-2 absolute right-0 top-0">
            <button
              className="h-16 w-32 btn-action btn-active"
              onClick={handleUpdate}
            >
              {isEditing ? "Guardar" : "Modificar Nodo"}
            </button>

            <ConfirmationPopover onConfirm={handleDelete}>
              <span className="flex items-center justify-center h-16 w-32 btn-alert">
                Eliminar Nodo
              </span>
            </ConfirmationPopover>

            <button
              className="h-16 w-32 btn-action btn-active"
              onClick={monitorearBateria}
            >
              Monitorear Batería
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NodoHeader;
