'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from './layout';
import api from '@/lib/api';
import type { Dispositivo, EstadisticasDispositivo, ConsumoMesActual, ConsumoReal, HistorialMensual, ConsumoMensual } from '@/lib/types';
import { 
  StatCardPremium, 
  DeviceCardPremium, 
  EmptyState, 
  QuickStatsBar,
  ChartWrapper,
  PowerRealtimeChart,
  ConsumptionPieChart,
  TARIFA_ELECTROSUR
} from '@/components/dashboard';
import { 
  Zap, 
  Cpu, 
  Activity, 
  TrendingUp, 
  Plus,
  RefreshCw,
  Clock,
  Wallet,
  PlugZap,
  X,
  Calendar,
  ChevronDown,
  Target
} from 'lucide-react';
import { AlertSystem } from '@/components/AlertSystem';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useDashboard();
  const router = useRouter();
  
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [estadisticas, setEstadisticas] = useState<Map<number, EstadisticasDispositivo>>(new Map());
  const [consumosMes, setConsumosMes] = useState<Map<number, ConsumoMesActual>>(new Map());
  const [consumosReal, setConsumosReal] = useState<Map<number, ConsumoReal>>(new Map());
  const [historialTotal, setHistorialTotal] = useState<ConsumoMensual[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('actual'); // 'actual' o 'YYYY-MM'
  const [showMesDropdown, setShowMesDropdown] = useState(false);
  const [allMediciones, setAllMediciones] = useState<{ dispositivoId: number; mediciones: any[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptSerial, setAdoptSerial] = useState('');
  const [adoptError, setAdoptError] = useState('');
  const [adoptLoading, setAdoptLoading] = useState(false);

  // Redirigir admins
  useEffect(() => {
    if (isAuthenticated && user?.rol?.toUpperCase() === 'ADMIN') {
      router.replace('/dashboard/admin');
    }
  }, [isAuthenticated, user, router]);

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      
      const devicesData = await api.getDispositivos();
      setDispositivos(devicesData);

      // Obtener estadísticas, consumo del mes, consumo real, historial y mediciones de cada dispositivo
      const statsMap = new Map<number, EstadisticasDispositivo>();
      const consumosMap = new Map<number, ConsumoMesActual>();
      const consumosRealMap = new Map<number, ConsumoReal>();
      const medicionesArray: { dispositivoId: number; mediciones: any[] }[] = [];
      const historialesArray: HistorialMensual[] = [];
      
      await Promise.all(
        devicesData.map(async (d) => {
          try {
            const [stats, consumoMes, consumoReal, historial, medicionesRes] = await Promise.all([
              api.getEstadisticas(d.id),
              api.getConsumoMesActual(d.id),
              api.getConsumoReal(d.id, 30), // Últimos 30 días para las tarjetas
              api.getHistorialMensual(d.id, 12),
              api.getMediciones(d.id, { limit: 30 })
            ]);
            statsMap.set(d.id, stats);
            consumosMap.set(d.id, consumoMes);
            consumosRealMap.set(d.id, consumoReal);
            historialesArray.push(historial);
            medicionesArray.push({ 
              dispositivoId: d.id, 
              mediciones: medicionesRes.data.reverse() 
            });
          } catch {
            // Dispositivo sin mediciones
          }
        })
      );
      setEstadisticas(statsMap);
      setConsumosMes(consumosMap);
      setConsumosReal(consumosRealMap);
      
      // Combinar historiales de todos los dispositivos por mes
      const historialCombinado: Record<string, ConsumoMensual> = {};
      historialesArray.forEach(h => {
        h.historial.forEach(mes => {
          const key = `${mes.anio}-${String(mes.mes).padStart(2, '0')}`;
          if (!historialCombinado[key]) {
            historialCombinado[key] = { ...mes, consumoKwh: 0, costoSoles: 0, totalMediciones: 0, horasMonitoreadas: 0 };
          }
          historialCombinado[key].consumoKwh += mes.consumoKwh;
          historialCombinado[key].costoSoles += mes.costoSoles;
          historialCombinado[key].totalMediciones += mes.totalMediciones;
          historialCombinado[key].horasMonitoreadas += mes.horasMonitoreadas;
        });
      });
      setHistorialTotal(Object.values(historialCombinado).sort((a, b) => {
        if (a.anio !== b.anio) return b.anio - a.anio;
        return b.mes - a.mes;
      }));
      
      setAllMediciones(medicionesArray);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.rol !== 'ADMIN') {
      fetchData();
      // Auto-refresh cada 5 segundos para sincronizar con ESP32
      const interval = setInterval(() => fetchData(true), 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, fetchData]);

  const handleAdopt = async () => {
    if (!adoptSerial.trim()) {
      setAdoptError('Ingresa el Serial del dispositivo');
      return;
    }

    try {
      setAdoptError('');
      setAdoptLoading(true);
      await api.adoptarDispositivo({ serialUnico: adoptSerial });
      setShowAdoptModal(false);
      setAdoptSerial('');
      fetchData();
    } catch (err) {
      setAdoptError(err instanceof Error ? err.message : 'Error al adoptar dispositivo');
    } finally {
      setAdoptLoading(false);
    }
  };

  // Calcular estadísticas totales - POTENCIA EN TIEMPO REAL
  const totalPotencia = Array.from(estadisticas.values()).reduce(
    (acc, stats) => acc + (stats.ultimaMedicion?.potenciaWatts || 0),
    0
  );
  
  // Potencia promedio y máxima del período
  const potenciaPromedio = Array.from(estadisticas.values()).reduce(
    (acc, stats) => acc + (stats.promedios?.potenciaWatts || 0),
    0
  );
  const potenciaMaxima = Array.from(estadisticas.values()).reduce(
    (acc, stats) => acc + (stats.maximos?.potenciaWatts || 0),
    0
  );

  // Datos del mes seleccionado
  const datosMesSeleccionado = (() => {
    if (mesSeleccionado === 'actual') {
      // Mes actual: sumar consumos actuales de todos los dispositivos
      const consumoKwh = Array.from(consumosMes.values()).reduce(
        (acc, c) => acc + (c.consumoKwh || 0), 0
      );
      const costoSoles = Array.from(consumosMes.values()).reduce(
        (acc, c) => acc + (c.costoSoles || 0), 0
      );
      const primerConsumo = Array.from(consumosMes.values())[0];
      const proyeccionKwh = Array.from(consumosMes.values()).reduce(
        (acc, c) => acc + (c.proyeccion?.kwhEstimado || 0), 0
      );
      const proyeccionCosto = Array.from(consumosMes.values()).reduce(
        (acc, c) => acc + (c.proyeccion?.costoEstimado || 0), 0
      );
      return {
        nombreMes: primerConsumo?.nombreMes || new Date().toLocaleDateString('es-PE', { month: 'long' }),
        anio: new Date().getFullYear(),
        consumoKwh,
        costoSoles,
        diaActual: primerConsumo?.diaActual || new Date().getDate(),
        diasEnMes: primerConsumo?.diasEnMes || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
        esActual: true,
        proyeccionKwh,
        proyeccionCosto,
      };
    } else {
      // Mes del historial
      const mesHist = historialTotal.find(h => `${h.anio}-${String(h.mes).padStart(2, '0')}` === mesSeleccionado);
      if (mesHist) {
        return {
          nombreMes: mesHist.nombreMes,
          anio: mesHist.anio,
          consumoKwh: mesHist.consumoKwh,
          costoSoles: mesHist.costoSoles,
          diaActual: null,
          diasEnMes: null,
          esActual: false,
          proyeccionKwh: null,
          proyeccionCosto: null,
        };
      }
      return null;
    }
  })();

  const dispositivosActivos = dispositivos.filter(d => d.estadoActual === 'ON').length;
  
  // Lista de meses disponibles para el dropdown
  const mesesDisponibles = [
    { value: 'actual', label: `${datosMesSeleccionado?.nombreMes || 'Actual'} ${new Date().getFullYear()} (actual)` },
    ...historialTotal
      .filter(h => !h.esActual)
      .map(h => ({
        value: `${h.anio}-${String(h.mes).padStart(2, '0')}`,
        label: `${h.nombreMes.charAt(0).toUpperCase() + h.nombreMes.slice(1)} ${h.anio}`
      }))
  ];

  // Datos para el pie chart - Distribución de potencia por dispositivo activo
  const pieChartData = dispositivos
    .filter(d => d.estadoActual === 'ON')
    .map(d => {
      const stats = estadisticas.get(d.id);
      return {
        name: d.nombrePersonalizado || d.nombre,
        value: stats?.ultimaMedicion?.potenciaWatts || 0,
      };
    })
    .filter(d => d.value > 0);

  // GRÁFICO GENERAL DEL HOGAR: Sumar mediciones de todos los dispositivos por timestamp
  // Agrupa mediciones cercanas en el tiempo y suma potencia/corriente, promedia voltaje
  const medicionesTotalesHogar = (() => {
    // Obtener todas las mediciones de todos los dispositivos
    const todasMediciones = allMediciones.flatMap(m => m.mediciones);
    
    if (todasMediciones.length === 0) return [];
    
    // Agrupar por minuto (timestamp redondeado)
    const agrupadas: Record<string, { 
      potenciaTotal: number; 
      corrienteTotal: number; 
      voltajeSum: number; 
      count: number;
      fecha: Date;
    }> = {};
    
    todasMediciones.forEach(m => {
      const fecha = new Date(m.fechaRegistro);
      // Redondear al minuto para agrupar mediciones cercanas
      fecha.setSeconds(0, 0);
      const key = fecha.toISOString();
      
      if (!agrupadas[key]) {
        agrupadas[key] = { 
          potenciaTotal: 0, 
          corrienteTotal: 0, 
          voltajeSum: 0, 
          count: 0,
          fecha 
        };
      }
      
      agrupadas[key].potenciaTotal += m.potenciaWatts || 0;
      agrupadas[key].corrienteTotal += m.amperaje || 0;
      agrupadas[key].voltajeSum += m.voltaje || 0;
      agrupadas[key].count += 1;
    });
    
    // Convertir a array y ordenar por fecha
    return Object.values(agrupadas)
      .map(g => ({
        fechaRegistro: g.fecha.toISOString(),
        potenciaWatts: g.potenciaTotal,
        amperaje: g.corrienteTotal,
        voltaje: g.voltajeSum / g.count, // Voltaje promedio (debería ser similar ~220V)
      }))
      .sort((a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime())
      .slice(-50); // Últimos 50 puntos
  })();

  // Fecha actual
  const today = new Date().toLocaleDateString('es-PE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            ¡Hola! 👋
          </motion.h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {today}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sistema de Alertas ML */}
          <AlertSystem />
          
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className={`p-3 rounded-xl transition-all ${isDarkMode 
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' 
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'}`}
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAdoptModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Agregar Dispositivo</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <QuickStatsBar
        isDarkMode={isDarkMode}
        stats={[
          { label: 'Potencia Total', value: `${totalPotencia.toFixed(0)} W`, icon: <Zap size={18} /> },
          { label: 'Dispositivos Activos', value: `${dispositivosActivos}/${dispositivos.length}`, icon: <PlugZap size={18} /> },
          { label: 'Tarifa Electrosur', value: `S/ ${TARIFA_ELECTROSUR}/kWh`, icon: <Wallet size={18} /> },
          { label: 'Última actualización', value: 'Ahora', icon: <Clock size={18} /> },
        ]}
      />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardPremium
          title="Dispositivos"
          value={dispositivos.length}
          subtitle={`${dispositivosActivos} activos`}
          icon={<Cpu size={24} />}
          accentColor="blue"
          isDarkMode={isDarkMode}
        />
        <StatCardPremium
          title="Potencia Actual"
          value={`${totalPotencia.toFixed(0)} W`}
          subtitle={`Prom: ${potenciaPromedio.toFixed(0)}W • Máx: ${potenciaMaxima.toFixed(0)}W`}
          icon={<Activity size={24} />}
          accentColor="green"
          isDarkMode={isDarkMode}
        />
        
        {/* Consumo con selector de mes */}
        <div className="relative">
          <StatCardPremium
            title={`Consumo ${datosMesSeleccionado?.nombreMes || ''}`}
            value={`${(datosMesSeleccionado?.consumoKwh || 0).toFixed(3)} kWh`}
            subtitle={datosMesSeleccionado?.esActual 
              ? `Día ${datosMesSeleccionado.diaActual} de ${datosMesSeleccionado.diasEnMes}` 
              : `${datosMesSeleccionado?.anio || ''} • Mes completo`}
            icon={<TrendingUp size={24} />}
            accentColor="orange"
            isDarkMode={isDarkMode}
          />
          {/* Botón selector de mes */}
          <button
            onClick={() => setShowMesDropdown(!showMesDropdown)}
            className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all z-10 ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <Calendar size={16} />
          </button>
          
          {/* Dropdown de meses */}
          <AnimatePresence>
            {showMesDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl border z-20 max-h-60 overflow-y-auto ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {mesesDisponibles.map((mes) => (
                  <button
                    key={mes.value}
                    onClick={() => {
                      setMesSeleccionado(mes.value);
                      setShowMesDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                      mesSeleccionado === mes.value
                        ? isDarkMode 
                          ? 'bg-orange-500/20 text-orange-400' 
                          : 'bg-orange-50 text-orange-600'
                        : isDarkMode
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {mes.label}
                    {mesSeleccionado === mes.value && <span>✓</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Costo del mes seleccionado */}
        <StatCardPremium
          title={`Costo ${datosMesSeleccionado?.nombreMes || ''}`}
          value={`S/ ${(datosMesSeleccionado?.costoSoles || 0).toFixed(2)}`}
          subtitle={datosMesSeleccionado?.esActual 
            ? `Tarifa: S/ ${TARIFA_ELECTROSUR}/kWh` 
            : `${datosMesSeleccionado?.anio || ''} • Total pagado`}
          icon={<Wallet size={24} />}
          accentColor="purple"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Proyección a fin de mes (solo si es mes actual) */}
      {datosMesSeleccionado?.esActual && datosMesSeleccionado.proyeccionKwh && datosMesSeleccionado.proyeccionKwh > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center justify-between ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/20' 
              : 'bg-gradient-to-r from-purple-50 to-orange-50 border-purple-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Target size={20} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Proyección a fin de mes
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Basado en tu consumo actual
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              S/ {datosMesSeleccionado.proyeccionCosto?.toFixed(2)}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              ~{datosMesSeleccionado.proyeccionKwh?.toFixed(2)} kWh estimados
            </p>
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      {medicionesTotalesHogar.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartWrapper 
            title="Consumo Total del Hogar"
            subtitle={`Suma de ${dispositivos.length} dispositivos • Potencia, Corriente y Voltaje`}
            isDarkMode={isDarkMode}
            className="lg:col-span-2"
          >
            <PowerRealtimeChart 
              mediciones={medicionesTotalesHogar} 
              height={320}
              isDarkMode={isDarkMode}
            />
          </ChartWrapper>
          
          <ChartWrapper 
            title="Distribución de Consumo" 
            subtitle="Por dispositivo activo"
            isDarkMode={isDarkMode}
          >
            {pieChartData.length > 0 ? (
              <ConsumptionPieChart 
                data={pieChartData}
                height={320}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className={`flex items-center justify-center h-[320px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Sin dispositivos activos
              </div>
            )}
          </ChartWrapper>
        </div>
      )}

      {/* Devices Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Mis Dispositivos
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Monitorea y controla tus equipos
            </p>
          </div>
        </div>

        {dispositivos.length === 0 ? (
          <EmptyState
            icon={<Cpu size={40} />}
            title="No tienes dispositivos"
            description="Agrega tu primer dispositivo ESP32 para comenzar a monitorear el consumo energético de tu hogar"
            action={{
              label: 'Agregar Dispositivo',
              onClick: () => setShowAdoptModal(true)
            }}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dispositivos.map((dispositivo, index) => {
              const stats = estadisticas.get(dispositivo.id);
              const consumoMes = consumosMes.get(dispositivo.id);
              const consumoReal30d = consumosReal.get(dispositivo.id);
              // Usar consumo del mes actual, pero si no hay datos usar últimos 30 días como fallback
              const consumoFinal = (consumoMes?.consumoKwh || 0) > 0 ? consumoMes : consumoReal30d;
              const esMesActual = (consumoMes?.consumoKwh || 0) > 0;
              return (
                <motion.div
                  key={dispositivo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DeviceCardPremium
                    id={dispositivo.id}
                    nombre={dispositivo.nombre}
                    nombrePersonalizado={dispositivo.nombrePersonalizado}
                    tipoObjeto={dispositivo.tipoObjeto}
                    ubicacion={dispositivo.ubicacion}
                    estado={dispositivo.estadoActual}
                    potenciaActual={stats?.ultimaMedicion?.potenciaWatts || 0}
                    consumoKwh={consumoFinal?.consumoKwh}
                    costoReal={consumoFinal?.costoSoles}
                    periodoLabel={esMesActual ? undefined : '30 días'}
                    onClick={() => router.push(`/dashboard/dispositivos/${dispositivo.id}`)}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Adopt Device Modal */}
      <AnimatePresence>
        {showAdoptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAdoptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between
                ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Plus size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Agregar Dispositivo
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Vincula un nuevo ESP32
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdoptModal(false)}
                  className={`p-2 rounded-lg transition-colors
                    ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {adoptError && (
                  <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-4 border border-red-100">
                    {adoptError}
                  </div>
                )}

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Serial del dispositivo
                  </label>
                  <input
                    type="text"
                    placeholder="ESP32-SALA-001"
                    value={adoptSerial}
                    onChange={(e) => setAdoptSerial(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-all
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                  />
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Ingresa el serial único que aparece en tu dispositivo ESP32
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAdoptModal(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all
                      ${isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAdopt}
                    disabled={adoptLoading}
                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {adoptLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <PlugZap size={18} />
                        Vincular
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
