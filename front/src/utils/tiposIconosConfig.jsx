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
  const iconClass = tipo.icon || "fa-database";
  const color = tipo.color || "text-gray-500";

  if (nombre === "Tensión") {
    return {
      icon: <BsFillLightningChargeFill className={`mx-2 text-xl ${color}`} />,
      iconClass: iconClass || "fa-bolt",
      color,
      nombre,
    };
  }

  return {
    icon: <i className={`fa ${iconClass} ${color} mx-2 text-xl`} />,
    iconClass: iconClass,
    color,
    nombre,
  };
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
