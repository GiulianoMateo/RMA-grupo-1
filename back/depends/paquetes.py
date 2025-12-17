import json
from datetime import datetime
from typing import Optional

from ..database import get_db
from ..depends.validaciones import es_valido, nodo_es_valido
from ..paquete.schemas import PaqueteCreate
from ..paquete.services import crear_paquete
from ..alertas.push_notifications import NotificationHandler


def guardar_paquete_en_db(paquete: PaqueteCreate):
    db = next(get_db())
    nuevo = crear_paquete(db, paquete)
    print(f"Paquete guardado en DB: {nuevo.id}")


def procesar_mensaje(mensaje) -> Optional[PaqueteCreate]:
    mensaje = mensaje.replace("'", '"')
    mensaje_json = json.loads(mensaje)
    try:
        mensaje_paquete = {
            "nodo_id": mensaje_json["id"],
            "type_id": int(mensaje_json["type"]),
            "data": float(mensaje_json["data"]),
            "date": datetime.fromtimestamp(mensaje_json["time"]),
        }
        paquete = PaqueteCreate(**mensaje_paquete)
        return paquete
    except Exception as e:
        print(f"Error de validación: {e}")


notifications = NotificationHandler()


def mi_callback(mensaje: str) -> None:
    # Mostrar el mensaje tal como llega y luego el paquete procesado
    print("Mensaje recibido desde MQTT:", mensaje)
    paquete = procesar_mensaje(mensaje)
    print("Paquete procesado:", paquete)

    if paquete is not None and nodo_es_valido(paquete) and es_valido(paquete):
        notifications.if_alert_notificate(paquete, db=next(get_db()))
        guardar_paquete_en_db(paquete)
