'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Cpu,
  Gauge,
  DollarSign,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { ReactNode } from 'react';

// ============================================
// CONSTANTES DE ELECTROSUR
// ============================================
export const TARIFA_ELECTROSUR = 0.78; // S/ por kWh

// Calcula el costo basado en la fórmula de Electrosur
export function calcularCostoElectrosur(
  potenciaWatts: number, 
  horasPorDia: number = 24, 
  diasMes: number = 30
): number {
  return (potenciaWatts / 1000) * horasPorDia * diasMes * TARIFA_ELECTROSUR;
}

// ============================================
// STAT CARD PREMIUM
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'cyan';
  isDarkMode?: boolean;
}

const accentColors = {
  blue: {
    light: 'bg-blue-50 text-blue-600',
    dark: 'bg-blue-900/30 text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    light: 'bg-green-50 text-green-600',
    dark: 'bg-green-900/30 text-green-400',
    gradient: 'from-green-500 to-green-600',
  },
  orange: {
    light: 'bg-orange-50 text-orange-600',
    dark: 'bg-orange-900/30 text-orange-400',
    gradient: 'from-orange-500 to-orange-600',
  },
  purple: {
    light: 'bg-purple-50 text-purple-600',
    dark: 'bg-purple-900/30 text-purple-400',
    gradient: 'from-purple-500 to-purple-600',
  },
  red: {
    light: 'bg-red-50 text-red-600',
    dark: 'bg-red-900/30 text-red-400',
    gradient: 'from-red-500 to-red-600',
  },
  cyan: {
    light: 'bg-cyan-50 text-cyan-600',
    dark: 'bg-cyan-900/30 text-cyan-400',
    gradient: 'from-cyan-500 to-cyan-600',
  },
};

export function StatCardPremium({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  accentColor = 'blue',
  isDarkMode = false 
}: StatCardProps) {
  const colors = accentColors[accentColor];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative p-6 rounded-2xl border overflow-hidden group cursor-default
        ${isDarkMode 
          ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50'}`}
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium
              ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{trend.value}%</span>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${isDarkMode ? colors.dark : colors.light}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// DEVICE CARD PREMIUM
// ============================================
interface DeviceCardProps {
  id: number;
  nombre: string;
  nombrePersonalizado?: string;
  tipoObjeto?: string;
  ubicacion?: string;
  estado: 'ON' | 'OFF';
  potenciaActual?: number;
  consumoMensual?: number;
  costoReal?: number;      // Costo REAL basado en consumo histórico
  consumoKwh?: number;     // kWh REALES consumidos
  periodoLabel?: string;   // "30 días" si es fallback, undefined si es mes actual
  onClick?: () => void;
  onToggle?: () => void;
  isDarkMode?: boolean;
}

export function DeviceCardPremium({
  id,
  nombre,
  nombrePersonalizado,
  tipoObjeto,
  ubicacion,
  estado,
  potenciaActual = 0,
  consumoMensual = 0,
  costoReal,
  consumoKwh,
  periodoLabel,
  onClick,
  onToggle,
  isDarkMode = false
}: DeviceCardProps) {
  const isOn = estado === 'ON';
  
  // Usar costo REAL si está disponible, sino estimar
  const costoMostrar = costoReal !== undefined 
    ? costoReal 
    : calcularCostoElectrosur(potenciaActual);
  const esEstimado = costoReal === undefined;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl border cursor-pointer group overflow-hidden transition-all
        ${isDarkMode 
          ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50'}`}
    >
      {/* Status Indicator - Más minimalista */}
      <div className={`absolute top-4 right-4`}>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all
          ${isOn 
            ? isDarkMode 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : isDarkMode 
              ? 'bg-gray-700/50 text-gray-500 border border-gray-600' 
              : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOn ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {isOn ? 'ON' : 'OFF'}
        </div>
      </div>

      {/* Device Icon */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all
        ${isOn 
          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>
        <Cpu size={28} />
      </div>

      {/* Device Info */}
      <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {nombrePersonalizado || nombre}
      </h3>
      <div className="flex items-center gap-2 mb-4">
        {tipoObjeto && (
          <span className={`text-xs px-2 py-0.5 rounded-full
            ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {tipoObjeto}
          </span>
        )}
        {ubicacion && (
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            📍 {ubicacion}
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Potencia actual</p>
          <p className={`text-lg font-bold ${isOn ? 'text-blue-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {isOn ? `${potenciaActual.toFixed(0)} W` : '- W'}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Consumo {periodoLabel || 'mes'}
          </p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
            {consumoKwh !== undefined && consumoKwh > 0 ? `${consumoKwh.toFixed(3)} kWh` : '0.000 kWh'}
          </p>
        </div>
        <div className="col-span-2">
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Costo {periodoLabel || 'mes actual'}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              S/ {costoMostrar.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  isDarkMode?: boolean;
}

export function EmptyState({ icon, title, description, action, isDarkMode = false }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-16 px-8 rounded-2xl border-2 border-dashed
        ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}
    >
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
        ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>
        {icon}
      </div>
      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`mb-6 max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// ============================================
// QUICK STATS BAR
// ============================================
interface QuickStatsBarProps {
  stats: {
    label: string;
    value: string;
    icon: ReactNode;
  }[];
  isDarkMode?: boolean;
}

export function QuickStatsBar({ stats, isDarkMode = false }: QuickStatsBarProps) {
  return (
    <div className={`flex items-center gap-6 px-6 py-4 rounded-2xl overflow-x-auto
      ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-100'}`}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-3 min-w-fit">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            {stat.icon}
          </div>
          <div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
          </div>
          {index < stats.length - 1 && (
            <div className={`w-px h-10 ml-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
