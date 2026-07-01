'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '../layout';
import { TARIFA_ELECTROSUR } from '@/components/dashboard';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Moon, 
  Sun,
  Mail,
  Phone,
  MapPin,
  Save,
  ChevronRight,
  Check,
  Zap,
  Globe,
  Smartphone
} from 'lucide-react';

interface SettingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDashboard();

  // Settings state
  const [activeSection, setActiveSection] = useState('perfil');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    alertas: true,
    reportes: false,
  });
  const [preferences, setPreferences] = useState({
    tarifaPersonalizada: TARIFA_ELECTROSUR,
    unidadPotencia: 'W',
    formatoFecha: 'DD/MM/YYYY',
    idioma: 'es',
  });
  const [saved, setSaved] = useState(false);

  const sections: SettingSection[] = [
    { id: 'perfil', label: 'Perfil', icon: <User size={20} /> },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell size={20} /> },
    { id: 'apariencia', label: 'Apariencia', icon: <Palette size={20} /> },
    { id: 'energia', label: 'Energía', icon: <Zap size={20} /> },
    { id: 'seguridad', label: 'Seguridad', icon: <Shield size={20} /> },
  ];

  const handleSave = () => {
    // Aquí iría la lógica para guardar en el backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Configuración
        </motion.h1>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Personaliza tu experiencia en Energy Home
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className={`p-4 rounded-2xl h-fit ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === section.id
                    ? isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-100 text-gray-900'
                    : isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {section.icon}
                <span className="font-medium">{section.label}</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className={`lg:col-span-3 p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
          {/* Perfil */}
          {activeSection === 'perfil' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información del Perfil
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Actualiza tu información personal
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold
                  ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.email}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {user?.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </p>
                  <button className="text-sm text-blue-500 hover:text-blue-600 mt-1">
                    Cambiar foto
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all
                        ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      placeholder="+51 999 999 999"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all
                        ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ubicación
                  </label>
                  <div className="relative">
                    <MapPin size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Tacna, Perú"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all
                        ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notificaciones */}
          {activeSection === 'notificaciones' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notificaciones
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Configura cómo quieres recibir notificaciones
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Notificaciones por Email', description: 'Recibe alertas y reportes en tu correo', icon: <Mail size={20} /> },
                  { key: 'push', label: 'Notificaciones Push', description: 'Alertas en tiempo real en tu dispositivo', icon: <Smartphone size={20} /> },
                  { key: 'alertas', label: 'Alertas de Consumo', description: 'Aviso cuando el consumo sea alto', icon: <Zap size={20} /> },
                  { key: 'reportes', label: 'Reportes Semanales', description: 'Resumen semanal de tu consumo', icon: <Bell size={20} /> },
                ].map((item) => (
                  <div 
                    key={item.key}
                    className={`flex items-center justify-between p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                      className={`w-12 h-7 rounded-full transition-all relative ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'bg-blue-500'
                          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Apariencia */}
          {activeSection === 'apariencia' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Apariencia
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Personaliza la apariencia de la aplicación
                </p>
              </div>

              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {isDarkMode ? <Moon size={24} className="text-blue-400" /> : <Sun size={24} className="text-orange-500" />}
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tema</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {isDarkMode ? 'Modo Oscuro activo' : 'Modo Claro activo'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`w-12 h-7 rounded-full transition-all relative ${
                      isDarkMode ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                      isDarkMode ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => !isDarkMode || toggleDarkMode()}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      !isDarkMode ? 'border-blue-500' : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-full h-20 bg-white rounded-lg mb-3 border border-gray-200" />
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Claro</p>
                  </button>
                  <button
                    onClick={() => isDarkMode || toggleDarkMode()}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isDarkMode ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-full h-20 bg-gray-800 rounded-lg mb-3" />
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Oscuro</p>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Energía */}
          {activeSection === 'energia' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Configuración de Energía
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Personaliza los cálculos de consumo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tarifa Eléctrica (S/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={preferences.tarifaPersonalizada}
                    onChange={(e) => setPreferences(prev => ({ ...prev, tarifaPersonalizada: parseFloat(e.target.value) }))}
                    className={`w-full px-4 py-3 rounded-xl border transition-all
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Tarifa Electrosur: S/ {TARIFA_ELECTROSUR}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Unidad de Potencia
                  </label>
                  <select
                    value={preferences.unidadPotencia}
                    onChange={(e) => setPreferences(prev => ({ ...prev, unidadPotencia: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border transition-all
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="W">Watts (W)</option>
                    <option value="kW">Kilowatts (kW)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Formato de Fecha
                  </label>
                  <select
                    value={preferences.formatoFecha}
                    onChange={(e) => setPreferences(prev => ({ ...prev, formatoFecha: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border transition-all
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Idioma
                  </label>
                  <select
                    value={preferences.idioma}
                    onChange={(e) => setPreferences(prev => ({ ...prev, idioma: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border transition-all
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-100'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  <strong>Fórmula de cálculo:</strong> (Potencia / 1000) × Horas × Días × Tarifa
                </p>
              </div>
            </motion.div>
          )}

          {/* Seguridad */}
          {activeSection === 'seguridad' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Seguridad
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Protege tu cuenta
                </p>
              </div>

              <div className="space-y-4">
                <button className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'}`}>
                      <Shield size={20} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cambiar Contraseña</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Actualiza tu contraseña regularmente</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                </button>

                <button className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'}`}>
                      <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Autenticación de 2 Factores</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Añade una capa extra de seguridad</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                </button>

                <button className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'}`}>
                      <Globe size={20} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sesiones Activas</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Gestiona tus dispositivos conectados</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                saved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {saved ? (
                <>
                  <Check size={18} />
                  Guardado
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
