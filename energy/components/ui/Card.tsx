'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { 
  Tv, 
  Refrigerator, 
  Monitor, 
  Lightbulb, 
  Wind, 
  WashingMachine,
  Microwave,
  Plug,
  MapPin,
  Fan,
  Laptop,
  Gamepad2,
  Wifi,
  BatteryCharging,
  Coffee,
  Blend,
  Cookie,
  Shirt,
  Droplets,
  ThermometerSun,
  Waves,
} from 'lucide-react';
import type { TipoObjeto } from '@/lib/types';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100 p-6
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover ? { 
        y: -4, 
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        transition: { duration: 0.2 }
      } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </Component>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  accentColor = 'blue',
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-500 bg-green-50',
    down: 'text-red-500 bg-red-50',
    neutral: 'text-gray-500 bg-gray-50',
  };

  const accentColors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
              {trend === 'up' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7m0 10H7" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10m0-10h10" />
                </svg>
              )}
              {trendValue}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${accentColors[accentColor]} text-white shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
      {/* Decorative gradient */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${accentColors[accentColor]} opacity-10 blur-2xl`} />
    </Card>
  );
}

// Helper para obtener icono de tipo de objeto
const getTipoObjetoIcon = (tipo?: TipoObjeto) => {
  const icons: Record<TipoObjeto, ReactNode> = {
    TV: <Tv className="w-5 h-5" />,
    REFRIGERADOR: <Refrigerator className="w-5 h-5" />,
    COMPUTADORA: <Monitor className="w-5 h-5" />,
    ILUMINACION: <Lightbulb className="w-5 h-5" />,
    AIRE_ACONDICIONADO: <Wind className="w-5 h-5" />,
    LAVADORA: <WashingMachine className="w-5 h-5" />,
    MICROONDAS: <Microwave className="w-5 h-5" />,
    VENTILADOR: <Fan className="w-5 h-5" />,
    LAPTOP: <Laptop className="w-5 h-5" />,
    CONSOLA_VIDEOJUEGOS: <Gamepad2 className="w-5 h-5" />,
    ROUTER: <Wifi className="w-5 h-5" />,
    CARGADOR: <BatteryCharging className="w-5 h-5" />,
    CAFETERA: <Coffee className="w-5 h-5" />,
    LICUADORA: <Blend className="w-5 h-5" />,
    HORNO: <Cookie className="w-5 h-5" />,
    PLANCHA: <Shirt className="w-5 h-5" />,
    SECADORA: <Droplets className="w-5 h-5" />,
    CALENTADOR: <ThermometerSun className="w-5 h-5" />,
    BOMBA_AGUA: <Waves className="w-5 h-5" />,
    OTRO: <Plug className="w-5 h-5" />,
  };
  return tipo ? icons[tipo] : <Plug className="w-5 h-5" />;
};

const getTipoObjetoColor = (tipo?: TipoObjeto) => {
  const colors: Record<TipoObjeto, string> = {
    TV: 'from-blue-500 to-blue-600',
    REFRIGERADOR: 'from-cyan-500 to-cyan-600',
    COMPUTADORA: 'from-purple-500 to-purple-600',
    ILUMINACION: 'from-yellow-500 to-yellow-600',
    AIRE_ACONDICIONADO: 'from-sky-500 to-sky-600',
    LAVADORA: 'from-indigo-500 to-indigo-600',
    MICROONDAS: 'from-red-500 to-red-600',
    VENTILADOR: 'from-teal-500 to-teal-600',
    LAPTOP: 'from-violet-500 to-violet-600',
    CONSOLA_VIDEOJUEGOS: 'from-pink-500 to-pink-600',
    ROUTER: 'from-emerald-500 to-emerald-600',
    CARGADOR: 'from-lime-500 to-lime-600',
    CAFETERA: 'from-amber-500 to-amber-600',
    LICUADORA: 'from-orange-500 to-orange-600',
    HORNO: 'from-rose-500 to-rose-600',
    PLANCHA: 'from-fuchsia-500 to-fuchsia-600',
    SECADORA: 'from-blue-400 to-blue-500',
    CALENTADOR: 'from-red-400 to-red-500',
    BOMBA_AGUA: 'from-cyan-400 to-cyan-500',
    OTRO: 'from-gray-500 to-gray-600',
  };
  return tipo ? colors[tipo] : 'from-gray-500 to-gray-600';
};

interface DeviceCardProps {
  nombre: string;
  nombrePersonalizado?: string | null;
  tipoObjeto?: TipoObjeto | null;
  ubicacion?: string | null;
  estado: 'ON' | 'OFF';
  ultimaMedicion?: {
    potencia: number;
    energia: number;
  } | null;
  onClick?: () => void;
}

export function DeviceCard({
  nombre,
  nombrePersonalizado,
  tipoObjeto,
  ubicacion,
  estado,
  ultimaMedicion,
  onClick,
}: DeviceCardProps) {
  const estadoConfig = {
    ON: { color: 'bg-green-500', text: 'Encendido', glow: 'shadow-green-500/50' },
    OFF: { color: 'bg-gray-400', text: 'Apagado', glow: '' },
  };

  const config = estadoConfig[estado];
  const displayName = nombrePersonalizado || nombre;
  const tipoIcon = getTipoObjetoIcon(tipoObjeto || undefined);
  const tipoColor = getTipoObjetoColor(tipoObjeto || undefined);

  return (
    <Card hover onClick={onClick} className="text-left w-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icono del tipo de objeto */}
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tipoColor} text-white shadow-lg`}>
            {tipoIcon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{displayName}</h3>
              <div className={`w-2 h-2 rounded-full ${config.color} ${config.glow}`}>
                {estado === 'ON' && (
                  <motion.div
                    className={`w-full h-full rounded-full ${config.color}`}
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
            {nombrePersonalizado && (
              <p className="text-xs text-gray-400">{nombre}</p>
            )}
            {ubicacion && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {ubicacion}
              </p>
            )}
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          estado === 'ON' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {config.text}
        </span>
      </div>

      {ultimaMedicion && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">Potencia</p>
            <p className="text-lg font-bold text-gray-900">
              {ultimaMedicion.potencia.toFixed(1)} <span className="text-sm font-normal text-gray-500">W</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Energía</p>
            <p className="text-lg font-bold text-gray-900">
              {ultimaMedicion.energia.toFixed(2)} <span className="text-sm font-normal text-gray-500">kWh</span>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default Card;
