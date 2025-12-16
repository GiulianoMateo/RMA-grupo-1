"""
    EL SCRIPT SE EJECUTA EN EL MISMO ENTORNO (VENV) QUE USAMOS PARA EJECUTAR FASTAPI

    python carga_base.py --help

    python carga_base.py --count 1 --nodo 2 --type

    con "count" definimos cuantos datos queremos que genere. Por default va a generar 100 entradas.
 """

from datetime import datetime, timedelta

# CONFIGURACION

DEFAULT_ENTRY_COUNT = 500  # abarca 7 dias
DEFAULT_NODO = 1

# Temperaturas máximas y minimas permitidas
MAX_TEMP = 40
MIN_TEMP = -10




import random
import time
import os
import json
import math
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

import argparse

# Configuración de argparse para manejar argumentos de línea de comandos
parser = argparse.ArgumentParser(
    description="Enviar datos de temperatura y nivel hidrométrico a través de MQTT."
)
parser.add_argument(
    "--count",
    type=int,
    default=DEFAULT_ENTRY_COUNT,
    help="Número de entradas a generar"
)
parser.add_argument(
    "--nodo", type=int, default=DEFAULT_NODO, help="Nodo de sensor a utilizar", required=True
)
parser.add_argument(
    "--type", type=int, default=None, help="Tipo de dato a enviar -> 1: temp | 14: precipitacion | 16: tension | 25: nivel hidrométrico | 26: viento | Si no lo incluyes, envia una tanda para cada tipo"
)
parser.add_argument(
    "--data", type=float, default=None, help="Dato unico para enviar manualmente"
)

parser.add_argument(
    "--minutes", type=int, default=20, help="Minutos entre cada mensaje"
)

parser.add_argument(
    "--delayms", type=int, default=100, help="Tiempo en ms entre el envío MQTT de un mensaje y otro"
)

args = parser.parse_args()

ENTRY_COUNT = args.count
TIME_BETWEEN_MESSAGES = args.delayms / 1000  # segundos
# Cada cuantos minutos llegan los datos
MINUTES_BETWEEN_ENTRIES = args.minutes

start_date = datetime.now() - timedelta(minutes=args.count * MINUTES_BETWEEN_ENTRIES)

# Configuración MQTT
BROKER = os.getenv("MQTT_HOST")
PORT = int(os.getenv("MQTT_PORT"))
TOPIC = os.getenv("MQTT_TOPIC")

# Inicialización del cliente MQTT
client = mqtt.Client()

# Conectar al broker MQTT
client.connect(BROKER, PORT, 60)


def getValidType(type):
    if type in [1, 14, 16, 25, 26]:
        return type
    elif type is None:
        print("Enviando todos los tipos de dato")
        return DEFAULT_TYPE
    else:
        print("type incorrecto.\n -> 1: temp | 14: precipitacion | 16: tension | 25: nivel hidrométrico | 26: viento")
        exit(0)



def getLimitsFromType(type):

    ruta = os.path.join(os.path.dirname(__file__), "config.json")
    if os.path.exists(ruta):
        with open(ruta, "r") as archivo:
            config = json.load(archivo)
    else:
        print("Error: config.json no encontrado.")
        exit(-1)

    if type == 1:
        return config["umbral"]["temperatura"]
    if type == 14:
        return config["umbral"]["precipitacion"]
    if type == 16:
        return config["umbral"]["tension"]
    if type == 25:
        return config["umbral"]["nivel_hidrometrico"]
    if type == 26:
        return config["umbral"]["viento"]
    raise Exception("Tipo incorrecto")


def enviar_mensaje(mensaje):
    # Convertir el mensaje a formato JSON
    mensaje_json = json.dumps(mensaje)

    # Enviar el mensaje al topic mediante MQTT
    client.publish(TOPIC, mensaje_json)

    # Imprimir el mensaje para verificar
    print(f"Mensaje enviado: {mensaje_json}")
    if args.data is not None:
        exit(0)
    time.sleep(TIME_BETWEEN_MESSAGES)

valid_types = [1, 14, 16, 25, 26]


# Generación de datos

# Valores iniciales
data_temp = 15
data_precip = 0
data_tension = 3.2
data_nivel = 0
data_viento = 5

def generar_temp():
    
    [MIN, MAX] = getLimitsFromType(1)
    global data_temp

    for i in range(ENTRY_COUNT):
        fecha_hora = start_date + timedelta(minutes=i * MINUTES_BETWEEN_ENTRIES)
        # Simulación de la temperatura
        data_temp += (random.random() - 0.5) * (1.2 * MINUTES_BETWEEN_ENTRIES / 20)

        data_temp += math.sin(math.pi * (fecha_hora.hour - 7)/12)
        
        # Limitar el dato
        data_temp = max(MIN, min(MAX, data_temp))

        # Crear el mensaje JSON
        mensaje = {
            "id": args.nodo,
            "type": 1,
            "data": args.data if args.data is not None else data_temp,
            "time": int(fecha_hora.timestamp()) if args.data is None else int(datetime.now().timestamp()),
        }

        enviar_mensaje(mensaje)

def generar_nivel():
    [MIN, MAX] = getLimitsFromType(25)
    global data_nivel

    for i in range(ENTRY_COUNT):
        fecha_hora = start_date + timedelta(minutes=i * MINUTES_BETWEEN_ENTRIES)
        
        # Simulación del nivel
        data_nivel += (random.random() - 0.5) * 20
        
        # Limitar el dato
        data_nivel = max(MIN, min(MAX, data_nivel))

        # Crear el mensaje JSON
        mensaje = {
            "id": args.nodo,
            "type": 25,
            "data": args.data if args.data is not None else data_nivel,
            "time": int(fecha_hora.timestamp()) if args.data is None else int(datetime.now().timestamp()),
        }
        enviar_mensaje(mensaje)


def generar_tension():
    [MIN, MAX] = getLimitsFromType(16)
    global data_tension

    for i in range(ENTRY_COUNT):
        fecha_hora = start_date + timedelta(minutes=i * MINUTES_BETWEEN_ENTRIES)
        
        # Simulación de la caida en la bateria
        data_tension -= random.random() * 0.03

        # A veces, puede cargarse
        random_number = random.random() - 0.5
        if random_number > 0.94:
            data_tension += 2
        

        # Limitar el dato
        data_tension = max(MIN, min(MAX, data_tension))

        # Crear el mensaje JSON
        mensaje = {
            "id": args.nodo,
            "type": 16,
            "data": args.data if args.data is not None else data_tension,
            "time": int(fecha_hora.timestamp()) if args.data is None else int(datetime.now().timestamp()),
        }

        enviar_mensaje(mensaje)


def generar_precip():
    [MIN, MAX] = getLimitsFromType(14)
    global data_precip

    for i in range(ENTRY_COUNT):
        fecha_hora = start_date + timedelta(minutes=i * MINUTES_BETWEEN_ENTRIES)

        random_number = random.random()
        if random_number > 0.3:
            data_precip = 0
        else:
            data_precip = random_number * 10

        # Limitar el dato
        data_precip = max(MIN, min(MAX, data_precip))

        # Crear el mensaje JSON
        mensaje = {
            "id": args.nodo,
            "type": 14,
            "data": args.data if args.data is not None else data_precip,
            "time": int(fecha_hora.timestamp()) if args.data is None else int(datetime.now().timestamp()),
        }

        enviar_mensaje(mensaje)


def generar_viento():
    [MIN, MAX] = getLimitsFromType(26)
    global data_viento

    for i in range(ENTRY_COUNT):
        fecha_hora = start_date + timedelta(minutes=i * MINUTES_BETWEEN_ENTRIES)
        
        # Simulación de la velocidad del viento
        data_viento += (random.random() - 0.5) * (2 * MINUTES_BETWEEN_ENTRIES / 20)
        
        # A veces, hay ráfagas
        random_number = random.random()
        if random_number > 0.92:
            data_viento += random.random() * 15
        
        # Limitar el dato
        data_viento = max(MIN, min(MAX, data_viento))

        # Crear el mensaje JSON
        mensaje = {
            "id": args.nodo,
            "type": 26,
            "data": args.data if args.data is not None else data_viento,
            "time": int(fecha_hora.timestamp()) if args.data is None else int(datetime.now().timestamp()),
        }

        enviar_mensaje(mensaje)


if args.type == 1:
    generar_temp()
elif args.type == 14:
    generar_precip()
elif args.type == 16:
    generar_tension()
elif args.type == 25:
    generar_nivel()
elif args.type == 26:
    generar_viento()
elif args.type is None:
    generar_temp()
    generar_precip()
    generar_tension()
    generar_nivel()
    generar_viento()
else:
    print("Tipo ingresado incorrecto. --help")