import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { Container, Header, SubmitButton } from "../components/atoms";
import { MapaComponent } from "../components/molecules";
import { useNodos } from "../hooks/useNodos";
import CheckBoxTipos from "../components/molecules/CheckBoxTipos";

const SensorForm = () => {
  const [formData, setFormData] = useState({
    identificador: "",
    porcentajeBateria: "",
    latitud: "",
    longitud: "",
    descripcion: "",
    tipos: [], // ids de tipos seleccionados
  });

  const [tipos, setTipos] = useState([]); // tipos opcionales que vienen del backend
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { addNodo } = useNodos({ enableAdd: true });

  // ---------------------------
  // Traer los tipos desde el backend
  // ---------------------------
  useEffect(() => {
    fetch("http://localhost:8000/tipos")
      .then((res) => res.json())
      .then((data) => {
        // Filtramos Tensión porque siempre va incluido
        const tiposOpcionales = data.filter((tipo) => tipo.nombre !== "Tensión");
        setTipos(tiposOpcionales);
      })
      .catch((error) => {
        console.error("Error al obtener tipos:", error);
        showNotification("Error al cargar los tipos de datos", "error");
      });
  }, []);

  // ---------------------------
  // Manejar cambios de input
  // ---------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------------------
  // Manejar cambios de tipos
  // ---------------------------
  const handleTipoChange = (id, checked) => {
    setFormData((prev) => {
      let nuevosTipos = [...prev.tipos];
      if (checked) nuevosTipos.push(id);
      else nuevosTipos = nuevosTipos.filter((t) => t !== id);
      return { ...prev, tipos: nuevosTipos };
    });
  };

  // ---------------------------
  // Manejar submit del formulario
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Siempre agregar Tensión (id=3)
      const tiposFinales = [...formData.tipos.map(String), "3"];

      const dataToSend = {
        ...formData,
        tipos: tiposFinales,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
      };

      await addNodo(dataToSend);
      showNotification("¡Nodo creado exitosamente!", "success");
      navigate("/sensores");
    } catch (error) {
      console.error("Error al crear el nodo:", error);
      showNotification("Error al crear el nodo", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Header title="Crear Nodo" />
      <form onSubmit={handleSubmit} className="space-y-5">
      {/* Grupo 1: Identificador y Batería */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="identificador">Identificador:</label>
            <input
              type="text"
              id="identificador"
              name="identificador"
              value={formData.identificador}
              onChange={handleChange}
              className="input-text"
              required
            />
          </div>
          <div>
            <label htmlFor="porcentajeBateria">Porcentaje de Batería:</label>
            <input
              type="number"
              id="porcentajeBateria"
              name="porcentajeBateria"
              value={formData.porcentajeBateria}
              onChange={handleChange}
              min={0}
              max={100}
              className="input-text"
              required
            />
          </div>
        </div>
      </div>

      

      {/* Grupo 2: Tipos de datos */}
      <div className="space-y-2">
        <label>Tipos de datos:</label>
        <CheckBoxTipos
          tipos={tipos}
          selectedTipos={formData.tipos}
          onChange={handleTipoChange}
        />
      </div>

      {/* Grupo 3: Latitud, Longitud y Mapa */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitud">Latitud:</label>
            <input
              type="number"
              id="latitud"
              name="latitud"
              value={formData.latitud}
              onChange={handleChange}
              className="input-text"
              required
            />
          </div>
          <div>
            <label htmlFor="longitud">Longitud:</label>
            <input
              type="number"
              id="longitud"
              name="longitud"
              value={formData.longitud}
              onChange={handleChange}
              className="input-text"
              required
            />
          </div>
        </div>

        <div>
          <MapaComponent setFormData={setFormData} />
        </div>
      </div>

      {/* Grupo 4: Descripción */}
      <div className="space-y-2">
        <label htmlFor="descripcion">Descripción:</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="input-text"
          rows={4}
          maxLength={256}
        />
        <div className="text-right text-xs text-gray-500">
          {256 - formData.descripcion.length} caracteres restantes
        </div>
      </div>
      
      {/* Botón submit */}
      <div className="flex justify-center">
        <SubmitButton isSubmitting={isSubmitting} name="Crear Nodo" />
      </div>
    </form>

    </Container>
  );
};

export default SensorForm;
