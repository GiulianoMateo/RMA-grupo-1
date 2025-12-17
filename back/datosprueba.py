"""
Enviar un dato manual por MQTT SIN validar type contra la API
Ideal para pruebas cuando los tipos son dinámicos
"""

import os
import json
import argparse
from datetime import datetime
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

BROKER = os.getenv("MQTT_HOST")
PORT = int(os.getenv("MQTT_PORT"))
TOPIC = os.getenv("MQTT_TOPIC")

parser = argparse.ArgumentParser(description="Enviar dato manual por MQTT")

parser.add_argument("--type", type=int, required=True, help="ID del tipo")
parser.add_argument("--nodo", type=int, required=True, help="ID del nodo")
parser.add_argument("--dato", type=float, required=True, help="Valor a enviar")

args = parser.parse_args()

client = mqtt.Client()
client.connect(BROKER, PORT, 60)

mensaje = {
    "id": args.nodo,
    "type": args.type,
    "data": args.dato,
    "time": int(datetime.now().timestamp())
}

client.publish(TOPIC, json.dumps(mensaje))

print("✅ Mensaje enviado:")
print(mensaje)

client.disconnect()
