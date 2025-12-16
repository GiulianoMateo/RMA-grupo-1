/**
 * Devuelve un string con el tiempo relativo desde el último dato recibido
 * Ejemplo: "Hace 5 minutos", "Hace 2 horas", "Hace 3 días"
 * @param {*} lastData - Objeto con la info del último dato (debe incluir `timestamp`)
 * @returns {string}
 */
export const obtenerTimeAgoString = (lastData) => {
  // 👇 Ver qué llega desde el backend (debug)
  console.log("📦 Último dato recibido en obtenerTimeAgoString:", lastData);

  // Si el dato viene vacío o sin timestamp, devolvemos un mensaje de seguridad
  if (!lastData || !lastData.timestamp) {
    return "Sin fecha disponible";
  }

  // Convertimos el timestamp (string ISO8601) en un objeto Date
  const lastTime = new Date(lastData.timestamp);
  const now = new Date();

  // Diferencia en minutos entre la fecha actual y la del dato
  const minutesBetween = (now - lastTime) / (1000 * 60);

  // Devolvemos la frase según el rango de tiempo
  if (minutesBetween < 1) return `Hace menos de un minuto`;
  if (minutesBetween < 2) return `Hace un minuto`;
  if (minutesBetween < 59) return `Hace ${minutesBetween.toFixed(0)} minutos`;
  if (minutesBetween < 120) return `Hace 1 hora`;
  if (minutesBetween < 60 * 24)
    return `Hace ${Math.floor(minutesBetween / 60).toFixed(0)} horas`;

  return `Hace ${Math.floor(minutesBetween / (60 * 24)).toFixed(0)} días`;
};

/**
 * Devuelve un string con el tiempo desde el último dato de una colección
 * Ejemplo: "Hace 3 horas"
 * @param {*} data - Array de objetos que contienen `timestamp`
 * @returns {string}
 */
export const obtenerStringTiempoDesdeUltimoDato = (data) => {
  // Si no hay datos o viene vacío, devolvemos mensaje
  if (!data || data.length === 0 || data[0] === undefined) {
    return "Sin datos";
  }

  // Tomamos el último dato del array y usamos su timestamp
  const lastTime = new Date(data[data.length - 1]?.timestamp);
  const now = new Date();

  // Calculamos diferencia en minutos
  const minutesBetween = (now - lastTime) / (1000 * 60);

  // Retorno según el rango de tiempo
  if (minutesBetween < 1) return `Hace menos de un minuto`;
  if (minutesBetween < 2) return `Hace un minuto`;
  if (minutesBetween < 59) return `Hace ${minutesBetween.toFixed(0)} minutos`;
  if (minutesBetween < 120) return `Hace 1 hora`;
  if (minutesBetween < 60 * 24)
    return `Hace ${Math.floor(minutesBetween / 60).toFixed(0)} horas`;

  return `Hace ${Math.floor(minutesBetween / (60 * 24)).toFixed(0)} días`;
};

/**
 * Formatea un objeto Date a "HH:mm hs"
 * @param {*} date - Objeto Date
 * @returns {string}
 */
export const formatTime = (date) => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")} hs`;
};

/**
 * Convierte un string ISO8601 a timestamp (ms desde 1970)
 * @param {*} timestamp - String o número
 * @returns {number} timestamp
 */
export const convertToTimestamp = (timestamp) =>
  typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;

/**
 * Convierte un campo específico a timestamp dentro de una colección
 * @param {*} collection - Array de objetos
 * @param {*} field - Nombre del campo a convertir (ej: "timestamp")
 * @returns {array}
 */
export const convertFieldToTimestamp = (collection, field) => {
  return collection.map((item) => {
    const fieldValue = item[field];
    const timestamp = convertToTimestamp(fieldValue);
    return {
      ...item,
      [field]: timestamp,
    };
  });
};
