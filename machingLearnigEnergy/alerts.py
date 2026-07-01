"""
alerts.py - Sistema de alertas para comunicarse con el backend NestJS
"""
import requests
import os
from typing import Dict, Any, Optional
from datetime import datetime

# URL del backend NestJS
NESTJS_API_URL = os.getenv('NESTJS_API_URL', 'http://localhost:3000')


class AlertSender:
    """Envía alertas al backend NestJS para notificación en tiempo real"""
    
    def __init__(self, api_url: str = NESTJS_API_URL):
        self.api_url = api_url
        self.endpoint = f"{api_url}/alertas/create"
    
    def send_alert(
        self,
        dispositivo_id: int,
        tipo: str,
        severidad: str,
        mensaje: str,
        datos: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Envía una alerta al backend
        
        Args:
            dispositivo_id: ID del dispositivo
            tipo: 'anomalia', 'consumo_alto', 'spike', 'prediccion', 'eficiencia'
            severidad: 'low', 'medium', 'high'
            mensaje: Mensaje descriptivo de la alerta
            datos: Datos adicionales en formato dict
        
        Returns:
            Response del backend o dict con error
        """
        try:
            payload = {
                'dispositivoId': dispositivo_id,
                'tipo': tipo,
                'severidad': severidad,
                'mensaje': mensaje,
                'datos': datos or {},
            }
            
            response = requests.post(
                self.endpoint,
                json=payload,
                timeout=5
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Alerta enviada: [{severidad}] {mensaje}")
                return response.json()
            else:
                print(f"⚠️ Error enviando alerta: {response.status_code}")
                return {'error': response.text}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error de conexión con backend: {e}")
            return {'error': str(e)}
    
    def send_anomaly_alert(
        self,
        dispositivo_id: int,
        anomaly_count: int,
        severity: str = 'medium'
    ):
        """Alerta de anomalías detectadas"""
        return self.send_alert(
            dispositivo_id=dispositivo_id,
            tipo='anomalia',
            severidad=severity,
            mensaje=f'⚠️ {anomaly_count} anomalías detectadas en los últimos 10 minutos',
            datos={
                'anomaly_count': anomaly_count,
                'timestamp': datetime.now().isoformat()
            }
        )
    
    def send_spike_alert(
        self,
        dispositivo_id: int,
        max_power: float,
        avg_power: float,
        multiplier: float
    ):
        """Alerta de pico de potencia"""
        return self.send_alert(
            dispositivo_id=dispositivo_id,
            tipo='spike',
            severidad='high' if multiplier >= 3 else 'medium',
            mensaje=f'⚡ Pico de potencia detectado: {max_power:.1f}W ({multiplier:.1f}x promedio)',
            datos={
                'max_power': max_power,
                'avg_power': avg_power,
                'multiplier': multiplier,
                'timestamp': datetime.now().isoformat()
            }
        )
    
    def send_high_consumption_alert(
        self,
        dispositivo_id: int,
        current_power: float,
        threshold: float
    ):
        """Alerta de consumo alto"""
        return self.send_alert(
            dispositivo_id=dispositivo_id,
            tipo='consumo_alto',
            severidad='high',
            mensaje=f'🔥 Consumo alto detectado: {current_power:.1f}W (umbral: {threshold:.1f}W)',
            datos={
                'current_power': current_power,
                'threshold': threshold,
                'timestamp': datetime.now().isoformat()
            }
        )
    
    def send_forecast_alert(
        self,
        dispositivo_id: int,
        estimated_kwh: float,
        estimated_cost: float,
        horizon_minutes: int
    ):
        """Alerta de predicción de consumo"""
        return self.send_alert(
            dispositivo_id=dispositivo_id,
            tipo='prediccion',
            severidad='low',
            mensaje=f'📊 Predicción: {estimated_kwh:.3f} kWh en {horizon_minutes} min (S/ {estimated_cost:.2f})',
            datos={
                'estimated_kwh': estimated_kwh,
                'estimated_cost': estimated_cost,
                'horizon_minutes': horizon_minutes,
                'timestamp': datetime.now().isoformat()
            }
        )
    
    def send_efficiency_alert(
        self,
        dispositivo_id: int,
        mensaje: str,
        severity: str = 'low'
    ):
        """Alerta de eficiencia energética"""
        return self.send_alert(
            dispositivo_id=dispositivo_id,
            tipo='eficiencia',
            severidad=severity,
            mensaje=f'💡 {mensaje}',
            datos={
                'timestamp': datetime.now().isoformat()
            }
        )


# Instancia global del sender
alert_sender = AlertSender()


def send_alert_from_analysis(dispositivo_id: int, analysis_result: Dict[str, Any]):
    """
    Procesa resultado de análisis y envía alertas automáticamente
    
    Args:
        dispositivo_id: ID del dispositivo analizado
        analysis_result: Resultado de analyze_device()
    """
    analysis = analysis_result.get('analysis', {})
    recommendations = analysis_result.get('recommendations', [])
    
    # Enviar alertas basadas en recomendaciones
    for rec in recommendations:
        severity = rec.get('severity', 'low')
        message = rec.get('message', '')
        
        # Determinar tipo de alerta
        if 'anomalías' in message.lower() or 'anomal' in message.lower():
            anomaly_count = analysis.get('anomaly_count_recent', 0)
            if anomaly_count >= 3:
                alert_sender.send_anomaly_alert(
                    dispositivo_id,
                    anomaly_count,
                    severity
                )
        
        elif 'pico' in message.lower() or 'spike' in message.lower():
            # Extraer datos del análisis
            max_power = analysis.get('max_power', 0)
            avg_power = analysis.get('avg_power', 0)
            if max_power > 0 and avg_power > 0:
                multiplier = max_power / avg_power
                alert_sender.send_spike_alert(
                    dispositivo_id,
                    max_power,
                    avg_power,
                    multiplier
                )
        
        elif severity == 'high':
            # Cualquier recomendación de severidad alta
            alert_sender.send_high_consumption_alert(
                dispositivo_id,
                analysis.get('mean_power', 0),
                analysis.get('max_power', 0)
            )
    
    # Enviar forecast si está disponible
    forecast = analysis.get('forecast')
    if forecast:
        alert_sender.send_forecast_alert(
            dispositivo_id,
            forecast.get('estimated_kwh', 0),
            forecast.get('estimated_cost', 0),
            forecast.get('horizon_minutes', 60)
        )


if __name__ == '__main__':
    # Test del sistema de alertas
    print("🧪 Probando sistema de alertas...")
    
    # Test: Alerta de anomalía
    result = alert_sender.send_anomaly_alert(
        dispositivo_id=1,
        anomaly_count=5,
        severity='high'
    )
    print(f"Resultado anomalía: {result}")
    
    # Test: Alerta de spike
    result = alert_sender.send_spike_alert(
        dispositivo_id=1,
        max_power=500.0,
        avg_power=150.0,
        multiplier=3.33
    )
    print(f"Resultado spike: {result}")
