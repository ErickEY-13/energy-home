'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell, X, AlertCircle, Zap, TrendingUp, Lightbulb } from 'lucide-react';

interface Alerta {
  id: number;
  dispositivoId: number;
  tipo: 'anomalia' | 'consumo_alto' | 'spike' | 'prediccion' | 'eficiencia';
  severidad: 'low' | 'medium' | 'high';
  mensaje: string;
  datos?: any;
  visto: boolean;
  fechaCreacion: string;
  dispositivo?: {
    nombre: string;
    serialUnico: string;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function AlertSystem() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    // Conectar WebSocket
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado al sistema de alertas');
      
      // Cargar alertas no leídas al conectar
      newSocket.emit('get-unread-alerts');
    });

    newSocket.on('nueva-alerta', (alerta: Alerta) => {
      console.log('🚨 Nueva alerta recibida:', alerta);
      
      setAlertas(prev => [alerta, ...prev]);
      setNoLeidas(prev => prev + 1);
      
      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ Nueva Alerta', {
          body: alerta.mensaje,
          icon: '/logo.png',
        });
      }
      
      // Sonido para alertas críticas
      if (alerta.severidad === 'high') {
        const audio = new Audio('/alert-sound.mp3');
        audio.play().catch(console.error);
      }
    });

    newSocket.on('get-unread-alerts', (response) => {
      if (response.success) {
        setAlertas(response.alertas);
        setNoLeidas(response.alertas.length);
      }
    });

    setSocket(newSocket);

    // Pedir permisos de notificación
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const marcarComoLeida = async (alertaId: number) => {
    if (!socket) return;
    
    socket.emit('mark-alert-read', alertaId);
    
    setAlertas(prev => 
      prev.map(a => a.id === alertaId ? { ...a, visto: true } : a)
    );
    setNoLeidas(prev => Math.max(0, prev - 1));
  };

  const getIconoTipo = (tipo: Alerta['tipo']) => {
    switch (tipo) {
      case 'anomalia':
        return <AlertCircle className="w-5 h-5" />;
      case 'spike':
        return <Zap className="w-5 h-5" />;
      case 'consumo_alto':
        return <TrendingUp className="w-5 h-5" />;
      case 'prediccion':
        return <Lightbulb className="w-5 h-5" />;
      case 'eficiencia':
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getColorSeveridad = (severidad: Alerta['severidad']) => {
    switch (severidad) {
      case 'high':
        return 'bg-red-500/10 border-red-500 text-red-500';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-500';
      case 'low':
        return 'bg-blue-500/10 border-blue-500 text-blue-500';
    }
  };

  return (
    <>
      {/* Botón de alertas */}
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel de alertas */}
      {mostrarPanel && (
        <div className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <h3 className="font-bold text-lg">🚨 Alertas</h3>
            <button
              onClick={() => setMostrarPanel(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de alertas */}
          <div className="flex-1 overflow-y-auto">
            {alertas.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay alertas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !alerta.visto ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg h-fit ${getColorSeveridad(alerta.severidad)}`}>
                        {getIconoTipo(alerta.tipo)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm text-gray-900">
                            {alerta.dispositivo?.nombre || `Dispositivo ${alerta.dispositivoId}`}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(alerta.fechaCreacion).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">
                          {alerta.mensaje}
                        </p>
                        
                        {!alerta.visto && (
                          <button
                            onClick={() => marcarComoLeida(alerta.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click fuera para cerrar */}
      {mostrarPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMostrarPanel(false)}
        />
      )}
    </>
  );
}
