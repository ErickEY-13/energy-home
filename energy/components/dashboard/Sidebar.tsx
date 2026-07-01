'use client';

import { useState } from 'react';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  LayoutDashboard, 
  Cpu, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft,
  Bell,
  User,
  Moon,
  Sun,
  Shield,
  Activity
} from 'lucide-react';

interface SidebarProps {
  user: { email: string; rol: string } | null;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/dashboard',
    description: 'Vista general'
  },
  { 
    icon: Cpu, 
    label: 'Dispositivos', 
    href: '/dashboard/dispositivos',
    description: 'Gestionar equipos'
  },
  { 
    icon: BarChart3, 
    label: 'Reportes', 
    href: '/dashboard/reportes',
    description: 'Análisis detallado'
  },
  { 
    icon: Activity, 
    label: 'Análisis ML', 
    href: '/dashboard/analisis',
    description: 'Machine Learning'
  },
  { 
    icon: Settings, 
    label: 'Configuración', 
    href: '/dashboard/configuracion',
    description: 'Preferencias'
  },
];

export function Sidebar({ user, onLogout, isDarkMode = false, onToggleDarkMode }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col
          ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}
          border-r shadow-xl shadow-gray-200/50`}
      >
        {/* Logo */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105
              ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}>
              <Zap size={22} className={isDarkMode ? 'text-gray-900' : 'text-white'} fill="currentColor" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Energy Home
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md border transition-all hover:scale-110
            ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}
        >
          <ChevronLeft size={14} className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative
                  ${isActive 
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                      : 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col"
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className={`text-xs ${isActive ? 'text-white/70' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {item.description}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Admin Link */}
          {user?.rol?.toUpperCase() === 'ADMIN' && (
            <Link
              href="/dashboard/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                ${pathname.startsWith('/dashboard/admin')
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : isDarkMode
                    ? 'text-purple-400 hover:bg-gray-800'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
            >
              <Shield size={20} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col"
                  >
                    <span className="font-medium">Admin</span>
                    <span className="text-xs opacity-70">Panel de control</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          )}
        </nav>

        {/* Bottom Section */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2
              ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && (
              <span className="font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            )}
          </button>

          {/* User Info */}
          {!isCollapsed && user && (
            <div className={`px-4 py-3 rounded-xl mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <User size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.email}
                  </p>
                  <p className={`text-xs capitalize ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {user.rol?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
              ${isDarkMode 
                ? 'text-red-400 hover:bg-red-900/20' 
                : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      <div className={`lg:hidden fixed inset-0 bg-black/50 z-40 ${isCollapsed ? 'hidden' : ''}`} 
        onClick={() => setIsCollapsed(true)} 
      />
    </>
  );
}
