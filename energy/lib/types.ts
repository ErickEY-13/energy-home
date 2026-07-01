// Tipos del sistema de energía

export enum Rol {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum EstadoDispositivo {
  ON = 'ON',
  OFF = 'OFF',
}

// Tipos de electrodomésticos/objetos
export enum TipoObjeto {
  TV = 'TV',
  REFRIGERADOR = 'REFRIGERADOR',
  LAVADORA = 'LAVADORA',
  MICROONDAS = 'MICROONDAS',
  AIRE_ACONDICIONADO = 'AIRE_ACONDICIONADO',
  VENTILADOR = 'VENTILADOR',
  COMPUTADORA = 'COMPUTADORA',
  LAPTOP = 'LAPTOP',
  CONSOLA_VIDEOJUEGOS = 'CONSOLA_VIDEOJUEGOS',
  ILUMINACION = 'ILUMINACION',
  ROUTER = 'ROUTER',
  CARGADOR = 'CARGADOR',
  CAFETERA = 'CAFETERA',
  LICUADORA = 'LICUADORA',
  HORNO = 'HORNO',
  PLANCHA = 'PLANCHA',
  SECADORA = 'SECADORA',
  CALENTADOR = 'CALENTADOR',
  BOMBA_AGUA = 'BOMBA_AGUA',
  OTRO = 'OTRO',
}

export interface TipoObjetoInfo {
  value: TipoObjeto;
  label: string;
  icon: string;
}

export interface Usuario {
  id: number;
  email: string;
  rol: Rol;
  fechaRegistro: string;
  fechaActualizacion: string;
}

// Dispositivo con personalización del usuario
export interface Dispositivo {
  id: number;
  serialUnico: string;
  nombre: string;               // Nombre técnico del dispositivo
  nombrePersonalizado?: string; // Nombre personalizado por el usuario
  tipoObjeto?: TipoObjeto;      // Tipo de electrodoméstico
  ubicacion?: string;           // Ubicación en casa
  icono?: string;               // Icono personalizado
  topicMqtt: string;
  estadoActual: EstadoDispositivo;
  fechaAsignado?: string;
}

export interface UsuarioDispositivo {
  id: number;
  usuarioId: number;
  dispositivoId: number;
  nombrePersonalizado?: string;
  tipoObjeto?: TipoObjeto;
  ubicacion?: string;
  icono?: string;
  fechaAsignado: string;
  usuario?: Usuario;
  dispositivo?: Dispositivo;
}

export interface Medicion {
  id: number;
  dispositivoId: number;
  voltaje: number;
  amperaje: number;
  potenciaWatts: number;
  fechaRegistro: string;
  dispositivo?: Dispositivo;
}

export interface EstadisticasDispositivo {
  totalMediciones: number;
  promedios: {
    voltaje: number;
    amperaje: number;
    potenciaWatts: number;
  };
  maximos: {
    voltaje: number;
    amperaje: number;
    potenciaWatts: number;
  };
  minimos: {
    voltaje: number;
    amperaje: number;
    potenciaWatts: number;
  };
  ultimaMedicion: Medicion | null;
}

// Consumo REAL calculado desde las mediciones con timestamps
export interface ConsumoReal {
  consumoKwh: number;        // kWh reales consumidos
  costoSoles: number;        // Costo en S/ (kWh × 0.78)
  horasMonitoreadas: number; // Total de horas que estuvo monitoreado
  totalMediciones: number;   // Cantidad de mediciones usadas
  periodoInicio: string;     // Fecha de primera medición
  periodoFin: string;        // Fecha de última medición
  diasSolicitados: number;   // Días que se solicitaron
  mensaje?: string;          // Mensaje si no hay suficientes datos
}

// Consumo del MES ACTUAL (desde día 1)
export interface ConsumoMesActual {
  consumoKwh: number;        // kWh consumidos este mes
  costoSoles: number;        // Costo acumulado este mes
  horasMonitoreadas: number;
  totalMediciones: number;
  periodoInicio: string;     // Día 1 del mes
  periodoFin: string;        // Ahora
  diaActual: number;         // Día del mes (ej: 5)
  diasEnMes: number;         // Total días del mes (ej: 31)
  diasConDatos?: number;     // Días con mediciones reales
  progresoMes: number;       // Porcentaje del mes transcurrido
  mesActual: boolean;        // true = mes actual, false = mes anterior
  nombreMes: string;         // "diciembre", "noviembre", etc.
  proyeccion?: {
    kwhEstimado: number;     // Proyección de consumo a fin de mes
    costoEstimado: number;   // Proyección de costo a fin de mes
  };
  mensaje?: string;
}

// Historial de consumo por mes
export interface ConsumoMensual {
  anio: number;
  mes: number;
  nombreMes: string;
  consumoKwh: number;
  costoSoles: number;
  totalMediciones: number;
  horasMonitoreadas: number;
  esActual: boolean;
}

export interface HistorialMensual {
  historial: ConsumoMensual[];
  resumen: {
    totalKwh: number;
    totalSoles: number;
    promedioMensualKwh: number;
    promedioMensualSoles: number;
    mesesAnalizados: number;
  };
}

// DTOs para requests
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nombre: string;
}

// DTO para adoptar dispositivo (con personalización opcional)
export interface AdoptarDispositivoDto {
  serialUnico: string;
  nombrePersonalizado?: string;
  tipoObjeto?: TipoObjeto;
  ubicacion?: string;
  icono?: string;
}

// DTO para personalizar dispositivo
export interface PersonalizarDispositivoDto {
  nombrePersonalizado?: string;
  tipoObjeto?: TipoObjeto;
  ubicacion?: string;
  icono?: string;
}

export interface CrearDispositivoDto {
  nombre: string;
  serialUnico: string;
}

// Dispositivo para vista de admin (con más info)
export interface DispositivoAdmin {
  id: number;
  serialUnico: string;
  nombre: string;
  topicMqtt: string;
  estadoActual: EstadoDispositivo;
  creadoEn?: string;
  usuariosAsignados: number;
  usuarios: { 
    id: number; 
    email: string;
    nombrePersonalizado?: string;
    tipoObjeto?: TipoObjeto;
    ubicacion?: string;
  }[];
  totalMediciones: number;
}

// Respuestas de la API
export interface AuthResponse {
  message: string;
  accessToken: string;
  user: Usuario;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface ControlResponse {
  message: string;
  dispositivo: {
    id: number;
    nombre: string;
    estadoActual: EstadoDispositivo;
  };
  accion: 'ENCENDER' | 'APAGAR';
}

export interface StatusResponse {
  id: number;
  serialUnico: string;
  nombre: string;
  estadoActual: EstadoDispositivo;
}

// ============ MACHINE LEARNING ============
export interface AnalisisML {
  id: number;
  dispositivoId: number;
  anomaliasDetectadas: number;
  severidad: string;
  forecastKwh: number | null;
  forecastCosto: number | null;
  recomendaciones: string[];
  datosAnalisis: Record<string, any>;
  fechaAnalisis: string;
  dispositivo?: {
    id: number;
    nombre: string;
    serialUnico: string;
    estadoActual: EstadoDispositivo;
  };
}

export interface MLAnalysisResponse {
  analisis: AnalisisML;
  mlData: {
    analysis?: {
      anomaly_count_recent?: number;
      forecast?: {
        estimated_kwh?: number;
        estimated_cost?: number;
      };
    };
    recommendations?: string[];
  };
}

export interface MLStats {
  totalAnalisis: number;
  alertasActivas: number;
  analisisRecientes?: AnalisisML[];
}
