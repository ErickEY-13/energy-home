import pymysql
import os
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Conectar a la misma BD de NestJS
DATABASE_URL = os.getenv('DATABASE_URL', 'mysql://root:@localhost:3306/energy_db')

# Parsear URL
import re
match = re.match(r'mysql://([^:]+):([^@]*)@([^:/]+):?(\d+)?/(\w+)', DATABASE_URL)
if match:
    user, password, host, port, database = match.groups()
    port = int(port) if port else 3306
else:
    # Valores por defecto
    user, password, host, port, database = 'root', '', 'localhost', 3306, 'energy_db'

DB_CONFIG = {
    'host': host,
    'user': user,
    'password': password,
    'database': database,
    'port': port,
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}


def init_db():
    """Conecta a MySQL (energy_db) - Usa las tablas existentes de Prisma"""
    try:
        conn = pymysql.connect(**DB_CONFIG)
        print(f"✅ Conectado a MySQL: {database}")
        return conn
    except Exception as e:
        print(f"❌ Error conectando a MySQL: {e}")
        raise


def add_device(conn, serial_unico, nombre='Dispositivo', ubicacion=None, tipo='sensor'):
    """Agrega dispositivo a tabla 'dispositivos' (schema Prisma)"""
    cur = conn.cursor()
    try:
        # Usar nombres de columnas de Prisma: serialUnico, topicMqtt, estadoActual
        topic_mqtt = f"energy/{serial_unico}"
        cur.execute(
            'INSERT INTO dispositivos (serialUnico, nombre, topicMqtt, estadoActual) VALUES (%s, %s, %s, %s)',
            (serial_unico, nombre, topic_mqtt, 'OFF')
        )
        conn.commit()
        return cur.lastrowid
    except pymysql.IntegrityError:
        # Device ya existe, retornar su id
        cur.execute('SELECT id FROM dispositivos WHERE serialUnico=%s', (serial_unico,))
        row = cur.fetchone()
        return row['id'] if row else None


def insert_measurement(conn, dispositivo_id, voltaje, amperaje, potencia_watts, fecha_registro=None):
    """Inserta medición en tabla 'mediciones' (schema Prisma)"""
    cur = conn.cursor()
    fecha_registro = fecha_registro or datetime.utcnow()
    # Columnas Prisma: dispositivoId, voltaje, amperaje, potenciaWatts, fechaRegistro
    cur.execute(
        'INSERT INTO mediciones (dispositivoId, voltaje, amperaje, potenciaWatts, fechaRegistro) VALUES (%s, %s, %s, %s, %s)',
        (dispositivo_id, float(voltaje), float(amperaje), float(potencia_watts), fecha_registro)
    )
    conn.commit()
    return cur.lastrowid


def fetch_recent_measurements(conn, dispositivo_id=None, limit=1000):
    """Obtiene mediciones desde tabla 'mediciones' (Prisma)"""
    sql = 'SELECT id, dispositivoId as dispositivo_id, voltaje, amperaje, potenciaWatts as potencia_watts, fechaRegistro as fecha_registro FROM mediciones '
    params = []
    if dispositivo_id is not None:
        sql += 'WHERE dispositivoId=%s '
        params.append(dispositivo_id)
    sql += 'ORDER BY fechaRegistro DESC LIMIT %s'
    params.append(limit)
    df = pd.read_sql_query(sql, conn, params=params)
    return df


def fetch_devices(conn):
    """Obtiene dispositivos desde tabla 'dispositivos' (Prisma)"""
    sql = 'SELECT id, serialUnico as serial_unico, nombre, estadoActual as estado_actual FROM dispositivos'
    return pd.read_sql_query(sql, conn)
