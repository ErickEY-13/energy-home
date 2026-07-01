"""
============================================
    SIMULADOR ESP32 - ENERGY HOME
============================================
Simula dos dispositivos ESP32 enviando
mediciones al backend para demostración
============================================
"""

import requests
import time
import random
import sys
import io
from datetime import datetime

# Configurar codificación UTF-8 en consola Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Configuración
BACKEND_URL = "http://localhost:3000/api/SensorData"
API_KEY = "energy-home-esp32-secret-key-2024"

# Dispositivos simulados
DISPOSITIVOS = [
    {
        "serialUnico": "ESP32-001-SALA",
        "nombre": "Foco Sala",
        "voltajeBase": 220,
        "amperajeBase": 0.5,
        "variacion": 0.1
    },
    {
        "serialUnico": "ESP32-002-COCINA", 
        "nombre": "Ventilador",
        "voltajeBase": 220,
        "amperajeBase": 0.8,
        "variacion": 0.2
    },
    {
        "serialUnico": "ESP32-003-DORMITORIO", 
        "nombre": "Aire Acondicionado",
        "voltajeBase": 220,
        "amperajeBase": 5.5,
        "variacion": 0.3
    }
]

def print_header():
    print("\n" + "=" * 50)
    print("       SIMULADOR ESP32 - ENERGY HOME")
    print("=" * 50)
    print("\nDispositivos a simular:")
    for d in DISPOSITIVOS:
        print(f"  • {d['nombre']} ({d['serialUnico']})")
    print(f"\nBackend: {BACKEND_URL}")
    print("\n⚠️  IMPORTANTE: Asegúrate de que estos dispositivos")
    print("   estén registrados en el panel admin")
    print("\nPresiona Ctrl+C para detener")
    print("=" * 50 + "\n")

def enviar_medicion(dispositivo):
    """Envía una medición simulada al backend"""
    
    # Generar valores con variación aleatoria
    voltaje = round(dispositivo["voltajeBase"] + random.uniform(-5, 5), 2)
    amperaje = round(max(0.01, dispositivo["amperajeBase"] + random.uniform(-0.1, 0.1) * dispositivo["variacion"]), 3)
    potencia = round(voltaje * amperaje, 2)
    
    payload = {
        "serialUnico": dispositivo["serialUnico"],
        "apiKey": API_KEY,
        "voltaje": voltaje,
        "amperaje": amperaje,
        "potenciaWatts": potencia
    }
    
    try:
        response = requests.post(BACKEND_URL, json=payload, timeout=10)
        
        if response.status_code == 201:
            print(f"  ✓ {dispositivo['nombre']}: {voltaje}V, {amperaje}A, {potencia}W")
            return True
        elif response.status_code == 401:
            print(f"  ✗ {dispositivo['nombre']}: [401] No registrado")
            print(f"    → Registra: {dispositivo['serialUnico']}")
            return False
        else:
            print(f"  ✗ {dispositivo['nombre']}: [{response.status_code}] {response.text[:50]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"  ✗ {dispositivo['nombre']}: No se puede conectar al backend")
        return False
    except Exception as e:
        print(f"  ✗ {dispositivo['nombre']}: Error - {str(e)}")
        return False

def main():
    print_header()
    
    contador = 0
    errores_consecutivos = 0
    
    try:
        while True:
            contador += 1
            hora = datetime.now().strftime("%H:%M:%S")
            print(f"[{hora}] Envío #{contador}")
            
            exitos = 0
            for dispositivo in DISPOSITIVOS:
                if enviar_medicion(dispositivo):
                    exitos += 1
            
            if exitos == 0:
                errores_consecutivos += 1
                if errores_consecutivos >= 3:
                    print("\n⚠️  Muchos errores. ¿El backend está corriendo?")
                    print("   Ejecuta: cd backend-energy && npm run start:dev")
                    errores_consecutivos = 0
            else:
                errores_consecutivos = 0
            
            print()
            time.sleep(5)  # Enviar cada 5 segundos
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 50)
        print(f"Simulación detenida. Total envíos: {contador}")
        print("=" * 50 + "\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
