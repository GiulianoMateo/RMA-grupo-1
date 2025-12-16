import { BsFillLightningChargeFill } from "react-icons/bs";

/**
 * Configuración centralizada de iconos y estilos para tipos de datos
 * Usada en NodoCard, NodoRecentDataCard y otros componentes
 */

export const getTypeConfig = (tipo) => {
  if (!tipo) {
    return {
      icon: <i className="fa fa-database mx-2 text-xl" />,
      iconClass: "fa-database",
      color: "text-gray-500",
      nombre: "Desconocido",
    };
  }

  const nombre = tipo.nombre || tipo.name || "";

  if (nombre === "Temperatura") {
    return {
      icon: <i className="fa fa-thermometer text-rose-500 mx-2 text-xl" />,
      iconClass: "fa-thermometer",
      color: "text-rose-500",
      nombre: "Temperatura",
    };
  } else if (nombre === "Nivel Hidrométrico") {
    return {
      icon: <i className="fa fa-tint text-sky-500 mx-2 text-xl" />,
      iconClass: "fa-tint",
      color: "text-sky-500",
      nombre: "Nivel Hidrométrico",
    };
  } else if (nombre === "Tensión") {
    return {
      icon: <BsFillLightningChargeFill className="mx-2 text-xl text-yellow-500" />,
      iconClass: "fa-bolt",
      color: "text-yellow-500",
      nombre: "Tensión",
    };
  } else if (nombre === "Precipitación") {
    return {
      icon: <i className="fa fa-umbrella text-blue-400 mx-2 text-xl" />,
      iconClass: "fa-umbrella",
      color: "text-blue-400",
      nombre: "Precipitación",
    };
  } else if (nombre === "Viento") {
    return {
      icon: <i className="fa fa-flag text-gray-400 mx-2 text-xl" />,
      iconClass: "fa-flag",
      color: "text-gray-300",
      nombre: "Viento",
    };
  }else {
    return {
      icon: <i className="fa fa-database mx-2 text-xl" />,
      iconClass: "fa-database",
      color: "text-gray-500",
      nombre: nombre,
    };
  }
};

/**
 * Obtiene solo la clase de icono (para usar con fa-icon)
 */
export const getIconClass = (tipo) => {
  const config = getTypeConfig(tipo);
  return config.iconClass;
};

/**
 * Obtiene solo el color
 */
export const getTypeColor = (tipo) => {
  const config = getTypeConfig(tipo);
  return config.color;
};
