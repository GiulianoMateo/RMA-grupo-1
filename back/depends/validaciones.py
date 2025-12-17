from back.paquete.schemas import PaqueteBase, PaqueteRechazadoOut
from back.paquete.models import Tipo
from back.paquete.services import crear_paquete_rechazado
from ..database import get_db
from back.alertas.push_notifications import NotificationHandler
from back.nodos.models import Nodo
from ..nodos.services import listar_nodos

notifications = NotificationHandler()


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
    tipo = db.query(Tipo).filter(Tipo.data_type == paquete.type_id).first()
    if tipo is None:
        print(f"Tipo de dato {paquete.type_id} inválido (no existe en 'tipos').")
        return False
    return True



def nodo_es_valido(paquete: PaqueteBase) -> bool:
    """
    Valida que el nodo exista y que esté activo.

    - No lanza excepciones
    - No hardcodea nodos
    - Imprime mensajes claros según el error
    - Mantiene la misma filosofía que `es_valido`

    Retorna:
        True  -> el nodo existe y está activo
        False -> el nodo no existe o está inactivo
    """
    db = next(get_db())

    nodo_id = paquete.nodo_id

    if nodo_id is None:
        print("Nodo inválido: no se especificó nodo_id.")
        return False

    nodo = db.query(Nodo).filter(Nodo.id == nodo_id).first()

    if nodo is None:
        print(f"Nodo inválido: el nodo {nodo_id} no existe en la base de datos.")
        return False

    if not nodo.is_active:
        print(f"Nodo inválido: el nodo {nodo_id} existe pero está inactivo.")
        return False

    return True
