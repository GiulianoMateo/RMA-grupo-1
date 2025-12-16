from back.paquete.schemas import PaqueteBase, PaqueteRechazadoOut
from back.paquete.models import Tipo
from back.paquete.services import crear_paquete_rechazado
from ..database import get_db
from back.alertas.push_notifications import NotificationHandler
from back.nodos.models import Nodo
from ..nodos.services import listar_nodos

notifications = NotificationHandler()

"""
Valida el valor de un paquete contra un umbral y lo archiva si es inválido.

Parámetros:
- paquete: Datos recibidos del nodo (incluye `data`, `nodo_id`, `type_id`, `date`).
- umbral: Lista de dos valores [mínimo, máximo] permitidos para el tipo.
- name: Nombre legible del tipo (p.ej., "temperatura").

Retorna:
- True si el valor está dentro del rango permitido.
- False si está fuera de rango; en ese caso registra el rechazo y notifica.
"""
def validar_o_archivar(paquete: PaqueteBase) -> bool:
    """Valida únicamente que el tipo del paquete exista en la base de datos.

    Nota: Se mantiene la firma para compatibilidad pero se ignoran
    los parámetros `umbral` y `name`. No se realizan validaciones
    de rangos ni se archiva el paquete.

    Retorna True si el tipo existe; False en caso contrario.
    """
    db = next(get_db())
    tipo = db.query(Tipo).filter(Tipo.id == paquete.type_id).first()
    if tipo is None:
        print(f"Tipo de dato {paquete.type_id} inválido (no existe en 'tipos').")
        return False
    return True



def es_valido(paquete: PaqueteBase) -> bool:
    """Valida únicamente que el `type_id` del paquete exista en la base de datos.

    Esta función evita hardcodear tipos y no verifica umbrales. De esta forma,
    si se agregan nuevos tipos en el futuro, serán aceptados automáticamente con
    solo estar presentes en la tabla `tipos`.

    Retorna True si el tipo existe; de lo contrario False.
    """
    db = next(get_db())
    tipo = db.query(Tipo).filter(Tipo.id == paquete.type_id).first()
    if tipo is None:
        print(f"Tipo de dato {paquete.type_id} inválido (no existe en 'tipos').")
        return False
    return True


def nodo_is_activo(paquete: PaqueteBase) -> bool:
    """Verifica si el nodo asociado al paquete está activo.

    Compara el `nodo_id` del paquete contra la lista de nodos activos
    obtenida desde la base de datos.

    Retorna True si el nodo está activo; False si no existe o está inactivo.
    """
    db = next(get_db())
    nodo_id = paquete.nodo_id

    if nodo_id is None:
        return False

    nodos_activos = listar_nodos(db)
    nodo_ids_activos = [nodo.id for nodo in nodos_activos]

    return nodo_id in nodo_ids_activos
