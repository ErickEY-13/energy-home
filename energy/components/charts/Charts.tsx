'use client';

import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, GaugeChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { motion } from 'framer-motion';
import type { Medicion } from '@/lib/types';

// Registrar componentes de ECharts
echarts.use([
  LineChart,
  BarChart,
  GaugeChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({ title, children, className = '' }: ChartContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

interface PowerChartProps {
  mediciones: Medicion[];
  height?: number;
}

export function PowerChart({ mediciones, height = 300 }: PowerChartProps) {
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#999' },
      },
    },
    legend: {
      data: ['Potencia (W)', 'Corriente (A)'],
      bottom: 0,
      textStyle: { color: '#6b7280' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: mediciones.map(m => {
        const date = new Date(m.fechaRegistro);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      }),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        name: 'W',
        position: 'left',
        axisLine: { lineStyle: { color: '#3b82f6' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      {
        type: 'value',
        name: 'A',
        position: 'right',
        axisLine: { lineStyle: { color: '#10b981' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Potencia (W)',
        type: 'line',
        data: mediciones.map(m => m.potenciaWatts),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#8b5cf6' },
          ]),
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
          ]),
        },
      },
      {
        name: 'Corriente (A)',
        type: 'line',
        yAxisIndex: 1,
        data: mediciones.map(m => m.amperaje),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#10b981',
        },
      },
    ],
  }), [mediciones]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

interface EnergyChartProps {
  mediciones: Medicion[];
  height?: number;
}

export function EnergyChart({ mediciones, height = 300 }: EnergyChartProps) {
  // Agrupar por hora para mostrar consumo (potencia acumulada como proxy de energía)
  const hourlyData = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    mediciones.forEach(m => {
      const date = new Date(m.fechaRegistro);
      const key = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      // Usamos potenciaWatts / 1000 como estimación de kWh por medición
      grouped[key] = (grouped[key] || 0) + (m.potenciaWatts / 1000);
    });

    return Object.entries(grouped).map(([time, energia]) => ({
      time,
      energia: Number(energia.toFixed(3)),
    }));
  }, [mediciones]);

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: (params: { name: string; value: number }[]) => {
        const data = params[0];
        return `${data.name}<br/>Energía: <b>${data.value} kWh</b>`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: hourlyData.map(d => d.time),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: 'kWh',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        type: 'bar',
        data: hourlyData.map(d => d.energia),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fbbf24' },
            { offset: 1, color: '#f59e0b' },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#d97706' },
            ]),
          },
        },
      },
    ],
  }), [hourlyData]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

interface VoltageGaugeProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
}

export function VoltageGauge({ value, min = 0, max = 250, size = 200 }: VoltageGaugeProps) {
  const option = useMemo(() => ({
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min,
        max,
        splitNumber: 5,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#3b82f6' },
            { offset: 0.5, color: '#10b981' },
            { offset: 1, color: '#ef4444' },
          ]),
        },
        progress: {
          show: true,
          width: 20,
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#f3f4f6']],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          distance: -35,
          color: '#6b7280',
          fontSize: 10,
        },
        anchor: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '30%'],
          fontSize: 12,
          color: '#9ca3af',
        },
        detail: {
          valueAnimation: true,
          fontSize: 28,
          fontWeight: 'bold',
          offsetCenter: [0, '-5%'],
          formatter: (val: number) => `${val.toFixed(1)} V`,
          color: '#111827',
        },
        data: [{ value, name: 'Voltaje' }],
      },
    ],
  }), [value, min, max]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: size, width: size }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

interface PowerGaugeProps {
  value: number;
  max?: number;
  size?: number;
}

export function PowerGauge({ value, max = 5000, size = 200 }: PowerGaugeProps) {
  const percentage = (value / max) * 100;
  const color = percentage < 50 ? '#10b981' : percentage < 80 ? '#f59e0b' : '#ef4444';

  const option = useMemo(() => ({
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max,
        splitNumber: 5,
        itemStyle: { color },
        progress: {
          show: true,
          width: 20,
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#f3f4f6']],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          distance: -35,
          color: '#6b7280',
          fontSize: 10,
          formatter: (val: number) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val,
        },
        anchor: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '30%'],
          fontSize: 12,
          color: '#9ca3af',
        },
        detail: {
          valueAnimation: true,
          fontSize: 28,
          fontWeight: 'bold',
          offsetCenter: [0, '-5%'],
          formatter: (val: number) => val >= 1000 ? `${(val/1000).toFixed(2)} kW` : `${val.toFixed(0)} W`,
          color: '#111827',
        },
        data: [{ value, name: 'Potencia' }],
      },
    ],
  }), [value, max, color]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: size, width: size }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

// Gráfico de área con todas las métricas
interface FullMetricsChartProps {
  mediciones: Medicion[];
  height?: number;
}

export function FullMetricsChart({ mediciones, height = 400 }: FullMetricsChartProps) {
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      axisPointer: {
        type: 'cross',
        animation: true,
      },
    },
    legend: {
      data: ['Voltaje (V)', 'Corriente (A)', 'Potencia (W)'],
      bottom: 0,
      textStyle: { color: '#6b7280' },
      icon: 'roundRect',
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
          title: { zoom: 'Zoom', back: 'Restaurar' },
        },
        restore: { title: 'Restaurar' },
        saveAsImage: { title: 'Guardar imagen' },
      },
      right: 20,
      top: 0,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        start: 0,
        end: 100,
        bottom: 35,
        height: 20,
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: mediciones.map(m => {
        const date = new Date(m.fechaRegistro);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        name: 'V / W',
        position: 'left',
        axisLine: { show: true, lineStyle: { color: '#3b82f6' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'A',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: '#10b981' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Voltaje (V)',
        type: 'line',
        data: mediciones.map(m => m.voltaje),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#3b82f6',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
          ]),
        },
      },
      {
        name: 'Potencia (W)',
        type: 'line',
        data: mediciones.map(m => m.potenciaWatts),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: '#ec4899' },
          ]),
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
            { offset: 1, color: 'rgba(236, 72, 153, 0.05)' },
          ]),
        },
      },
      {
        name: 'Corriente (A)',
        type: 'line',
        yAxisIndex: 1,
        data: mediciones.map(m => m.amperaje),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#10b981',
          type: 'dashed',
        },
      },
    ],
  }), [mediciones]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

// Gráfico de consumo por hora (barras con gradiente)
interface HourlyConsumptionChartProps {
  mediciones: Medicion[];
  height?: number;
}

export function HourlyConsumptionChart({ mediciones, height = 300 }: HourlyConsumptionChartProps) {
  const hourlyData = useMemo(() => {
    const grouped: Record<string, { count: number; totalWatts: number }> = {};
    
    mediciones.forEach(m => {
      const date = new Date(m.fechaRegistro);
      const hour = date.getHours().toString().padStart(2, '0') + ':00';
      if (!grouped[hour]) {
        grouped[hour] = { count: 0, totalWatts: 0 };
      }
      grouped[hour].count++;
      grouped[hour].totalWatts += m.potenciaWatts;
    });

    // Ordenar por hora
    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hour, data]) => ({
        hour,
        avgWatts: data.totalWatts / data.count,
        kWh: (data.totalWatts / data.count / 1000) * (data.count / 60), // Estimación kWh
      }));
  }, [mediciones]);

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: (params: { name: string; value: number; dataIndex: number }[]) => {
        const data = params[0];
        const hourData = hourlyData[data.dataIndex];
        return `<strong>${data.name}</strong><br/>
                Potencia Promedio: <b>${hourData.avgWatts.toFixed(0)} W</b><br/>
                Energía Estimada: <b>${hourData.kWh.toFixed(3)} kWh</b>`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: hourlyData.map(d => d.hour),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 11, rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: 'W',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: hourlyData.map(d => d.avgWatts),
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: (params: { dataIndex: number }) => {
            const colors = [
              new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#059669' },
              ]),
              new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#d97706' },
              ]),
              new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ef4444' },
                { offset: 1, color: '#dc2626' },
              ]),
            ];
            const value = hourlyData[params.dataIndex].avgWatts;
            const maxValue = Math.max(...hourlyData.map(d => d.avgWatts));
            const ratio = value / maxValue;
            if (ratio < 0.5) return colors[0];
            if (ratio < 0.8) return colors[1];
            return colors[2];
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ],
  }), [hourlyData]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

// Mini gauge para mostrar un valor
interface MiniGaugeProps {
  value: number;
  max: number;
  title: string;
  unit: string;
  color?: string;
  size?: number;
}

export function MiniGauge({ value, max, title, unit, color = '#3b82f6', size = 150 }: MiniGaugeProps) {
  const option = useMemo(() => ({
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max,
        splitNumber: 4,
        radius: '90%',
        center: ['50%', '70%'],
        itemStyle: { color },
        progress: {
          show: true,
          width: 12,
          roundCap: true,
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, '#f3f4f6']],
          },
          roundCap: true,
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '0%'],
          fontSize: 11,
          color: '#9ca3af',
        },
        detail: {
          valueAnimation: true,
          fontSize: 18,
          fontWeight: 'bold',
          offsetCenter: [0, '-25%'],
          formatter: `{value} ${unit}`,
          color: '#111827',
        },
        data: [{ value: Number(value.toFixed(1)), name: title }],
      },
    ],
  }), [value, max, title, unit, color]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: size, width: size }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

// Gráfico de detección de anomalías en tiempo real (similar al de Web/app.js)
export interface AnomalyDataPoint {
  timestamp: string;
  voltaje: number;
  amperaje: number;
  potencia: number;
  isAnomaly: boolean;
}

interface AnomalyDetectionChartProps {
  data: AnomalyDataPoint[];
  height?: number;
  isDarkMode?: boolean;
}

export function AnomalyDetectionChart({ data, height = 350, isDarkMode = false }: AnomalyDetectionChartProps) {
  const option = useMemo(() => {
    const timestamps = data.map(d => d.timestamp);
    const voltajeData = data.map(d => d.voltaje);
    const amperajeData = data.map(d => d.amperaje);
    const potenciaData = data.map(d => d.potencia);
    // Anomalías: mostramos el valor de potencia donde hay anomalía, null si no
    const anomalyData = data.map(d => d.isAnomaly ? d.potencia : null);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#475569' : '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: isDarkMode ? '#e2e8f0' : '#374151' },
        axisPointer: {
          type: 'cross',
          crossStyle: { color: isDarkMode ? '#94a3b8' : '#999' },
        },
        formatter: (params: any[]) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((p: any) => {
            if (p.value !== null && p.value !== undefined) {
              const icon = p.seriesName === 'Anomalía' 
                ? '🔴' 
                : `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:5px;"></span>`;
              result += `${icon}${p.seriesName}: <strong>${p.value.toFixed(2)}</strong><br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        data: ['Voltaje (V)', 'Amperaje (A)', 'Potencia (W)', 'Anomalía'],
        bottom: 0,
        textStyle: { color: isDarkMode ? '#94a3b8' : '#6b7280' },
        icon: 'roundRect',
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLine: { lineStyle: { color: isDarkMode ? '#475569' : '#e5e7eb' } },
        axisLabel: { 
          color: isDarkMode ? '#94a3b8' : '#6b7280', 
          fontSize: 10,
          rotate: 45,
        },
        boundaryGap: false,
      },
      yAxis: [
        {
          type: 'value',
          name: 'V / W',
          position: 'left',
          axisLine: { lineStyle: { color: '#3b82f6' } },
          axisLabel: { color: isDarkMode ? '#94a3b8' : '#6b7280' },
          splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#f3f4f6' } },
        },
        {
          type: 'value',
          name: 'A',
          position: 'right',
          axisLine: { lineStyle: { color: '#f59e0b' } },
          axisLabel: { color: isDarkMode ? '#94a3b8' : '#6b7280' },
          splitLine: { show: false },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          show: true,
          height: 20,
          bottom: 35,
          start: 0,
          end: 100,
          textStyle: { color: isDarkMode ? '#94a3b8' : '#6b7280' },
          borderColor: isDarkMode ? '#475569' : '#e5e7eb',
          fillerColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        },
      ],
      series: [
        {
          name: 'Voltaje (V)',
          type: 'line',
          data: voltajeData,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: '#3b82f6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]),
          },
        },
        {
          name: 'Amperaje (A)',
          type: 'line',
          yAxisIndex: 1,
          data: amperajeData,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: '#f59e0b' },
        },
        {
          name: 'Potencia (W)',
          type: 'line',
          data: potenciaData,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: '#10b981' },
        },
        {
          name: 'Anomalía',
          type: 'scatter',
          data: anomalyData,
          symbolSize: 15,
          itemStyle: { 
            color: '#ef4444',
            shadowBlur: 10,
            shadowColor: 'rgba(239, 68, 68, 0.5)',
          },
          emphasis: {
            scale: 1.5,
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(239, 68, 68, 0.8)',
            },
          },
        },
      ],
    };
  }, [data, isDarkMode]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

// Gráfico de línea con barras de anomalías
interface AnomalyTimelineChartProps {
  data: AnomalyDataPoint[];
  height?: number;
  isDarkMode?: boolean;
}

export function AnomalyTimelineChart({ data, height = 250, isDarkMode = false }: AnomalyTimelineChartProps) {
  const option = useMemo(() => {
    const timestamps = data.map(d => d.timestamp);
    const potenciaData = data.map(d => d.potencia);
    // Anomaly bars: show potencia as bar if anomaly, else 0
    const anomalyBars = data.map(d => d.isAnomaly ? d.potencia : 0);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#475569' : '#e5e7eb',
        textStyle: { color: isDarkMode ? '#e2e8f0' : '#374151' },
      },
      legend: {
        data: ['Potencia Normal', 'Anomalía Detectada'],
        bottom: 0,
        textStyle: { color: isDarkMode ? '#94a3b8' : '#6b7280' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLine: { lineStyle: { color: isDarkMode ? '#475569' : '#e5e7eb' } },
        axisLabel: { 
          color: isDarkMode ? '#94a3b8' : '#6b7280', 
          fontSize: 10,
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Potencia (W)',
        axisLine: { lineStyle: { color: isDarkMode ? '#475569' : '#e5e7eb' } },
        axisLabel: { color: isDarkMode ? '#94a3b8' : '#6b7280' },
        splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#f3f4f6' } },
      },
      series: [
        {
          name: 'Potencia Normal',
          type: 'line',
          data: potenciaData,
          smooth: true,
          showSymbol: false,
          lineStyle: { 
            width: 3, 
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' },
            ]),
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: isDarkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]),
          },
        },
        {
          name: 'Anomalía Detectada',
          type: 'bar',
          data: anomalyBars,
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ef4444' },
              { offset: 1, color: '#dc2626' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }, [data, isDarkMode]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

export default { 
  PowerChart, 
  EnergyChart, 
  VoltageGauge, 
  PowerGauge, 
  ChartContainer,
  FullMetricsChart,
  HourlyConsumptionChart,
  MiniGauge,
  AnomalyDetectionChart,
  AnomalyTimelineChart,
};
