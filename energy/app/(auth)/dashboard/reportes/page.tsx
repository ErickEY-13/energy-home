'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '../layout';
import api from '@/lib/api';
import type { Dispositivo, EstadisticasDispositivo, ConsumoReal, HistorialMensual, ConsumoMensual } from '@/lib/types';
import { 
  ChartWrapper,
  ConsumptionBarChart,
  ConsumptionPieChart,
  PowerRealtimeChart,
  TARIFA_ELECTROSUR,
  ConsumoBarChart3D,
  ConsumoPieChart3D,
  PowerLineChart3D
} from '@/components/dashboard';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Wallet,
  Activity,
  FileText,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  Award,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type PeriodoType = '7d' | '30d' | '90d' | '180d' | '365d';

export default function ReportesPage() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDashboard();
  const reportRef = useRef<HTMLDivElement>(null);

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [estadisticas, setEstadisticas] = useState<Map<number, EstadisticasDispositivo>>(new Map());
  const [consumosReal, setConsumosReal] = useState<Map<number, ConsumoReal>>(new Map());
  const [historiales, setHistoriales] = useState<Map<number, HistorialMensual>>(new Map());
  const [mlAnalysis, setMlAnalysis] = useState<Map<number, any>>(new Map());
  const [mlStats, setMlStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [periodo, setPeriodo] = useState<PeriodoType>('30d');
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Mapeo de períodos a días
  const periodoDias: Record<PeriodoType, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '180d': 180,
    '365d': 365
  };

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const devicesData = await api.getDispositivos();
      setDispositivos(devicesData);

      const statsMap = new Map<number, EstadisticasDispositivo>();
      const consumosMap = new Map<number, ConsumoReal>();
      const historialesMap = new Map<number, HistorialMensual>();
      const mlAnalysisMap = new Map<number, any>();
      
      await Promise.all(
        devicesData.map(async (d) => {
          try {
            const dias = periodoDias[periodo];
            const [stats, consumo, historial] = await Promise.all([
              api.getEstadisticas(d.id),
              api.getConsumoReal(d.id, dias),
              api.getHistorialMensual(d.id, 12)
            ]);
            statsMap.set(d.id, stats);
            consumosMap.set(d.id, consumo);
            historialesMap.set(d.id, historial);
            
            // Obtener último análisis ML del dispositivo
            try {
              const lastML = await api.getLastMLAnalysis(d.id);
              if (lastML) {
                mlAnalysisMap.set(d.id, lastML);
              }
            } catch (mlError) {
              console.log(`Sin análisis ML para dispositivo ${d.id}`);
            }
          } catch {
            // Dispositivo sin mediciones
          }
        })
      );
      
      // Obtener estadísticas ML globales
      try {
        const stats = await api.getMLStats();
        setMlStats(stats);
      } catch (mlError) {
        console.log('ML Stats no disponibles');
      }
      
      setEstadisticas(statsMap);
      setConsumosReal(consumosMap);
      setHistoriales(historialesMap);
      setMlAnalysis(mlAnalysisMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [periodo]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Exportar datos a CSV (siempre funciona)
  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      
      // Crear CSV con todos los datos
      let csv = 'Reporte de Consumo Energético\n\n';
      csv += `Periodo,${periodoDias[periodo]} días\n`;
      csv += `Fecha,${new Date().toLocaleDateString('es-PE')}\n\n`;
      
      // Resumen
      csv += 'RESUMEN GENERAL\n';
      csv += 'Concepto,Valor\n';
      csv += `Consumo Total,${totalConsumoKwh.toFixed(3)} kWh\n`;
      csv += `Costo Total,S/ ${totalCostoReal.toFixed(2)}\n`;
      csv += `Potencia Actual,${totalPotenciaActual.toFixed(0)} W\n`;
      csv += `Dispositivos Activos,${dispositivos.filter(d => d.estadoActual === 'ON').length}/${dispositivos.length}\n\n`;
      
      // Top Consumidores
      csv += 'TOP CONSUMIDORES\n';
      csv += 'Posición,Dispositivo,Consumo (kWh),Costo (S/),Potencia (W),Estado\n';
      topDispositivos.forEach((d, i) => {
        csv += `${i + 1},${d.nombre},${d.consumoKwh.toFixed(3)},${d.costoSoles.toFixed(2)},${d.potenciaActual.toFixed(0)},${d.estado}\n`;
      });
      
      csv += '\nHISTORIAL MENSUAL\n';
      csv += 'Mes,Consumo (kWh),Costo (S/)\n';
      historicoOrdenado.forEach(mes => {
        csv += `${mes.nombreMes} ${mes.anio},${mes.consumoKwh.toFixed(3)},${mes.costoSoles.toFixed(2)}\n`;
      });
      
      // Descargar CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-energia-${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al generar el archivo');
    } finally {
      setIsExporting(false);
    }
  };

  // Calcular estadísticas REALES
  const totalPotenciaActual = Array.from(estadisticas.values()).reduce(
    (acc, stats) => acc + (stats.ultimaMedicion?.potenciaWatts || 0), 0
  );
  
  const totalConsumoKwh = Array.from(consumosReal.values()).reduce(
    (acc, consumo) => acc + (consumo?.consumoKwh || 0), 0
  );

  const totalCostoReal = Array.from(consumosReal.values()).reduce(
    (acc, consumo) => acc + (consumo?.costoSoles || 0), 0
  );

  const potenciaPromedio = totalPotenciaActual / Math.max(dispositivos.filter(d => d.estadoActual === 'ON').length, 1);

  // Combinar historial de todos los dispositivos
  const historialCombinado: Record<string, ConsumoMensual> = {};
  historiales.forEach(historial => {
    historial.historial.forEach(mes => {
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
  
  const historicoOrdenado = Object.values(historialCombinado)
    .sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.mes - b.mes;
    })
    .slice(-12); // Últimos 12 meses

  // Calcular tendencia (comparar con mes anterior) - VALIDADO
  const mesActual = historicoOrdenado[historicoOrdenado.length - 1];
  const mesAnterior = historicoOrdenado[historicoOrdenado.length - 2];
  
  const tendenciaConsumo = mesAnterior && mesActual && mesAnterior.consumoKwh > 0 && mesActual.consumoKwh > 0
    ? ((mesActual.consumoKwh - mesAnterior.consumoKwh) / mesAnterior.consumoKwh) * 100 
    : null; // null si no hay datos suficientes
    
  const tendenciaCosto = mesAnterior && mesActual && mesAnterior.costoSoles > 0 && mesActual.costoSoles > 0
    ? ((mesActual.costoSoles - mesAnterior.costoSoles) / mesAnterior.costoSoles) * 100
    : null;

  // Datos para gráfico de barras - Historial real por mes
  const barChartData = historicoOrdenado.map(mes => ({
    day: mes.nombreMes.substring(0, 3).charAt(0).toUpperCase() + mes.nombreMes.substring(1, 3),
    consumo: mes.consumoKwh
  }));

  // Datos para pie chart - Distribución REAL de consumo por dispositivo
  const pieChartData = dispositivos
    .map(d => {
      const consumo = consumosReal.get(d.id);
      return {
        name: d.nombrePersonalizado || d.nombre,
        value: consumo?.consumoKwh || 0,
      };
    })
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // Top 5 dispositivos por consumo REAL
  const topDispositivos = dispositivos
    .map(d => {
      const consumo = consumosReal.get(d.id);
      const stats = estadisticas.get(d.id);
      return {
        nombre: d.nombrePersonalizado || d.nombre,
        consumoKwh: consumo?.consumoKwh || 0,
        costoSoles: consumo?.costoSoles || 0,
        potenciaActual: stats?.ultimaMedicion?.potenciaWatts || 0,
        estado: d.estadoActual,
      };
    })
    .sort((a, b) => b.consumoKwh - a.consumoKwh)
    .slice(0, 5);

  const maxConsumo = topDispositivos[0]?.consumoKwh || 1;

  // NUEVAS FUNCIONALIDADES: Análisis avanzados
  
  // 1. Dispositivo más eficiente (menor consumo activo)
  const dispositivoMasEficiente = dispositivos
    .filter(d => d.estadoActual === 'ON')
    .map(d => {
      const consumo = consumosReal.get(d.id);
      return { nombre: d.nombrePersonalizado || d.nombre, consumo: consumo?.consumoKwh || 0 };
    })
    .sort((a, b) => a.consumo - b.consumo)[0];

  // 2. Comparativa con mes anterior
  const consumoMesAnterior = mesAnterior?.consumoKwh || 0;
  const ahorroMensual = consumoMesAnterior > 0 && mesActual 
    ? consumoMesAnterior - mesActual.consumoKwh 
    : 0;

  // 3. Proyección de fin de mes - INTELIGENTE CON ML
  const diasTranscurridos = new Date().getDate();
  const diasEnMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  
  // Usar forecast ML si está disponible
  let proyeccionMes = 0;
  let proyeccionCosto = 0;
  let proyeccionML = false;
  
  if (mlAnalysis.size > 0) {
    // Sumar forecast de todos los dispositivos con ML
    Array.from(mlAnalysis.values()).forEach(analysis => {
      if (analysis.forecastKwh) {
        // Forecast es para próxima hora, proyectar al mes
        const forecastDiario = (analysis.forecastKwh * 24); // kWh por día
        const forecastMensual = forecastDiario * (diasEnMes - diasTranscurridos);
        proyeccionMes += forecastMensual;
        proyeccionML = true;
      }
    });
    proyeccionCosto = proyeccionMes * TARIFA_ELECTROSUR;
  }
  
  // Fallback a cálculo simple si no hay ML
  if (!proyeccionML && totalConsumoKwh > 0) {
    proyeccionMes = (totalConsumoKwh / diasTranscurridos) * diasEnMes;
    proyeccionCosto = proyeccionMes * TARIFA_ELECTROSUR;
  }

  // 4. Recomendaciones inteligentes - DESDE MACHINE LEARNING
  const recomendaciones = [];
  
  // Agregar recomendaciones ML de cada dispositivo
  mlAnalysis.forEach((analysis, dispositivoId) => {
    const dispositivo = dispositivos.find(d => d.id === dispositivoId);
    if (analysis.recomendaciones && Array.isArray(analysis.recomendaciones)) {
      analysis.recomendaciones.forEach((rec: any) => {
        recomendaciones.push({
          tipo: rec.severity === 'high' ? 'alert' : rec.severity === 'medium' ? 'warning' : 'info',
          titulo: `ML: ${dispositivo?.nombrePersonalizado || dispositivo?.nombre}`,
          mensaje: rec.message,
          icono: rec.severity === 'high' ? '⚠' : rec.severity === 'medium' ? '⚡' : '○',
          ml: true // Marcar como recomendación ML
        });
      });
    }
    
    // Alertas de anomalías
    if (analysis.anomaliasDetectadas > 0) {
      recomendaciones.push({
        tipo: 'alert',
        titulo: `${analysis.anomaliasDetectadas} anomalías detectadas`,
        mensaje: `${dispositivo?.nombrePersonalizado || dispositivo?.nombre} - Revisar comportamiento anormal`,
        icono: '⚠',
        ml: true
      });
    }
  });
  
  // Recomendaciones clásicas (solo si no hay suficientes ML)
  if (recomendaciones.length < 3) {
    if (topDispositivos.length > 0) {
      const topDevice = topDispositivos[0];
      if (topDevice.consumoKwh > totalConsumoKwh * 0.4) {
        recomendaciones.push({
          tipo: 'warning',
          titulo: `${topDevice.nombre} consume el ${((topDevice.consumoKwh / totalConsumoKwh) * 100).toFixed(0)}%`,
          mensaje: 'Considera revisar su uso o reemplazarlo por un modelo más eficiente',
          icono: '⚠️',
          ml: false
        });
      }
    }

    if (tendenciaConsumo !== null && tendenciaConsumo > 15) {
      recomendaciones.push({
        tipo: 'alert',
        titulo: 'Consumo aumentó +' + tendenciaConsumo.toFixed(0) + '%',
        mensaje: 'Revisa qué dispositivos están consumiendo más energía este mes',
        icono: '▲',
        ml: false
      });
    }

    if (ahorroMensual > 0) {
      recomendaciones.push({
        tipo: 'success',
        titulo: `¡Ahorraste ${ahorroMensual.toFixed(2)} kWh!`,
        mensaje: `Equivalente a S/ ${(ahorroMensual * TARIFA_ELECTROSUR).toFixed(2)} vs mes anterior`,
        icono: '✓',
        ml: false
      });
    }

    if (dispositivoMasEficiente && dispositivoMasEficiente.consumo > 0) {
      recomendaciones.push({
        tipo: 'info',
        titulo: `${dispositivoMasEficiente.nombre} es tu dispositivo más eficiente`,
        mensaje: `Solo ${dispositivoMasEficiente.consumo.toFixed(3)} kWh en ${periodoDias[periodo]} días`,
        icono: '★',
        ml: false
      });
    }
  }

  // 5. Ranking de eficiencia con ML
  const rankingEficiencia = dispositivos
    .filter(d => {
      const consumo = consumosReal.get(d.id);
      return (consumo?.consumoKwh || 0) > 0;
    })
    .map(d => {
      const consumo = consumosReal.get(d.id);
      const stats = estadisticas.get(d.id);
      const analysis = mlAnalysis.get(d.id);
      const consumoKwh = consumo?.consumoKwh || 0;
      const horasMonitoreadas = consumo?.horasMonitoreadas || 1;
      const eficiencia = consumoKwh / horasMonitoreadas; // kWh por hora
      
      // Calcular score ML si está disponible
      let scoreML = 0;
      let tieneML = false;
      if (analysis) {
        tieneML = true;
        // Score basado en severidad (menos es mejor)
        const severidadScore: Record<string, number> = {
          low: 100,
          medium: 70,
          high: 40
        };
        const score = severidadScore[analysis.severidad] || 50;
        
        // Score basado en anomalías (menos es mejor)
        const anomaliasScore = Math.max(0, 100 - (analysis.anomaliasDetectadas * 10));
        
        scoreML = (score + anomaliasScore) / 2;
      }
      
      return {
        nombre: d.nombrePersonalizado || d.nombre,
        eficiencia: eficiencia,
        consumoTotal: consumoKwh,
        estado: d.estadoActual,
        scoreML: scoreML,
        tieneML: tieneML,
        severidad: analysis?.severidad
      };
    })
    .sort((a, b) => {
      // Priorizar dispositivos con ML
      if (a.tieneML && !b.tieneML) return -1;
      if (!a.tieneML && b.tieneML) return 1;
      
      // Si ambos tienen ML, ordenar por score ML (mayor es mejor)
      if (a.tieneML && b.tieneML) return b.scoreML - a.scoreML;
      
      // Si ninguno tiene ML, ordenar por eficiencia (menor es mejor)
      return a.eficiencia - b.eficiencia;
    })
    .slice(0, 5);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Cargando reportes...</p>
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
            Reportes de Consumo
          </motion.h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Análisis detallado con datos reales de tus dispositivos
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
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet size={20} />
            )}
            <span className="hidden sm:inline">{isExporting ? 'Generando...' : 'Exportar Excel'}</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className={`p-4 rounded-xl inline-flex gap-2 flex-wrap ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
        {([
          { value: '7d' as PeriodoType, label: 'Última Semana' },
          { value: '30d' as PeriodoType, label: 'Último Mes' },
          { value: '90d' as PeriodoType, label: '3 Meses' },
          { value: '180d' as PeriodoType, label: '6 Meses' },
          { value: '365d' as PeriodoType, label: 'Año' }
        ]).map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              periodo === p.value
                ? 'bg-gray-900 text-white'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Content to export */}
      <div ref={reportRef} className={`space-y-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6 rounded-2xl`}>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: `Consumo (${periodoDias[periodo]}d)`, 
            value: totalConsumoKwh > 0 ? `${totalConsumoKwh.toFixed(3)} kWh` : '0.000 kWh', 
            icon: <Activity size={24} />, 
            color: 'blue',
            trend: tendenciaConsumo !== null ? `${tendenciaConsumo > 0 ? '+' : ''}${tendenciaConsumo.toFixed(1)}%` : 'Nuevo',
            trendUp: tendenciaConsumo !== null ? tendenciaConsumo > 0 : false,
            subtitle: tendenciaConsumo !== null ? 'vs mes anterior' : 'Primer período'
          },
          { 
            title: 'Costo Real', 
            value: totalCostoReal > 0 ? `S/ ${totalCostoReal.toFixed(2)}` : 'S/ 0.00', 
            icon: <Wallet size={24} />, 
            color: 'green',
            trend: tendenciaCosto !== null ? `${tendenciaCosto > 0 ? '+' : ''}${tendenciaCosto.toFixed(1)}%` : 'Nuevo',
            trendUp: tendenciaCosto !== null ? tendenciaCosto < 0 : false, // Negativo es bueno para costos
            subtitle: tendenciaCosto !== null ? 'vs mes anterior' : 'Primer período'
          },
          { 
            title: 'Potencia Actual', 
            value: `${totalPotenciaActual.toFixed(0)} W`, 
            icon: <Zap size={24} />, 
            color: 'orange',
            trend: `Prom: ${potenciaPromedio.toFixed(0)}W`,
            trendUp: true,
            subtitle: 'de dispositivos activos'
          },
          { 
            title: 'Dispositivos', 
            value: dispositivos.length.toString(), 
            icon: <BarChart3 size={24} />, 
            color: 'purple',
            trend: `${dispositivos.filter(d => d.estadoActual === 'ON').length} activos`,
            trendUp: true,
            subtitle: 'monitoreando consumo'
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stat.color === 'blue' ? (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600') :
                stat.color === 'green' ? (isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-600') :
                stat.color === 'orange' ? (isDarkMode ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-50 text-orange-600') :
                (isDarkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-50 text-purple-600')
              }`}>
                {stat.icon}
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend.includes('Nuevo') ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') :
                stat.trendUp ? 'text-green-500' : 'text-red-500'
              }`}>
                {!stat.trend.includes('Nuevo') && (stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
                {stat.trend}
              </span>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.title}</p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts 3D */}
      {barChartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWrapper 
            title="Historial de Consumo 3D"
            subtitle={`Últimos ${historicoOrdenado.length} meses con datos reales`}
            isDarkMode={isDarkMode}
          >
            <ConsumoBarChart3D 
              data={barChartData}
              height={350}
              isDarkMode={isDarkMode}
            />
          </ChartWrapper>

          <ChartWrapper 
            title="Distribución por Dispositivo 3D"
            subtitle={`Consumo real de ${periodoDias[periodo]} días`}
            isDarkMode={isDarkMode}
          >
            {pieChartData.length > 0 ? (
              <ConsumoPieChart3D 
                data={pieChartData}
                height={350}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className={`flex flex-col items-center justify-center h-[350px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <AlertCircle size={40} className="mb-3 opacity-50" />
                <p>No hay datos de consumo en este período</p>
              </div>
            )}
          </ChartWrapper>
        </div>
      ) : (
        <div className={`p-12 rounded-2xl text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
          <AlertCircle size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Sin datos históricos
          </h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Tus dispositivos comenzarán a generar datos de consumo en cuanto se activen
          </p>
        </div>
      )}

      {/* Reportes de Consumo */}
      <div className="space-y-6">
        {consumoMesAnterior > 0 && (
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h2 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Análisis de Consumo
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Comparativas y estadísticas del periodo
            </p>
          </div>
        )}

        {/* Comparativa y Proyección */}
        {(consumoMesAnterior > 0 || proyeccionMes > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comparativa Mensual */}
            {consumoMesAnterior > 0 && mesActual && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Target size={20} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                  </div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Comparativa Mensual
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mes anterior</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {consumoMesAnterior.toFixed(2)} kWh
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Este mes</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {mesActual.consumoKwh.toFixed(2)} kWh
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full ${
                          mesActual.consumoKwh < consumoMesAnterior 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((mesActual.consumoKwh / consumoMesAnterior) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {ahorroMensual !== 0 && (
                    <div className={`p-3 rounded-lg ${
                      ahorroMensual > 0 
                        ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-50')
                        : (isDarkMode ? 'bg-red-900/30' : 'bg-red-50')
                    }`}>
                      <p className={`text-sm font-semibold ${
                        ahorroMensual > 0 
                          ? (isDarkMode ? 'text-green-400' : 'text-green-700')
                          : (isDarkMode ? 'text-red-400' : 'text-red-700')
                      }`}>
                        {ahorroMensual > 0 ? 'Ahorro: ' : 'Incremento: '}
                        {Math.abs(ahorroMensual).toFixed(2)} kWh
                        ({Math.abs(tendenciaConsumo || 0).toFixed(1)}%)
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Recomendaciones Clásicas (solo si no hay ML) */}
        {recomendaciones.filter(r => !r.ml).length > 0 && !showRecommendations && (
          <button
            onClick={() => setShowRecommendations(true)}
            className={`w-full p-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 hover:border-blue-500/50 text-gray-400 hover:text-blue-400' : 'border-gray-200 hover:border-blue-300 text-gray-500 hover:text-blue-600'} transition-colors`}
          >
            Ver recomendaciones ({recomendaciones.filter(r => !r.ml).length})
          </button>
        )}

        {recomendaciones.filter(r => !r.ml).length > 0 && showRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Lightbulb size={24} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recomendaciones
              </h3>
            </div>
            <button
              onClick={() => setShowRecommendations(false)}
              className={`text-sm px-3 py-1 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              Ocultar
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recomendaciones.filter(r => !r.ml).map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl ${
                  rec.tipo === 'alert' 
                    ? (isDarkMode ? 'bg-red-900/20' : 'bg-red-50')
                    : rec.tipo === 'warning'
                    ? (isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50')
                    : (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50')
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{rec.icono}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {rec.titulo}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {rec.mensaje}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        )}

        {/* ============================================ */}
        {/* SECCIÓN REPORTES TRADICIONALES */}
        {/* ============================================ */}

        {/* Ranking de Eficiencia */}
        {rankingEficiencia.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}
          >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
              <Award size={24} className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Ranking de Eficiencia Energética
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Dispositivos ordenados por eficiencia (kWh/hora)
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {rankingEficiencia.map((device, i) => (
              <div 
                key={i}
                className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                        i === 1 ? 'bg-gray-200 text-gray-700' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {device.nombre}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {device.consumoTotal.toFixed(3)} kWh total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {device.eficiencia.toFixed(4)}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      kWh/h
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        )}

        {/* Top Consumidores & Detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Dispositivos */}
        <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Top Consumidores
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Dispositivos con mayor consumo real (últimos {periodoDias[periodo]} días)
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {topDispositivos.length > 0 ? topDispositivos.map((d, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                    ${i === 0 ? 'bg-yellow-100 text-yellow-600' :
                      i === 1 ? 'bg-gray-200 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' :
                      isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {d.nombre}
                      </span>
                      <span className={`text-sm font-semibold ml-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {d.consumoKwh.toFixed(3)} kWh
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                        Costo: S/ {d.costoSoles.toFixed(2)}
                      </span>
                      <span className={`${d.estado === 'ON' ? 'text-green-500' : 'text-gray-500'}`}>
                        {d.potenciaActual.toFixed(0)}W {d.estado === 'ON' ? '●' : '○'}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min((d.consumoKwh / maxConsumo) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <p className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No hay datos de consumo disponibles
              </p>
            )}
          </div>
        </div>

        {/* Resumen de Costos */}
        <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Resumen de Costos
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Análisis real basado en tarifa Electrosur
              </p>
            </div>
            <FileText size={20} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Tarifa por kWh</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>S/ {TARIFA_ELECTROSUR}</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Consumo período</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {totalConsumoKwh.toFixed(3)} kWh
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Últimos {periodoDias[periodo]} días
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Costo promedio diario</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  S/ {(totalCostoReal / periodoDias[periodo]).toFixed(2)}
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white`}>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Costo total período</span>
                <span className="text-2xl font-bold">S/ {totalCostoReal.toFixed(2)}</span>
              </div>
              <p className="text-xs mt-2 text-blue-100">
                Proyección mensual: S/ {((totalCostoReal / periodoDias[periodo]) * 30).toFixed(2)}
              </p>
            </div>
          </div>

          <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            * Cálculo real: ∑(Potencia × Δt) × Tarifa Electrosur
          </p>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
