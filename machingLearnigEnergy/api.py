from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import threading
import os
from db_utils import init_db, fetch_devices, fetch_recent_measurements, add_device
from simulator import start_simulator, stop_simulator, list_simulators
from analysis import analyze_device

app = FastAPI(title='ML Energy API')
# Habilitar CORS para que el frontend local pueda consumir la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión global con reconexión automática
_conn = None

def get_connection():
    global _conn
    try:
        if _conn is None or not _conn.open:
            _conn = init_db()
        # Test connection
        _conn.ping(reconnect=True)
        return _conn
    except Exception as e:
        print(f"⚠️ Reconectando a MySQL: {e}")
        _conn = init_db()
        return _conn

class SimulatorRequest(BaseModel):
    serial_unico: str
    nombre: str = 'SimDevice'
    interval_s: float = 1.0

@app.get('/status')
def status():
    return {'status': 'ok', 'simulators': list_simulators()}

@app.post('/simulator/start')
def api_start_simulator(req: SimulatorRequest):
    device_id = start_simulator(serial_unico=req.serial_unico, nombre=req.nombre, interval_s=req.interval_s)
    return {'started': True, 'device_id': device_id}

@app.post('/simulator/stop')
def api_stop_simulator(req: SimulatorRequest):
    ok = stop_simulator(req.serial_unico)
    return {'stopped': ok}

@app.get('/devices')
def api_devices():
    conn = get_connection()
    df = fetch_devices(conn)
    return {'devices': df.to_dict(orient='records')}

@app.get('/measurements')
def api_measurements(device_id: int = None, limit: int = 200):
    conn = get_connection()
    df = fetch_recent_measurements(conn, dispositivo_id=device_id, limit=limit)
    return {'measurements': df.to_dict(orient='records')}

@app.get('/analysis')
def api_analysis(device_id: int, limit: int = 1000):
    try:
        conn = get_connection()
        result = analyze_device(conn, dispositivo_id=device_id, limit=limit)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('real.api:app', host='0.0.0.0', port=8000, reload=True)
