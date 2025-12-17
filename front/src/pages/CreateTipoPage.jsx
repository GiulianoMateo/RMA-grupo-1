import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { Container, Header, SubmitButton } from "../components/atoms";
import BotonVolver from "../components/atoms/BotonVolver";
import axios from "axios";

// Lista de iconos ambientales disponibles
const ICONOS_AMBIENTALES = [
  { value: "bi bi-sunrise", label: "Amanecer" },
  { value: "bi bi-broadcast", label: "Antena" },
  { value: "bi bi-water", label: "Agua" },
  { value: "bi bi-lightbulb", label: "Bombilla" },
  { value: "bi bi-snow", label: "Copo de nieve" },
  { value: "bi bi-cloud", label: "Nube" },
  { value: "bi bi-cloud-fog2", label: "Niebla" },
  { value: "bi bi-cloud-snow", label: "Nieve" },
  { value: "bi bi-droplet", label: "Gota" },
  { value: "bi bi-cloud-rain", label: "Lluvia" },
  { value: "bi bi-thermometer", label: "Temperatura" },
  { value: "bi bi-geo-alt", label: "Ubicación" },
  { value: "bi bi-wind", label: "Viento" },
  { value: "bi bi-lightning", label: "Rayo" },
  { value: "bi bi-sun", label: "Sol" },
];

// Paleta de colores Tailwind predefinida
const COLORES_PALETA = [
  { value: "text-red-500", label: "Rojo", bgColor: "bg-red-500" },
  { value: "text-blue-500", label: "Azul", bgColor: "bg-blue-500" },
  { value: "text-green-500", label: "Verde", bgColor: "bg-green-500" },
  { value: "text-yellow-500", label: "Amarillo", bgColor: "bg-yellow-500" },
  { value: "text-purple-500", label: "Púrpura", bgColor: "bg-purple-500" },
  { value: "text-orange-500", label: "Naranja", bgColor: "bg-orange-500" },
  { value: "text-pink-500", label: "Rosa", bgColor: "bg-pink-500" },
  { value: "text-cyan-500", label: "Cian", bgColor: "bg-cyan-500" },
  { value: "text-indigo-500", label: "Índigo", bgColor: "bg-indigo-500" },
  { value: "text-gray-500", label: "Gris", bgColor: "bg-gray-500" },
];

const CreateTipoPage = () => {
  const [formData, setFormData] = useState({
    data_type: "",
    data_symbol: "",
    nombre: "",
    icon: "bi bi-thermometer",
    color: "text-blue-500",
  });

  const [errors, setErrors] = useState({});
  const [existingTypes, setExistingTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [iconOpen, setIconOpen] = useState(false);


  // Cargar tipos existentes para validar duplicados
  useEffect(() => {
    fetch("http://localhost:8000/tipos")
      .then((res) => res.json())
      .then((data) => setExistingTypes(data))
      .catch((error) => console.error("Error al cargar tipos:", error));
  }, []);

  // Validar data_type en tiempo real
  const validateDataType = (value) => {
    const newErrors = { ...errors };
    
    if (!value) {
      newErrors.data_type = "El identificador es requerido";
    } else {
      const numValue = parseInt(value);
      if (numValue < 1 || numValue > 100) {
        newErrors.data_type = "Debe estar entre 1 y 100";
      } else if (existingTypes.some((t) => t.data_type === numValue)) {
        newErrors.data_type = "Este identificador ya existe";
      } else {
        delete newErrors.data_type;
      }
    }
    setErrors(newErrors);
  };

  // Validar nombre en tiempo real
  const validateNombre = (value) => {
    const newErrors = { ...errors };
    
    if (!value) {
      newErrors.nombre = "El nombre es requerido";
    } else if (existingTypes.some((t) => t.nombre.toLowerCase() === value.toLowerCase())) {
      newErrors.nombre = "Este nombre ya está en uso";
    } else {
      delete newErrors.nombre;
    }
    setErrors(newErrors);
  };

  // Validar símbolo en tiempo real
  const validateSymbol = (value) => {
    const newErrors = { ...errors };
    
    if (!value) {
      newErrors.data_symbol = "El símbolo es requerido";
    } else if (value.length > 5) {
      newErrors.data_symbol = "Máximo 5 caracteres";
    } else {
      delete newErrors.data_symbol;
    }
    setErrors(newErrors);
  };

  // Manejar cambios de input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validar en tiempo real según el campo
    if (name === "data_type") {
      validateDataType(value);
    } else if (name === "nombre") {
      validateNombre(value);
    } else if (name === "data_symbol") {
      validateSymbol(value);
    }
  };

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors = {};
    if (!formData.data_type) newErrors.data_type = "El identificador es requerido";
    if (!formData.data_symbol) newErrors.data_symbol = "El símbolo es requerido";
    if (!formData.nombre) newErrors.nombre = "El nombre es requerido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification("Por favor completa todos los campos requeridos", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSend = {
        ...formData,
        data_type: parseInt(formData.data_type),
      };

      await axios.post("http://localhost:8000/tipos", dataToSend);
      
      showNotification("¡Tipo creado exitosamente!", "success");
      navigate("/configuracion");
    } catch (error) {
      console.error("Error al crear el tipo:", error);
      const errorMessage = 
        error.response?.data?.detail || 
        "Error al crear el tipo de dato";
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Header title="Crear Tipo de Dato" />
      
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
        {/* Grid de inputs: 2 columnas en pantallas medianas, 1 en móviles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo: Nombre */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Temperatura, Humedad..."
              maxLength="50"
              className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                errors.nombre
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              }`}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre}</p>
            )}
          </div>

          {/* Campo: Identificador (data_type) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              Identificador (1-100) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="data_type"
              value={formData.data_type}
              onChange={handleChange}
              placeholder="Ej: 1, 2, 3..."
              min="1"
              max="100"
              className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                errors.data_type
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              }`}
            />
            {errors.data_type && (
              <p className="text-sm text-red-500">{errors.data_type}</p>
            )}
          </div>

          {/* Campo: Símbolo (data_symbol) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              Unidad (máx. 5 caracteres) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="data_symbol"
              value={formData.data_symbol}
              onChange={handleChange}
              placeholder="Ej: °C, V, mm"
              maxLength="5"
              className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                errors.data_symbol
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              }`}
            />
            {errors.data_symbol && (
              <p className="text-sm text-red-500">{errors.data_symbol}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formData.data_symbol.length}/5
            </p>
          </div>

          {/* Campo: Icono (selector en grilla) */}
          <div className="space-y-2 relative">
            <label className="block text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              Icono <span className="text-red-500">*</span>
            </label>

            {/* Botón selector */}
            <button
              type="button"
              onClick={() => setIconOpen(!iconOpen)}
              className="w-full px-4 py-2 border rounded-lg
                        dark:bg-gray-800 dark:text-white
                        flex justify-between items-center"
            >
              <i className={`${formData.icon} text-xl`} />
              <i className="bi bi-chevron-down text-sm" />
            </button>

            {/* Grilla de iconos */}
            {iconOpen && (
              <div
                className="
                absolute z-50 mt-1 w-full
                max-h-48 overflow-y-auto
                rounded-lg border
                bg-white dark:bg-gray-800
                p-3
                "
              >
                <div className="grid grid-cols-5 gap-3">
                  {ICONOS_AMBIENTALES.map((icono) => (
                    <button
                      key={icono.value}
                      type="button"
                      title={icono.label}
                      onClick={() => {
                        setFormData({ ...formData, icon: icono.value });
                        setIconOpen(false);
                      }}
                      className={`
                        h-12 w-12 flex items-center justify-center rounded-lg border
                        transition-all
                        ${
                          formData.icon === icono.value
                            ? "border-blue-500 bg-blue-100 dark:bg-blue-900 scale-110"
                            : "border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      <i className={`${icono.value} text-xl`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Campo: Color (paleta visual) */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            Color <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-10 gap-2">
            {COLORES_PALETA.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`w-full h-12 rounded-lg border-2 transition-all ${
                  formData.color === color.value
                    ? "border-gray-900 dark:border-white scale-110"
                    : "border-gray-300 dark:border-gray-600"
                } ${color.bgColor} cursor-pointer hover:scale-105`}
                title={color.label}
              >
                {formData.color === color.value && (
                  <span className="text-white text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Seleccionado: {COLORES_PALETA.find((c) => c.value === formData.color)?.label}
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-8 justify-center">
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="roboto-medium text-lg bg-blue-300 hover:bg-blue-400 disabled:bg-gray-400 text-gray-800 font-bold py-2 px-8 rounded-2xl transition-all duration-100 dark:bg-slate-800 dark:hover:bg-slate-900 dark:text-slate-200 dark:disabled:bg-gray-600"
          >
            {isSubmitting ? "Creando..." : "Crear"}
          </button>
          <BotonVolver ruta="/configuracion" texto="Volver" />
        </div>
      </form>
    </Container>
  );
};

export default CreateTipoPage;

