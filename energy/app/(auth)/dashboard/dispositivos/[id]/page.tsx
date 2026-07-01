'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '../../layout';
import api from '@/lib/api';
import type { Dispositivo, Medicion, EstadisticasDispositivo, ConsumoMesActual, HistorialMensual } from '@/lib/types';
import {
  StatCardPremium,
  ChartWrapper,
  PowerRealtimeChart,
  GaugePremium,
  ConsumptionBarChart,
  TARIFA_ELECTROSUR,
} from '@/components/dashboard';
import {
  ArrowLeft,
  Power,
  Zap,
  Activity,
  Gauge,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  Clock,
  Cpu,
  Settings,
  RefreshCw,
  MapPin,
  Edit3,
  Calendar,
  History,
} from 'lucide-react';
import PersonalizarDispositivoModal from '@/components/PersonalizarDispositivoModal';

export default function DispositivoPage() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDashboard();
  const router = useRouter();
  const params = useParams();
  const dispositivoId = Number(params.id);

  const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasDispositivo | null>(null);
  const [consumoMes, setConsumoMes] = useState<ConsumoMesActual | null>(null);
  const [historialMensual, setHistorialMensual] = useState<HistorialMensual | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState('');
  const [showPersonalizarModal, setShowPersonalizarModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [historialFilter, setHistorialFilter] = useState<'all' | '3m' | '6m' | '12m'>('6m');

  // Fetch completo (carga inicial y cada 30s para historial/estadísticas)
  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError('');
      
      const [statusData, statsData, medicionesResponse, consumoMesData, historialData] = await Promise.all([
        api.getEstadoDispositivo(dispositivoId),
        api.getEstadisticas(dispositivoId),
        api.getMediciones(dispositivoId, { limit: 100 }),
        api.getConsumoMesActual(dispositivoId),
        api.getHistorialMensual(dispositivoId, 12), // Últimos 12 meses para filtros
      ]);

      setDispositivo(statusData as unknown as Dispositivo);
      setEstadisticas(statsData);
      setMediciones(medicionesResponse.data.reverse());
      setConsumoMes(consumoMesData);
      setHistorialMensual(historialData);
    } catch (err) {
      console.error('Error fetching device data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dispositivoId]);

  // Fetch rápido solo para datos en tiempo real (cada 2 segundos)
  const fetchRealtimeData = useCallback(async () => {
    try {
      const [statusData, statsData, medicionesResponse] = await Promise.all([
        api.getEstadoDispositivo(dispositivoId),
        api.getEstadisticas(dispositivoId),
        api.getMediciones(dispositivoId, { limit: 100 }),
      ]);
      setDispositivo(statusData as unknown as Dispositivo);
      setEstadisticas(statsData);
      setMediciones(medicionesResponse.data.reverse());
    } catch (err) {
      console.error('Error fetching realtime data:', err);
    }
  }, [dispositivoId]);

  useEffect(() => {
    if (isAuthenticated && dispositivoId) {
      fetchData();
      // Actualización de datos en tiempo real cada 2 segundos (potencia, voltaje, corriente, gauges, gráfico)
      const realtimeInterval = setInterval(fetchRealtimeData, 2000); // 2 segundos para datos en tiempo real
      // Actualización completa cada 30 segundos para estadísticas e historial mensual
      const fullInterval = setInterval(() => fetchData(true), 30000); // 30 segundos
      return () => {
        clearInterval(realtimeInterval);
        clearInterval(fullInterval);
      };
    }
  }, [isAuthenticated, dispositivoId, fetchData, fetchRealtimeData]);

  const handleToggle = async () => {
    if (!dispositivo) return;

    try {
      setIsToggling(true);
      if (dispositivo.estadoActual === 'ON') {
        await api.apagarDispositivo(dispositivoId);
      } else {
        await api.encenderDispositivo(dispositivoId);
      }
      await fetchData(true);
    } catch (err) {
      console.error('Error toggling device:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handlePersonalizarSuccess = (updatedDispositivo: Dispositivo) => {
    setDispositivo(updatedDispositivo);
    setShowPersonalizarModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Cargando dispositivo...</p>
        </div>
      </div>
    );
  }

  if (error || !dispositivo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`text-center p-8 rounded-2xl max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-red-500" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Error al cargar dispositivo
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {error || 'Dispositivo no encontrado'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const ultimaMedicion = estadisticas?.ultimaMedicion || mediciones[mediciones.length - 1];
  const consumoTotal = estadisticas ? (estadisticas.promedios.potenciaWatts * estadisticas.totalMediciones / 1000) : 0;
  
  // Usar costo REAL del mes si está disponible
  const costoMensualReal = consumoMes?.costoSoles || 0;
  const kwhMesActual = consumoMes?.consumoKwh || 0;
  const diaActual = consumoMes?.diaActual || new Date().getDate();
  const nombreMes = consumoMes?.nombreMes || '';
  const esMesActual = consumoMes?.mesActual ?? true;
  const diasConDatos = consumoMes?.diasConDatos || 0;
  
  const isOn = dispositivo.estadoActual === 'ON';
  const displayName = dispositivo.nombrePersonalizado || dispositivo.nombre;

  // Datos para el gráfico de barras (últimos 7 días simulados)
  const consumoBarData = mediciones.slice(-7).map((m, i) => ({
    day: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i % 7],
    consumo: m.potenciaWatts / 1000 * 24, // kWh por día estimado
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className={`p-3 rounded-xl transition-all ${isDarkMode 
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' 
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {displayName}
              </motion.h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isOn 
                  ? 'bg-green-100 text-green-700' 
                  : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}>
                {isOn ? 'Encendido' : 'Apagado'}
              </span>
            </div>
            <div className={`flex items-center gap-2 mt-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Cpu size={14} />
              <span className="font-mono">{dispositivo.serialUnico}</span>
              {dispositivo.ubicacion && (
                <>
                  <span>•</span>
                  <MapPin size={14} />
                  <span>{dispositivo.ubicacion}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className={`p-3 rounded-xl transition-all ${isDarkMode 
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' 
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'}`}
            title="Actualizar datos"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowInfoModal(true)}
            className={`p-3 rounded-xl transition-all ${isDarkMode 
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' 
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'}`}
            title="Información del dispositivo"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setShowPersonalizarModal(true)}
            className={`p-3 rounded-xl transition-all ${isDarkMode 
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' 
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'}`}
            title="Personalizar"
          >
            <Edit3 size={20} />
          </button>
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
              isOn
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
            } disabled:opacity-50`}
          >
            {isToggling ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Power size={18} />
                <span>{isOn ? 'Apagar' : 'Encender'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardPremium
          title="Potencia Actual"
          value={`${(ultimaMedicion?.potenciaWatts || 0).toFixed(0)} W`}
          subtitle="En tiempo real"
          icon={<Zap size={24} />}
          accentColor="blue"
          isDarkMode={isDarkMode}
        />
        <StatCardPremium
          title="Voltaje"
          value={`${(ultimaMedicion?.voltaje || 0).toFixed(1)} V`}
          subtitle="220V nominal"
          icon={<Activity size={24} />}
          accentColor="green"
          isDarkMode={isDarkMode}
        />
        <StatCardPremium
          title="Corriente"
          value={`${(ultimaMedicion?.amperaje || 0).toFixed(2)} A`}
          subtitle="Consumo actual"
          icon={<Gauge size={24} />}
          accentColor="orange"
          isDarkMode={isDarkMode}
        />
        <StatCardPremium
          title={`Costo ${nombreMes} (Día ${diaActual})`}
          value={`S/ ${costoMensualReal.toFixed(2)}`}
          subtitle={`${kwhMesActual.toFixed(2)} kWh consumidos`}
          icon={<Wallet size={24} />}
          accentColor="purple"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Botón para ver Historial de Consumo */}
      {historialMensual && historialMensual.historial.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => setShowHistorialModal(true)}
            className={`w-full p-4 rounded-2xl border flex items-center justify-between group transition-all hover:shadow-lg ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' 
                : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <History size={24} />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Historial de Consumo Mensual
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ver últimos {historialMensual.resumen.mesesAnalizados} meses • Total: S/ {historialMensual.resumen.totalSoles.toFixed(2)}
                </p>
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-transform group-hover:translate-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </button>
        </motion.div>
      )}

      {/* Gauges Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartWrapper title="Medidor de Voltaje" subtitle="Rango: 0-300V" isDarkMode={isDarkMode}>
          <GaugePremium
            value={ultimaMedicion?.voltaje || 0}
            max={300}
            unit="V"
            title="Voltaje"
            color="#10B981"
            isDarkMode={isDarkMode}
          />
        </ChartWrapper>
        <ChartWrapper title="Medidor de Potencia" subtitle="Rango: 0-5000W" isDarkMode={isDarkMode}>
          <GaugePremium
            value={ultimaMedicion?.potenciaWatts || 0}
            max={5000}
            unit="W"
            title="Potencia"
            color="#3B82F6"
            isDarkMode={isDarkMode}
          />
        </ChartWrapper>
        <ChartWrapper title="Medidor de Corriente" subtitle="Rango: 0-30A" isDarkMode={isDarkMode}>
          <GaugePremium
            value={ultimaMedicion?.amperaje || 0}
            max={30}
            unit="A"
            title="Corriente"
            color="#F59E0B"
            isDarkMode={isDarkMode}
          />
        </ChartWrapper>
      </div>

      {/* Charts Section */}
      {mediciones.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <ChartWrapper 
            title="Potencia en Tiempo Real" 
            subtitle={`Últimas ${mediciones.length} mediciones`}
            isDarkMode={isDarkMode}
          >
            <PowerRealtimeChart 
              mediciones={mediciones} 
              height={320}
              isDarkMode={isDarkMode}
            />
          </ChartWrapper>
        </div>
      )}

      {/* Statistics - Botón para abrir modal */}
      {estadisticas && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowStatsModal(true)}
            className={`w-full p-4 rounded-2xl border flex items-center justify-between group transition-all hover:shadow-lg ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' 
                : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <BarChart3 size={24} />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Estadísticas Detalladas
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Promedio: {estadisticas.promedios.potenciaWatts.toFixed(1)}W • Máx: {estadisticas.maximos.potenciaWatts.toFixed(1)}W • {estadisticas.totalMediciones} mediciones
                </p>
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-transform group-hover:translate-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </button>
        </motion.div>
      )}

      {/* Personalizar Modal */}
      {showPersonalizarModal && dispositivo && (
        <PersonalizarDispositivoModal
          dispositivo={dispositivo}
          isOpen={showPersonalizarModal}
          onClose={() => setShowPersonalizarModal(false)}
          onSuccess={handlePersonalizarSuccess}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Modal Estadísticas Detalladas */}
      {showStatsModal && estadisticas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowStatsModal(false)}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <BarChart3 size={24} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Estadísticas Detalladas
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dispositivo?.nombrePersonalizado || dispositivo?.nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Potencia Promedio */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                      <BarChart3 size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Potencia Promedio</span>
                  </div>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {estadisticas.promedios.potenciaWatts.toFixed(1)} <span className="text-lg font-normal">W</span>
                  </p>
                </div>

                {/* Potencia Máxima */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
                      <TrendingUp size={16} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Potencia Máxima</span>
                  </div>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {estadisticas.maximos.potenciaWatts.toFixed(1)} <span className="text-lg font-normal">W</span>
                  </p>
                </div>

                {/* Potencia Mínima */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                      <TrendingDown size={16} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Potencia Mínima</span>
                  </div>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {estadisticas.minimos.potenciaWatts.toFixed(1)} <span className="text-lg font-normal">W</span>
                  </p>
                </div>

                {/* Total Mediciones */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                      <Clock size={16} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Mediciones</span>
                  </div>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {estadisticas.totalMediciones}
                  </p>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Detalles Adicionales
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Voltaje Promedio</p>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticas.promedios.voltaje.toFixed(1)} V
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Corriente Promedio</p>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticas.promedios.amperaje.toFixed(2)} A
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Última Medición</p>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticas.ultimaMedicion ? new Date(estadisticas.ultimaMedicion.fechaRegistro).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Historial con Filtros */}
      {showHistorialModal && historialMensual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHistorialModal(false)}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            {/* Header con Filtros */}
            <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                    <History size={24} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Historial de Consumo
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dispositivo?.nombrePersonalizado || dispositivo?.nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistorialModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* Filtros */}
              <div className="flex gap-2">
                {[
                  { key: '3m', label: '3 meses' },
                  { key: '6m', label: '6 meses' },
                  { key: '12m', label: '12 meses' },
                  { key: 'all', label: 'Todo' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setHistorialFilter(filter.key as typeof historialFilter)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      historialFilter === filter.key
                        ? isDarkMode 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-purple-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
              {/* Resumen Cards */}
              {(() => {
                const filteredData = historialMensual.historial.filter((_, i) => {
                  if (historialFilter === 'all') return true;
                  if (historialFilter === '3m') return i < 3;
                  if (historialFilter === '6m') return i < 6;
                  return i < 12;
                });
                const totalKwh = filteredData.reduce((sum, m) => sum + m.consumoKwh, 0);
                const totalSoles = filteredData.reduce((sum, m) => sum + m.costoSoles, 0);
                
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Consumido</p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {totalKwh.toFixed(2)} kWh
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Pagado</p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          S/ {totalSoles.toFixed(2)}
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Promedio/Mes</p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                          {(totalKwh / (filteredData.length || 1)).toFixed(2)} kWh
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Meses</p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          {filteredData.length}
                        </p>
                      </div>
                    </div>

                    {/* Tabla */}
                    <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                      <table className="w-full">
                        <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                          <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <th className="px-4 py-3">Mes</th>
                            <th className="px-4 py-3 text-right">Consumo</th>
                            <th className="px-4 py-3 text-right">Costo</th>
                            <th className="px-4 py-3 text-right">Mediciones</th>
                            <th className="px-4 py-3 text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                          {filteredData.map((mes) => (
                            <tr key={`${mes.anio}-${mes.mes}`} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Calendar size={16} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                  <span className={`font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {mes.nombreMes} {mes.anio}
                                  </span>
                                </div>
                              </td>
                              <td className={`px-4 py-4 text-right font-medium ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                {mes.consumoKwh.toFixed(2)} kWh
                              </td>
                              <td className={`px-4 py-4 text-right font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                S/ {mes.costoSoles.toFixed(2)}
                              </td>
                              <td className={`px-4 py-4 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {mes.totalMediciones}
                              </td>
                              <td className="px-4 py-4 text-right">
                                {mes.esActual ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    En curso
                                  </span>
                                ) : mes.totalMediciones > 0 ? (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                    ✓
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                    -
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}

              {/* Info de tarifa */}
              <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                <Zap size={16} />
                <span>Tarifa Electrosur: S/ {TARIFA_ELECTROSUR}/kWh</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Info Dispositivo */}
      {showInfoModal && dispositivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInfoModal(false)}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-50'}`}>
                    <Cpu size={24} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                  </div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información del Dispositivo
                  </h2>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              {/* ID */}
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <BarChart3 size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID</span>
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dispositivo.id}</span>
              </div>

              {/* Nombre Original */}
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <Cpu size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre Original</span>
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dispositivo.nombre}</span>
              </div>

              {/* Nombre Personalizado */}
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                    <Edit3 size={16} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre Personalizado</span>
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dispositivo.nombrePersonalizado || 'No asignado'}
                </span>
              </div>

              {/* Serial */}
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-100'}`}>
                    <Activity size={16} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Serial</span>
                </div>
                <span className={`font-mono text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dispositivo.serialUnico}</span>
              </div>

              {/* Tipo de Objeto */}
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                    <Settings size={16} className={isDarkMode ? 'text-orange-400' : 'text-orange-600'} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tipo de Objeto</span>
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dispositivo.tipoObjeto || 'No especificado'}
                </span>
              </div>

              {/* Ubicación */}
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <MapPin size={16} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ubicación</span>
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dispositivo.ubicacion || 'No especificada'}
                </span>
              </div>

              {/* Estado */}
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isOn ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-100') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')}`}>
                    <Power size={16} className={isOn ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado Actual</span>
                </div>
                <span className={`font-semibold ${isOn ? 'text-green-500' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                  {isOn ? 'Encendido' : 'Apagado'}
                </span>
              </div>

              {/* Consumo */}
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                    <Zap size={16} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Consumo Acumulado</span>
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  {consumoTotal.toFixed(3)} kWh
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  setShowPersonalizarModal(true);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Edit3 size={18} />
                Personalizar Dispositivo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
