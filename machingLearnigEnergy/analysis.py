import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from models import AnomalyModel, ForecastModel
from db_utils import fetch_recent_measurements
from alerts import send_alert_from_analysis
import os

# Cargar tarifa desde env
TARIFA_ELECTROSUR = float(os.getenv('TARIFA_ELECTROSUR', '0.78'))


def detect_anomalies_df(df, feature='potencia_watts', window=300):
    """Detect anomalies in recent window using IsolationForest.
    Returns df with `anomaly` boolean column and scores.
    """
    if df.empty:
        return df
    # use last `window` rows
    X = df[[feature]].tail(window).values
    model = AnomalyModel(contamination=0.02)
    model.fit(X)
    preds = model.predict(X)
    df = df.copy()
    df['anomaly'] = False
    df.loc[df.tail(window).index, 'anomaly'] = preds
    return df


def forecast_cost(df, price_per_kwh=None, horizon_minutes=60):
    """Forecast future cost assuming recent trend. Returns estimated cost in next horizon."""
    # Usar tarifa Electrosur por defecto
    if price_per_kwh is None:
        price_per_kwh = TARIFA_ELECTROSUR
    
    if df.empty:
        return {'estimated_kwh': 0.0, 'estimated_cost': 0.0, 'mean_watts': 0.0}
    # Convert watts to kW and average per minute to get kWh for horizon
    recent = df[['potencia_watts']].dropna().tail(120)
    if recent.empty:
        return {'estimated_kwh': 0.0, 'estimated_cost': 0.0, 'mean_watts': 0.0}
    # sample per minute assumed; compute mean kW
    mean_watts = recent['potencia_watts'].mean()
    mean_kw = mean_watts / 1000.0
    # estimated kwh over horizon minutes
    est_kwh = mean_kw * (horizon_minutes / 60.0)
    est_cost = est_kwh * price_per_kwh
    return {
        'estimated_kwh': float(est_kwh),
        'estimated_cost': float(est_cost),
        'mean_watts': float(mean_watts),
        'horizon_minutes': horizon_minutes
    }


def generate_recommendations_from_df(df):
    recs = []
    if df is None or df.empty:
        return recs
    # if anomalies present in last 10 minutes -> high severity
    last_10 = df.tail(10)
    anomalies = int(last_10['anomaly'].sum()) if 'anomaly' in last_10.columns else 0
    if anomalies >= 3:
        recs.append({'severity':'high','message':'Se detectaron múltiples anomalías recientes. Revisar dispositivo.'})
    elif anomalies >=1:
        recs.append({'severity':'medium','message':'Anomalía puntual detectada. Recomiendo revisar conexiones.'})
    # sudden power jump detection
    if len(df) >= 2:
        last = df['potencia_watts'].iloc[-1]
        prev = df['potencia_watts'].iloc[-10:-1].mean() if len(df) > 10 else df['potencia_watts'].iloc[:-1].mean()
        if prev > 0 and (last / prev) > 2.0:
            recs.append({'severity':'high','message':'Aumento brusco de potencia detectado. Posible fallo o carga inesperada.'})
    return recs


def analyze_device(conn, dispositivo_id, limit=1000, send_alerts=True):
    df = fetch_recent_measurements(conn, dispositivo_id=dispositivo_id, limit=limit)
    if df.empty:
        return {'device_id': dispositivo_id, 'measurements': [], 'analysis': {}, 'recommendations': []}
    # Ensure proper types
    df['potencia_watts'] = pd.to_numeric(df['potencia_watts'], errors='coerce')
    df = df.sort_values('fecha_registro')
    df.reset_index(drop=True, inplace=True)

    df_anom = detect_anomalies_df(df, feature='potencia_watts')
    forecast = forecast_cost(df)
    recs = generate_recommendations_from_df(df_anom)

    # build JSON-friendly output
    recent_samples = df_anom.tail(100).to_dict(orient='records')
    
    # Calcular estadísticas adicionales para alertas
    max_power = float(df['potencia_watts'].max())
    avg_power = float(df['potencia_watts'].mean())
    
    out = {
        'device_id': dispositivo_id,
        'samples_returned': len(recent_samples),
        'analysis': {
            'anomaly_count_recent': int(df_anom['anomaly'].tail(60).sum()) if 'anomaly' in df_anom.columns else 0,
            'forecast': forecast,
            'max_power': max_power,
            'avg_power': avg_power,
            'mean_power': avg_power
        },
        'recommendations': recs,
        'measurements': recent_samples
    }
    
    # 🚨 Enviar alertas automáticamente al backend
    if send_alerts and recs:
        try:
            send_alert_from_analysis(dispositivo_id, out)
        except Exception as e:
            print(f"⚠️ Error enviando alertas: {e}")
    
    return out
