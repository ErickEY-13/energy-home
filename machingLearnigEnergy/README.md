Proyecto "Real" — Simulación en tiempo real y API para detección de anomalías

Objetivo
- Simular lecturas en tiempo real de dispositivos (voltaje, amperaje, potencia).
- Guardar mediciones en una base ligera (SQLite) con el mismo esquema SQL propuesto.
- Analizar datos con modelos ML ligeros: detección de anomalías (IsolationForest) y forecast de consumo (LinearRegression).
- Generar recomendaciones estandarizadas y devolver resultados en JSON vía API (FastAPI).

Estructura
- `db_utils.py`       : utilidades para crear DB y leer/escribir tablas.
- `simulator.py`     : simulador que inserta mediciones en la BD en tiempo real.
- `analysis.py`      : funciones para detectar anomalías, calcular forecast y métricas.
- `models.py`        : implementaciones ML (IsolationForest + LinearRegression).
- `api.py`           : FastAPI app que expone endpoints JSON.
- `requirements.txt` : dependencias.

Rápido inicio (PowerShell)
```powershell
pip install -r "C:\Users\USER\Downloads\ModeloPy+\Real\requirements.txt"
# Ejecuta la API (uvicorn)
uvicorn real.api:app --reload --port 8000
```

Endpoints principales
- `GET /status` -> estado del servicio
- `POST /simulator/start` -> inicia simulador (body: device serial, interval)
- `POST /simulator/stop` -> detiene simulador
- `GET /devices` -> lista de dispositivos
- `GET /measurements?device_id=&limit=` -> lecturas recientes
- `GET /analysis?device_id=` -> JSON con métricas, anomalías y recomendaciones

Notas
- En este prototipo usamos SQLite local (`real_data.db`) para facilitar pruebas. Para producción, conecta a SQL Server (adaptar `db_utils.py`).
- Los modelos son ligeros para permitir ejecución local sin GPUs.

Cómo funciona (resumen)
----------------------
- La API `Real/api.py` expone endpoints REST para controlar un simulador, consultar dispositivos y realizar análisis.
- El simulador (`Real/simulator.py`) inserta mediciones periódicas (voltaje, amperaje, potencia) en la base de datos local `real_data.db`.
- `Real/db_utils.py` contiene el esquema (tablas `Dispositivos` y `Mediciones`) y utilidades para insertar/leer datos.
- `Real/analysis.py` aplica un detector de anomalías (IsolationForest) sobre la potencia y calcula una estimación simple de coste futuro (kWh).
- Las recomendaciones se generan en base a las anomalías detectadas y saltos de consumo bruscos; la API devuelve todo en JSON.

Cómo ejecutar (paso a paso)
---------------------------
Requisitos:
- Python 3.10+ y `pip`.
- Instalar dependencias desde `requirements.txt`.

1) Instalar dependencias

```powershell
pip install -r "C:\Users\USER\Downloads\ModeloPy+\Real\requirements.txt"
```

2) Iniciar la API (FastAPI / Uvicorn)

```powershell
cd "C:\Users\USER\Downloads\ModeloPy+\Real"
python run_server.py
```
```

3) (Opcional) Servir la interfaz web estática

La carpeta `Web/` contiene `index.html` que consume la API. Para evitar limitaciones del `file://` en algunos navegadores, usa el servidor estático de Python:

```powershell
cd "C:\Users\USER\Downloads\ModeloPy+\Web"
# Servidor estático en el puerto 8080
python -m http.server 8080
# Abrir http://127.0.0.1:8080 en el navegador
```

4) Probar el simulador y análisis

- Inicia el simulador vía API (ejemplo con `curl`):

```powershell
curl -X POST "http://127.0.0.1:8000/simulator/start" -H "Content-Type: application/json" -d "{\"serial_unico\":\"SIM_TEST_01\",\"nombre\":\"Sim Test\",\"interval_s\":1}"
```

- Consultar dispositivos:

```powershell
curl "http://127.0.0.1:8000/devices"
```

- Pedir análisis para `device_id=1` (ajusta según tu `devices`):

```powershell
curl "http://127.0.0.1:8000/analysis?device_id=1"
```

5) Parar el simulador

```powershell
curl -X POST "http://127.0.0.1:8000/simulator/stop" -H "Content-Type: application/json" -d "{\"serial_unico\":\"SIM_TEST_01\"}"
```

Configuración y producción
--------------------------
- SQLite es para pruebas. Para usar SQL Server en producción:
	- Reemplaza `db_utils.init_db` / métodos por una implementación basada en `pyodbc` o `sqlalchemy` hacia tu servidor SQL.
	- Asegúrate de que la tabla `Mediciones` use tipos `DECIMAL`/`DATETIME` como en tu esquema propuesto.
- Seguridad: la API actual no tiene autenticación. Antes de exponerla, añade autenticación (API keys / OAuth) y restringe CORS.

Extensiones recomendadas
-----------------------
- Reemplazar `IsolationForest` por el autoencoder/LSTM que ya tenemos para detectar anomalías y tendencias con mayor precisión.
- Añadir persistencia de recomendaciones en la base de datos (tabla `Recommendations`) y un endpoint para listarlas.
- Enviar notificaciones (email/Slack) cuando se detecten severidades `high`.

Contacto
-------
Si quieres que implemente alguna de las extensiones (persistir recomendaciones, integrar autoencoder/LSTM, migrar a SQL Server o añadir notificaciones), dime cuál y lo agrego.
