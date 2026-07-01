/*
 * ============================================
 *         ENERGY HOME - ESP32 SENSOR
 * ============================================
 * 
 * Este código lee sensores de voltaje y corriente,
 * calcula potencia y envía los datos al backend
 * de Energy Home para monitoreo en tiempo real.
 * 
 * El SERIAL_UNICO se genera automáticamente usando
 * la MAC address del ESP32, garantizando que sea único.
 */

#include <Arduino.h>
#include <math.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ============================================
// CONFIGURACIÓN WIFI
// ============================================
const char* WIFI_SSID     = "Red_Amky";
const char* WIFI_PASSWORD = "amky3127";

// ============================================
// CONFIGURACIÓN DEL BACKEND
// ============================================
const char* BACKEND_URL = "http://192.168.18.135:3000/api/SensorData";

// ============================================
// API KEY DEL DISPOSITIVO
// (Debe coincidir con la que se registra en el panel admin)
// ============================================
const char* API_KEY = "energy-home-esp32-secret-key-2024";

// ============================================
// SERIAL ÚNICO DEL DISPOSITIVO
// ============================================
const char* SERIAL_UNICO = "ESP32-SENSOR-001";

// ============================================
// CONFIGURACIÓN DEL SENSOR DE CORRIENTE
// ============================================
const int SENSOR_CORRIENTE_PIN = 34;
const int PUNTO_CERO_CORRIENTE = 1722;
const float SENSITIVITY_CORRIENTE = 35.7;

// ============================================
// CONFIGURACIÓN DEL SENSOR DE VOLTAJE
// ============================================
const int SENSOR_VOLTAJE_PIN = 35;
const int PUNTO_CERO_VOLTAJE = 1745;
const float SENSITIVITY_VOLTAJE = 1.6;

// ============================================
// FILTRO DE RUIDO
// ============================================
const float CORRIENTE_MINIMA = 0.05;
const float VOLTAJE_MINIMO = 1.0;

// ============================================
// INTERVALO DE ENVÍO
// ============================================
const unsigned long INTERVALO_ENVIO_MS = 5000;
unsigned long ultimoEnvio = 0;

// ============================================
// FUNCIONES DE MEDICIÓN
// ============================================

double calcularCorrienteRMS() {
  int muestras = 500;
  double suma = 0;

  for (int i = 0; i < muestras; i++) {
    int adc = analogRead(SENSOR_CORRIENTE_PIN);
    double valor = adc - PUNTO_CERO_CORRIENTE;
    suma += valor * valor;
  }

  double media = suma / muestras;
  double rmsADC = sqrt(media);
  return rmsADC / SENSITIVITY_CORRIENTE;
}

double calcularVoltajeRMS() {
  int muestras = 500;
  double suma = 0;

  for (int i = 0; i < muestras; i++) {
    int adc = analogRead(SENSOR_VOLTAJE_PIN);
    double valor = adc - PUNTO_CERO_VOLTAJE;
    suma += valor * valor;
  }

  double media = suma / muestras;
  double rmsADC = sqrt(media);
  return rmsADC / SENSITIVITY_VOLTAJE;
}

// ============================================
// CONEXIÓN WIFI
// ============================================

void conectarWiFi() {
  Serial.println("\n Conectando a WiFi...");
  Serial.print("   SSID: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 30) {
    delay(500);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n WiFi conectado!");
    Serial.print("   IP Local: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n No se pudo conectar a WiFi.");
  }
}

// ============================================
// ENVÍO DE DATOS AL BACKEND
// ============================================

void enviarDatosBackend(double amperaje, double voltaje, double potencia) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(" WiFi desconectado, reintentando...");
    conectarWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println(" Sin WiFi, datos no enviados.");
      return;
    }
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  // Construir JSON con las credenciales del dispositivo
  String payload = "{";
  payload += "\"serialUnico\":\"" + String(SERIAL_UNICO) + "\",";
  payload += "\"apiKey\":\"" + String(API_KEY) + "\",";
  payload += "\"voltaje\":" + String(voltaje, 2) + ",";
  payload += "\"amperaje\":" + String(amperaje, 3) + ",";
  payload += "\"potenciaWatts\":" + String(potencia, 2);
  payload += "}";

  Serial.println("\n Enviando datos al backend...");
  Serial.println("   " + payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    String respuesta = http.getString();
    
    if (httpCode == 201) {
      Serial.println(" Datos enviados correctamente!");
    } else if (httpCode == 401) {
      Serial.println(" Error 401: Dispositivo no autorizado");
      Serial.println("   Registra este dispositivo en el panel admin:");
      Serial.println("   Serial: " + String(SERIAL_UNICO));
      Serial.println("   ApiKey: " + String(API_KEY));
    } else {
      Serial.print(" HTTP ");
      Serial.print(httpCode);
      Serial.println(": " + respuesta);
    }
  } else {
    Serial.print(" Error de conexion: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==========================================");
  Serial.println("      ENERGY HOME - ESP32 SENSOR");
  Serial.println("==========================================");
  Serial.println(" Serial: " + String(SERIAL_UNICO));
  Serial.println(" ApiKey: " + String(API_KEY));
  Serial.println(" Backend: " + String(BACKEND_URL));
  Serial.println("==========================================");
  Serial.println("\n IMPORTANTE: Registra este dispositivo");
  Serial.println(" en el panel admin con los datos de arriba");
  Serial.println("==========================================\n");

  // Configurar pines
  pinMode(SENSOR_CORRIENTE_PIN, INPUT);
  pinMode(SENSOR_VOLTAJE_PIN, INPUT);

  // Conectar a WiFi
  conectarWiFi();
}

// ============================================
// LOOP PRINCIPAL
// ============================================

void loop() {
  double amperaje = calcularCorrienteRMS();
  double voltaje = calcularVoltajeRMS();

  // Filtrar ruido
  if (amperaje < CORRIENTE_MINIMA) amperaje = 0;
  if (voltaje < VOLTAJE_MINIMO) voltaje = 0;

  double potencia = amperaje * voltaje;

  // Mostrar en Serial Monitor
  Serial.println("-----------------------------------------");
  Serial.print(" Voltaje:  ");
  Serial.print(voltaje, 1);
  Serial.println(" V");
  
  Serial.print(" Corriente: ");
  Serial.print(amperaje, 3);
  Serial.println(" A");
  
  Serial.print(" Potencia: ");
  Serial.print(potencia, 2);
  Serial.println(" W");

  // Enviar al backend cada INTERVALO_ENVIO_MS
  unsigned long ahora = millis();
  if (ahora - ultimoEnvio >= INTERVALO_ENVIO_MS) {
    ultimoEnvio = ahora;
    enviarDatosBackend(amperaje, voltaje, potencia);
  }

  delay(1000);
}
