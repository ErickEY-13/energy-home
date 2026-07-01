'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Refrigerator, 
  Monitor, 
  Lightbulb, 
  Wind, 
  WashingMachine,
  Microwave,
  Plug,
  X,
  Save,
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
import { api } from '@/lib/api';
import { TipoObjeto, type Dispositivo, type PersonalizarDispositivoDto } from '@/lib/types';

interface PersonalizarDispositivoModalProps {
  dispositivo: Dispositivo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (dispositivo: Dispositivo) => void;
  isDarkMode?: boolean;
}

const TIPOS_OBJETO: { value: TipoObjeto; label: string; icon: React.ReactNode; color: string }[] = [
  { value: TipoObjeto.TV, label: 'Televisor', icon: <Tv className="w-6 h-6" />, color: 'from-blue-500 to-blue-600' },
  { value: TipoObjeto.REFRIGERADOR, label: 'Refrigerador', icon: <Refrigerator className="w-6 h-6" />, color: 'from-cyan-500 to-cyan-600' },
  { value: TipoObjeto.COMPUTADORA, label: 'Computadora', icon: <Monitor className="w-6 h-6" />, color: 'from-purple-500 to-purple-600' },
  { value: TipoObjeto.LAPTOP, label: 'Laptop', icon: <Laptop className="w-6 h-6" />, color: 'from-violet-500 to-violet-600' },
  { value: TipoObjeto.ILUMINACION, label: 'Iluminación', icon: <Lightbulb className="w-6 h-6" />, color: 'from-yellow-500 to-yellow-600' },
  { value: TipoObjeto.AIRE_ACONDICIONADO, label: 'Aire Acond.', icon: <Wind className="w-6 h-6" />, color: 'from-sky-500 to-sky-600' },
  { value: TipoObjeto.VENTILADOR, label: 'Ventilador', icon: <Fan className="w-6 h-6" />, color: 'from-teal-500 to-teal-600' },
  { value: TipoObjeto.LAVADORA, label: 'Lavadora', icon: <WashingMachine className="w-6 h-6" />, color: 'from-indigo-500 to-indigo-600' },
  { value: TipoObjeto.SECADORA, label: 'Secadora', icon: <Droplets className="w-6 h-6" />, color: 'from-blue-400 to-blue-500' },
  { value: TipoObjeto.MICROONDAS, label: 'Microondas', icon: <Microwave className="w-6 h-6" />, color: 'from-red-500 to-red-600' },
  { value: TipoObjeto.HORNO, label: 'Horno', icon: <Cookie className="w-6 h-6" />, color: 'from-rose-500 to-rose-600' },
  { value: TipoObjeto.CAFETERA, label: 'Cafetera', icon: <Coffee className="w-6 h-6" />, color: 'from-amber-500 to-amber-600' },
  { value: TipoObjeto.LICUADORA, label: 'Licuadora', icon: <Blend className="w-6 h-6" />, color: 'from-orange-500 to-orange-600' },
  { value: TipoObjeto.CONSOLA_VIDEOJUEGOS, label: 'Consola', icon: <Gamepad2 className="w-6 h-6" />, color: 'from-pink-500 to-pink-600' },
  { value: TipoObjeto.ROUTER, label: 'Router/WiFi', icon: <Wifi className="w-6 h-6" />, color: 'from-emerald-500 to-emerald-600' },
  { value: TipoObjeto.CARGADOR, label: 'Cargador', icon: <BatteryCharging className="w-6 h-6" />, color: 'from-lime-500 to-lime-600' },
  { value: TipoObjeto.PLANCHA, label: 'Plancha', icon: <Shirt className="w-6 h-6" />, color: 'from-fuchsia-500 to-fuchsia-600' },
  { value: TipoObjeto.CALENTADOR, label: 'Calentador', icon: <ThermometerSun className="w-6 h-6" />, color: 'from-red-400 to-red-500' },
  { value: TipoObjeto.BOMBA_AGUA, label: 'Bomba Agua', icon: <Waves className="w-6 h-6" />, color: 'from-cyan-400 to-cyan-500' },
  { value: TipoObjeto.OTRO, label: 'Otro', icon: <Plug className="w-6 h-6" />, color: 'from-gray-500 to-gray-600' },
];

const UBICACIONES = [
  'Sala',
  'Cocina',
  'Dormitorio Principal',
  'Dormitorio Secundario',
  'Baño',
  'Oficina',
  'Garaje',
  'Patio',
  'Comedor',
  'Lavandería',
];

export default function PersonalizarDispositivoModal({
  dispositivo,
  isOpen,
  onClose,
  onSuccess,
  isDarkMode = true,
}: PersonalizarDispositivoModalProps) {
  const [nombrePersonalizado, setNombrePersonalizado] = useState(dispositivo.nombrePersonalizado || '');
  const [tipoObjeto, setTipoObjeto] = useState<TipoObjeto | undefined>(dispositivo.tipoObjeto);
  const [ubicacion, setUbicacion] = useState(dispositivo.ubicacion || '');
  const [ubicacionCustom, setUbicacionCustom] = useState('');
  const [isCustomUbicacion, setIsCustomUbicacion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNombrePersonalizado(dispositivo.nombrePersonalizado || '');
      setTipoObjeto(dispositivo.tipoObjeto);
      setUbicacion(dispositivo.ubicacion || '');
      // Check if current ubicacion is custom
      if (dispositivo.ubicacion && !UBICACIONES.includes(dispositivo.ubicacion)) {
        setIsCustomUbicacion(true);
        setUbicacionCustom(dispositivo.ubicacion);
      }
    }
  }, [isOpen, dispositivo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data: PersonalizarDispositivoDto = {
        nombrePersonalizado: nombrePersonalizado || undefined,
        tipoObjeto: tipoObjeto,
        ubicacion: isCustomUbicacion ? ubicacionCustom : ubicacion || undefined,
      };

      const updated = await api.personalizarDispositivo(dispositivo.id, data);
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al personalizar dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTipo = () => TIPOS_OBJETO.find(t => t.value === tipoObjeto);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative rounded-2xl shadow-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`sticky top-0 backdrop-blur-sm p-6 border-b flex items-center justify-between z-10 ${
              isDarkMode 
                ? 'bg-gray-900/95 border-gray-700' 
                : 'bg-white/95 border-gray-200'
            }`}>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Personalizar Dispositivo
                </h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Configura cómo quieres identificar este dispositivo
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nombre personalizado */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre Personalizado
                </label>
                <input
                  type="text"
                  value={nombrePersonalizado}
                  onChange={(e) => setNombrePersonalizado(e.target.value)}
                  placeholder={dispositivo.nombre}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Dale un nombre fácil de recordar como "TV de la sala" o "Mi PC"
                </p>
              </div>

              {/* Tipo de objeto */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Dispositivo
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {TIPOS_OBJETO.map((tipo) => (
                    <motion.button
                      key={tipo.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTipoObjeto(tipo.value)}
                      className={`relative p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        tipoObjeto === tipo.value
                          ? `bg-gradient-to-br ${tipo.color} text-white shadow-lg`
                          : isDarkMode
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white border border-gray-700'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200'
                      }`}
                    >
                      {tipo.icon}
                      <span className="text-xs font-medium text-center leading-tight">
                        {tipo.label}
                      </span>
                      {tipoObjeto === tipo.value && (
                        <motion.div
                          layoutId="selected-tipo"
                          className="absolute inset-0 border-2 border-white/30 rounded-xl"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Ubicación
                </label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setIsCustomUbicacion(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !isCustomUbicacion 
                        ? 'bg-emerald-600 text-white' 
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Predefinida
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomUbicacion(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isCustomUbicacion 
                        ? 'bg-emerald-600 text-white' 
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Personalizada
                  </button>
                </div>

                {isCustomUbicacion ? (
                  <input
                    type="text"
                    value={ubicacionCustom}
                    onChange={(e) => setUbicacionCustom(e.target.value)}
                    placeholder="Ej: Habitación de invitados"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {UBICACIONES.map((ub) => (
                      <motion.button
                        key={ub}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setUbicacion(ub)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          ubicacion === ub
                            ? 'bg-emerald-600 text-white'
                            : isDarkMode
                              ? 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white border border-gray-700'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200'
                        }`}
                      >
                        {ub}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              {(nombrePersonalizado || tipoObjeto || ubicacion || ubicacionCustom) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p className={`text-xs uppercase tracking-wide mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Vista previa
                  </p>
                  <div className="flex items-center gap-4">
                    {tipoObjeto && (
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getSelectedTipo()?.color} text-white`}>
                        {getSelectedTipo()?.icon}
                      </div>
                    )}
                    <div>
                      <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {nombrePersonalizado || dispositivo.nombre}
                      </p>
                      {(ubicacion || ubicacionCustom) && (
                        <p className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <MapPin className="w-3 h-3" />
                          {isCustomUbicacion ? ubicacionCustom : ubicacion}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-750' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
