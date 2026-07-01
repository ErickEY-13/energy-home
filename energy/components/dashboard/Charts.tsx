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

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
  action?: React.ReactNode;
}

export function ChartWrapper({ title, subtitle, children, className = '', isDarkMode = false, action }: ChartWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden
        ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100'}
        ${className}`}
    >
      <div className={`px-6 py-4 border-b flex items-center justify-between
        ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
        <div>
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          {subtitle && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}

// ============================================
// POWER REALTIME CHART (Potencia en tiempo real)
// ============================================
interface MedicionSimple {
  fechaRegistro: string;
  potenciaWatts: number;
  amperaje: number;
  voltaje: number;
}

interface PowerRealtimeChartProps {
  mediciones: MedicionSimple[] | Medicion[];
  height?: number;
  isDarkMode?: boolean;
}

export function PowerRealtimeChart({ mediciones, height = 300, isDarkMode = false }: PowerRealtimeChartProps) {
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: isDarkMode ? '#f3f4f6' : '#374151' },
      formatter: (params: { name: string; value: number; seriesName: string; color: string }[]) => {
        let html = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].name}</div>`;
        params.forEach(p => {
          const unit = p.seriesName.includes('Potencia') ? 'W' : 
                       p.seriesName.includes('Voltaje') ? 'V' : 'A';
          html += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${p.color};"></span>
            <span>${p.seriesName}: <strong>${p.value.toFixed(2)} ${unit}</strong></span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      data: ['Potencia (W)', 'Corriente (A)', 'Voltaje (V)'],
      bottom: 0,
      textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280' },
      itemWidth: 20,
      itemHeight: 10,
      itemGap: 20,
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '15%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: mediciones.map(m => {
        const date = new Date(m.fechaRegistro);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }),
      axisLine: { lineStyle: { color: isDarkMode ? '#374151' : '#e5e7eb' } },
      axisLabel: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 10, rotate: 45 },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: 'W',
        position: 'left',
        axisLine: { show: false },
        axisLabel: { color: isDarkMode ? '#9ca3af' : '#6b7280' },
        splitLine: { lineStyle: { color: isDarkMode ? '#374151' : '#f3f4f6', type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'A / V',
        position: 'right',
        axisLine: { show: false },
        axisLabel: { color: isDarkMode ? '#9ca3af' : '#6b7280' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Potencia (W)',
        type: 'line',
        data: mediciones.map(m => m.potenciaWatts),
        smooth: 0.4,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#06b6d4' },
          ]),
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: isDarkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.2)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0)' },
          ]),
        },
      },
      {
        name: 'Corriente (A)',
        type: 'line',
        yAxisIndex: 1,
        data: mediciones.map(m => m.amperaje),
        smooth: 0.4,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#10b981',
        },
      },
      {
        name: 'Voltaje (V)',
        type: 'line',
        yAxisIndex: 1,
        data: mediciones.map(m => m.voltaje),
        smooth: 0.4,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#f59e0b',
          type: 'dashed',
        },
      },
    ],
  }), [mediciones, isDarkMode]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

// ============================================
// CONSUMPTION BAR CHART (Consumo por hora/día)
// ============================================
interface ConsumptionBarChartProps {
  mediciones?: Medicion[];
  data?: { day: string; consumo: number }[];
  height?: number;
  isDarkMode?: boolean;
  period?: 'hour' | 'day';
}

export function ConsumptionBarChart({ mediciones, data, height = 300, isDarkMode = false }: ConsumptionBarChartProps) {
  const chartData = useMemo(() => {
    // Si se proporcionan datos directamente, usarlos
    if (data && data.length > 0) {
      return data.map(d => ({
        label: d.day,
        value: d.consumo,
      }));
    }

    // Si hay mediciones, procesarlas
    if (mediciones && mediciones.length > 0) {
      const grouped: Record<string, { potencia: number; count: number }> = {};
      
      mediciones.forEach(m => {
        const date = new Date(m.fechaRegistro);
        const key = date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        if (!grouped[key]) {
          grouped[key] = { potencia: 0, count: 0 };
        }
        grouped[key].potencia += m.potenciaWatts;
        grouped[key].count += 1;
      });

      return Object.entries(grouped).map(([time, d]) => ({
        label: time,
        value: Number(((d.potencia / d.count) / 1000).toFixed(3)),
      }));
    }

    return [];
  }, [mediciones, data]);

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: isDarkMode ? '#f3f4f6' : '#374151' },
      formatter: (params: { name: string; value: number }[]) => {
        const d = params[0];
        const costo = (d.value * 0.78).toFixed(3);
        return `<div style="font-weight: 600; margin-bottom: 8px;">${d.name}</div>
          <div>Energía: <strong>${d.value.toFixed(2)} kWh</strong></div>
          <div>Costo: <strong>S/ ${costo}</strong></div>`;
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
      data: chartData.map(d => d.label),
      axisLine: { lineStyle: { color: isDarkMode ? '#374151' : '#e5e7eb' } },
      axisLabel: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11, rotate: chartData.length > 7 ? 45 : 0 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'kWh',
      axisLine: { show: false },
      axisLabel: { color: isDarkMode ? '#9ca3af' : '#6b7280' },
      splitLine: { lineStyle: { color: isDarkMode ? '#374151' : '#f3f4f6', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: chartData.map(d => d.value),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#06b6d4' },
            { offset: 1, color: '#3b82f6' },
          ]),
        },
        barWidth: '60%',
      },
    ],
  }), [chartData, isDarkMode]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

// ============================================
// VOLTAGE GAUGE PREMIUM
// ============================================
interface GaugePremiumProps {
  value: number;
  title: string;
  unit: string;
  min?: number;
  max?: number;
  height?: number;
  isDarkMode?: boolean;
  color?: string;
}

export function GaugePremium({ 
  value, 
  title, 
  unit, 
  min = 0, 
  max = 250, 
  height = 200,
  isDarkMode = false,
  color = '#3b82f6'
}: GaugePremiumProps) {
  // Formatear valor para que no sea muy largo
  const displayValue = value >= 1000 ? value.toFixed(0) : value >= 100 ? value.toFixed(1) : value.toFixed(2);
  
  const option = useMemo(() => ({
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '85%',
        startAngle: 200,
        endAngle: -20,
        min,
        max,
        splitNumber: 5,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#06b6d4' },
            { offset: 0.5, color: color },
            { offset: 1, color: '#8b5cf6' },
          ]),
        },
        progress: {
          show: true,
          width: 18,
          roundCap: true,
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 18,
            color: [[1, isDarkMode ? '#374151' : '#e5e7eb']],
          },
          roundCap: true,
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '35%'],
          fontSize: 12,
          fontWeight: 500,
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
        detail: {
          valueAnimation: true,
          fontSize: 24,
          fontWeight: 'bold',
          offsetCenter: [0, '5%'],
          formatter: () => `${displayValue} ${unit}`,
          color: isDarkMode ? '#fff' : '#111827',
        },
        data: [{ value, name: title }],
      },
    ],
  }), [value, displayValue, title, unit, min, max, isDarkMode, color]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

// ============================================
// PIE CHART - Distribución de consumo
// ============================================
interface ConsumptionPieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  isDarkMode?: boolean;
}

export function ConsumptionPieChart({ data, height = 300, isDarkMode = false }: ConsumptionPieChartProps) {
  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: isDarkMode ? '#f3f4f6' : '#374151' },
      formatter: (params: { name: string; value: number; percent: number }) => {
        return `<div style="font-weight: 600;">${params.name}</div>
          <div>Consumo: <strong>${params.value.toFixed(2)} kWh</strong></div>
          <div>Porcentaje: <strong>${params.percent.toFixed(1)}%</strong></div>`;
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280' },
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDarkMode ? '#1f2937' : '#fff',
          borderWidth: 3,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#111827',
          },
        },
        labelLine: { show: false },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: { color: item.color || colors[index % colors.length] },
        })),
      },
    ],
  }), [data, isDarkMode]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
