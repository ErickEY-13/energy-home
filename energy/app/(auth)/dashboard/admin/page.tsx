'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { DispositivoAdmin } from '@/lib/types';
import { FullPageLoader, Button, Input } from '@/components';
import { 
  Package, 
  Plus, 
  Search, 
  Users, 
  Activity, 
  Cpu, 
  QrCode,
  Copy,
  Check,
  X,
  BarChart3,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  ChevronRight,
  Factory,
  Wifi,
  UserPlus,
  Settings,
  Filter,
  LogOut
} from 'lucide-react';

// ========================================
// COMPONENTES
// ========================================

// Componente para mostrar el QR Code del dispositivo
function QRCodeDisplay({ serial, onClose }: { serial: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(serial);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Código QR del Dispositivo</h3>
            <p className="text-sm text-gray-500">Escanea para adoptar</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* QR Placeholder */}
        <div className="bg-gray-100 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center">
          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-4 border-gray-200 mb-4">
            <QrCode className="w-32 h-32 text-gray-800" />
          </div>
          <p className="text-xs text-gray-500 text-center">
            En producción, aquí se mostraría el QR real
          </p>
        </div>
        
        {/* Serial */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <code className="flex-1 text-sm font-mono text-gray-700 truncate">{serial}</code>
          <button 
            onClick={copyToClipboard}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Componente de tarjeta de estadísticas del admin
function AdminStatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  color = 'blue'
}: { 
  icon: React.ElementType; 
  title: string; 
  value: string | number; 
  subtitle?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mt-4">{value}</h3>
      <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

// Componente de fila de dispositivo para la tabla
function DeviceRow({ 
  device, 
  onShowQR 
}: { 
  device: DispositivoAdmin;
  onShowQR: (serial: string) => void;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            device.estadoActual === 'ON' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{device.nombre}</p>
            <p className="text-xs text-gray-500 font-mono">{device.serialUnico}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          device.estadoActual === 'ON' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${device.estadoActual === 'ON' ? 'bg-green-500' : 'bg-gray-400'}`} />
          {device.estadoActual === 'ON' ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4">
        {device.usuariosAsignados > 0 ? (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">{device.usuariosAsignados}</span>
            <span className="text-xs text-gray-400">usuarios</span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Sin adoptar
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">{device.totalMediciones.toLocaleString()}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <button 
          onClick={() => onShowQR(device.serialUnico)}
          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
          title="Ver QR"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </td>
    </motion.tr>
  );
}

// Modal de creación de dispositivo
function CreateDeviceModal({ 
  isOpen, 
  onClose, 
  onCreated 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreated: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [serialUnico, setSerialUnico] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdDevice, setCreatedDevice] = useState<{serial: string; nombre: string; ubicacion: string} | null>(null);

  const generateSerial = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSerialUnico(`ESP32-${random}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !serialUnico.trim()) {
      setError('Nombre y Serial son requeridos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.crearDispositivo({ nombre, serialUnico });
      setCreatedDevice({
        serial: result.serialUnico || serialUnico,
        nombre: result.nombre || nombre,
        ubicacion: 'Sin asignar'
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNombre('');
    setSerialUnico('');
    setError('');
    setCreatedDevice(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
      >
        {createdDevice ? (
          // Success state
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Dispositivo Registrado!</h3>
            <p className="text-gray-500 mb-6">El dispositivo está listo para ser conectado.</p>
            
            <div className="space-y-4 text-left bg-gray-50 rounded-xl p-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Serial Único</p>
                <code className="text-sm font-mono text-gray-800">{createdDevice.serial}</code>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre</p>
                <span className="text-sm text-gray-800">{createdDevice.nombre}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ubicación</p>
                <span className="text-sm text-gray-800">{createdDevice.ubicacion}</span>
              </div>
            </div>
            
            <Button onClick={handleClose} fullWidth>
              Cerrar
            </Button>
          </div>
        ) : (
          // Form state
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Pre-registro de Dispositivo</h3>
                <p className="text-sm text-gray-500">Paso 1: Registro en fábrica</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Flujo visual */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <Factory className="w-5 h-5" />
                </div>
                <span className="text-xs text-blue-600 font-medium mt-2">Registro</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400 mt-2">Conexión</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400 mt-2">Adopción</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre del Dispositivo"
                placeholder="Ej: ESP32 Sala Principal"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Único</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ESP32-XXXXXX"
                    value={serialUnico}
                    onChange={(e) => setSerialUnico(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={generateSerial}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                  >
                    Generar
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={loading} fullWidth>
                  Registrar Dispositivo
                </Button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [dispositivos, setDispositivos] = useState<DispositivoAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDispositivos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.getDispositivosAdmin();
      setDispositivos(data);
    } catch (err) {
      console.error('Error fetching admin devices:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar dispositivos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Comparar en mayúsculas por si el backend envía en minúsculas
    const isAdmin = user?.rol?.toUpperCase() === 'ADMIN';

    if (!authLoading && user && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && isAdmin) {
      fetchDispositivos();
    }
  }, [authLoading, isAuthenticated, user, router, fetchDispositivos]);

  // Filtrar dispositivos
  const filteredDevices = dispositivos.filter(d => {
    // Filtro por estado
    if (filter === 'online' && d.estadoActual !== 'ON') return false;
    if (filter === 'offline' && d.estadoActual === 'ON') return false;
    if (filter === 'pending' && d.usuariosAsignados > 0) return false;
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        d.nombre.toLowerCase().includes(term) ||
        d.serialUnico.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Estadísticas
  const stats = {
    total: dispositivos.length,
    online: dispositivos.filter(d => d.estadoActual === 'ON').length,
    pending: dispositivos.filter(d => d.usuariosAsignados === 0).length,
    totalMediciones: dispositivos.reduce((acc, d) => acc + d.totalMediciones, 0),
    totalUsuarios: new Set(dispositivos.flatMap(d => d.usuarios.map(u => u.id))).size
  };

  if (authLoading || (!user && isAuthenticated)) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-500">Gestión de dispositivos IoT</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <button
                onClick={fetchDispositivos}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Dispositivo
              </Button>
              <button
                onClick={logout}
                className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Flujo de trabajo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-8 text-white"
        >
          <h2 className="text-lg font-semibold mb-6">Flujo de Vida del Dispositivo</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Factory className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold">1. Pre-registro</p>
                <p className="text-sm text-white/70">Fábrica registra serial único</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/40" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Wifi className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold">2. Conexión</p>
                <p className="text-sm text-white/70">ESP32 se conecta vía WiFi</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/40" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold">3. Adopción</p>
                <p className="text-sm text-white/70">Usuario escanea QR o serial</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/40" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold">4. Monitoreo</p>
                <p className="text-sm text-white/70">Dashboard en tiempo real</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <AdminStatCard 
            icon={Package} 
            title="Total Dispositivos" 
            value={stats.total}
            color="blue"
          />
          <AdminStatCard 
            icon={Activity} 
            title="En Línea" 
            value={stats.online}
            subtitle={`${stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0}% activos`}
            color="green"
          />
          <AdminStatCard 
            icon={Clock} 
            title="Sin Adoptar" 
            value={stats.pending}
            subtitle="Esperando usuarios"
            color="orange"
          />
          <AdminStatCard 
            icon={Database} 
            title="Mediciones" 
            value={stats.totalMediciones.toLocaleString()}
            color="purple"
          />
          <AdminStatCard 
            icon={Users} 
            title="Usuarios Únicos" 
            value={stats.totalUsuarios}
            color="blue"
          />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('online')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'online' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              En línea
            </button>
            <button
              onClick={() => setFilter('offline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'offline' ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Offline
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sin adoptar
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 mb-6"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Tabla de dispositivos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500">Cargando dispositivos...</p>
              </div>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || filter !== 'all' ? 'No se encontraron dispositivos' : 'Sin dispositivos'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Intenta con otros filtros de búsqueda' 
                  : 'Comienza registrando tu primer dispositivo'
                }
              </p>
              {!searchTerm && filter === 'all' && (
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Dispositivo
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Dispositivo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Usuarios
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Mediciones
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      QR
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => (
                    <DeviceRow 
                      key={device.id} 
                      device={device} 
                      onShowQR={(serial) => setShowQRModal(serial)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Resumen de la tabla */}
        {filteredDevices.length > 0 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Mostrando {filteredDevices.length} de {dispositivos.length} dispositivos
          </p>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateDeviceModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreated={fetchDispositivos}
          />
        )}
        {showQRModal && (
          <QRCodeDisplay
            serial={showQRModal}
            onClose={() => setShowQRModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
