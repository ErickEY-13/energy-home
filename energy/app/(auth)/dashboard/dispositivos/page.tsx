'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '../layout';
import api from '@/lib/api';
import type { Dispositivo, EstadisticasDispositivo, ConsumoReal } from '@/lib/types';
import { 
  DeviceCardPremium, 
  EmptyState,
  calcularCostoElectrosur 
} from '@/components/dashboard';
import { 
  Cpu, 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  RefreshCw,
  PlugZap,
  X,
  SortAsc,
  SortDesc,
  Zap,
  Power
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortBy = 'nombre' | 'estado' | 'potencia' | 'fecha';
type FilterBy = 'todos' | 'encendidos' | 'apagados';

export default function DispositivosPage() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDashboard();
  const router = useRouter();

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [estadisticas, setEstadisticas] = useState<Map<number, EstadisticasDispositivo>>(new Map());
  const [consumoReal, setConsumoReal] = useState<Map<number, ConsumoReal>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('nombre');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterBy, setFilterBy] = useState<FilterBy>('todos');
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptSerial, setAdoptSerial] = useState('');
  const [adoptError, setAdoptError] = useState('');
  const [adoptLoading, setAdoptLoading] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const devicesData = await api.getDispositivos();
      setDispositivos(devicesData);

      const statsMap = new Map<number, EstadisticasDispositivo>();
      const consumoMap = new Map<number, ConsumoReal>();
      
      await Promise.all(
        devicesData.map(async (d) => {
          try {
            // Obtener estadísticas y consumo real en paralelo
            const [stats, consumo] = await Promise.all([
              api.getEstadisticas(d.id),
              api.getConsumoReal(d.id, 30) // Últimos 30 días
            ]);
            statsMap.set(d.id, stats);
            consumoMap.set(d.id, consumo);
          } catch {
            // Sin mediciones
          }
        })
      );
      setEstadisticas(statsMap);
      setConsumoReal(consumoMap);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

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

  // Filtrar y ordenar dispositivos
  const filteredDevices = dispositivos
    .filter((d) => {
      // Search filter
      const name = (d.nombrePersonalizado || d.nombre).toLowerCase();
      const serial = d.serialUnico.toLowerCase();
      const query = searchQuery.toLowerCase();
      if (query && !name.includes(query) && !serial.includes(query)) {
        return false;
      }
      // Status filter
      if (filterBy === 'encendidos' && d.estadoActual !== 'ON') return false;
      if (filterBy === 'apagados' && d.estadoActual !== 'OFF') return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'nombre':
          comparison = (a.nombrePersonalizado || a.nombre).localeCompare(b.nombrePersonalizado || b.nombre);
          break;
        case 'estado':
          comparison = a.estadoActual.localeCompare(b.estadoActual);
          break;
        case 'potencia':
          const potA = estadisticas.get(a.id)?.ultimaMedicion?.potenciaWatts || 0;
          const potB = estadisticas.get(b.id)?.ultimaMedicion?.potenciaWatts || 0;
          comparison = potA - potB;
          break;
        case 'fecha':
          comparison = a.id - b.id;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

  const encendidos = dispositivos.filter(d => d.estadoActual === 'ON').length;
  const apagados = dispositivos.filter(d => d.estadoActual === 'OFF').length;
  const totalPotencia = Array.from(estadisticas.values()).reduce(
    (acc, stats) => acc + (stats.ultimaMedicion?.potenciaWatts || 0), 0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Cargando dispositivos...</p>
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
            Mis Dispositivos
          </motion.h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Gestiona y monitorea todos tus equipos conectados
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: dispositivos.length, icon: <Cpu size={18} />, color: 'blue' },
          { label: 'Encendidos', value: encendidos, icon: <Power size={18} />, color: 'green' },
          { label: 'Apagados', value: apagados, icon: <Power size={18} />, color: 'gray' },
          { label: 'Potencia Total', value: `${totalPotencia.toFixed(0)} W`, icon: <Zap size={18} />, color: 'orange' },
        ].map((stat, i) => (
          <div 
            key={i}
            className={`p-4 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stat.color === 'blue' ? (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600') :
              stat.color === 'green' ? (isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-600') :
              stat.color === 'orange' ? (isDarkMode ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-50 text-orange-600') :
              (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')
            }`}>
              {stat.icon}
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className={`p-4 rounded-xl flex flex-col lg:flex-row gap-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Buscar por nombre o serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg transition-all
              ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'} border`}
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className={`px-3 py-2.5 rounded-lg border ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-200 text-gray-900'}`}
          >
            <option value="todos">Todos</option>
            <option value="encendidos">Encendidos</option>
            <option value="apagados">Apagados</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className={`px-3 py-2.5 rounded-lg border ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-200 text-gray-900'}`}
          >
            <option value="nombre">Nombre</option>
            <option value="estado">Estado</option>
            <option value="potencia">Potencia</option>
            <option value="fecha">Fecha</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className={`p-2.5 rounded-lg border ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-gray-50 border-gray-200 text-gray-600'}`}
          >
            {sortAsc ? <SortAsc size={18} /> : <SortDesc size={18} />}
          </button>
        </div>

        {/* View Mode */}
        <div className={`flex rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 ${viewMode === 'grid' 
              ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900')
              : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500')}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 ${viewMode === 'list' 
              ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900')
              : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500')}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Devices */}
      {filteredDevices.length === 0 ? (
        <EmptyState
          icon={<Cpu size={40} />}
          title={searchQuery || filterBy !== 'todos' ? 'Sin resultados' : 'No tienes dispositivos'}
          description={
            searchQuery || filterBy !== 'todos' 
              ? 'No se encontraron dispositivos con los filtros aplicados' 
              : 'Agrega tu primer dispositivo ESP32 para comenzar'
          }
          action={
            !searchQuery && filterBy === 'todos' 
              ? { label: 'Agregar Dispositivo', onClick: () => setShowAdoptModal(true) }
              : undefined
          }
          isDarkMode={isDarkMode}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((dispositivo, index) => {
            const stats = estadisticas.get(dispositivo.id);
            const consumo = consumoReal.get(dispositivo.id);
            return (
              <motion.div
                key={dispositivo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DeviceCardPremium
                  id={dispositivo.id}
                  nombre={dispositivo.nombre}
                  nombrePersonalizado={dispositivo.nombrePersonalizado}
                  tipoObjeto={dispositivo.tipoObjeto}
                  ubicacion={dispositivo.ubicacion}
                  estado={dispositivo.estadoActual}
                  potenciaActual={stats?.ultimaMedicion?.potenciaWatts || 0}
                  costoReal={consumo?.costoSoles}
                  consumoKwh={consumo?.consumoKwh}
                  onClick={() => router.push(`/dashboard/dispositivos/${dispositivo.id}`)}
                  isDarkMode={isDarkMode}
                />
              </motion.div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dispositivo</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Potencia</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Costo (30d)</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {filteredDevices.map((dispositivo) => {
                const stats = estadisticas.get(dispositivo.id);
                const consumo = consumoReal.get(dispositivo.id);
                const potencia = stats?.ultimaMedicion?.potenciaWatts || 0;
                // Usar costo real si existe, sino estimar
                const costo = consumo?.costoSoles ?? calcularCostoElectrosur(potencia);
                const esReal = consumo?.costoSoles !== undefined;
                return (
                  <tr 
                    key={dispositivo.id}
                    onClick={() => router.push(`/dashboard/dispositivos/${dispositivo.id}`)}
                    className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          dispositivo.estadoActual === 'ON' 
                            ? (isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600')
                            : (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                        }`}>
                          <Cpu size={20} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {dispositivo.nombrePersonalizado || dispositivo.nombre}
                          </p>
                          <p className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {dispositivo.serialUnico}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        dispositivo.estadoActual === 'ON'
                          ? 'bg-green-100 text-green-700'
                          : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          dispositivo.estadoActual === 'ON' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {dispositivo.estadoActual === 'ON' ? 'Encendido' : 'Apagado'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {potencia.toFixed(0)} W
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          S/ {costo.toFixed(2)}
                        </span>
                        {!esReal && (
                          <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                            (est.)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
