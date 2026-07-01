import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface ConsumoBarChart3DProps {
  data: Array<{ day: string; consumo: number }>;
  height?: number;
  isDarkMode?: boolean;
}

export const ConsumoBarChart3D: React.FC<ConsumoBarChart3DProps> = ({ 
  data, 
  height = 400, 
  isDarkMode = false 
}) => {
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      textStyle: {
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
        fontSize: 13
      },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        return `
          <div style="padding: 4px 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${p.name}</div>
            <div style="color: #3b82f6;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; margin-right: 6px;"></span>
              ${p.value.toFixed(3)} kWh
            </div>
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day),
      axisLine: {
        lineStyle: {
          color: isDarkMode ? '#4b5563' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        fontSize: 11,
        rotate: data.length > 8 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: 'kWh',
      nameTextStyle: {
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: isDarkMode ? '#4b5563' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? '#374151' : '#f3f4f6',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Consumo',
        type: 'bar',
        data: data.map(d => d.consumo),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#3b82f6' }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowBlur: 10,
          shadowColor: 'rgba(59, 130, 246, 0.3)',
          shadowOffsetY: 4
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#93c5fd' },
                { offset: 1, color: '#60a5fa' }
              ]
            },
            shadowBlur: 20,
            shadowColor: 'rgba(59, 130, 246, 0.5)'
          }
        },
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      }
    ]
  };

  return (
    <ReactECharts 
      option={option} 
      style={{ height: `${height}px`, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};

interface ConsumoPieChart3DProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  isDarkMode?: boolean;
}

export const ConsumoPieChart3D: React.FC<ConsumoPieChart3DProps> = ({ 
  data, 
  height = 400, 
  isDarkMode = false 
}) => {
  const colors = [
    ['#60a5fa', '#3b82f6'], // Azul
    ['#34d399', '#10b981'], // Verde
    ['#fbbf24', '#f59e0b'], // Amarillo
    ['#f87171', '#ef4444'], // Rojo
    ['#a78bfa', '#8b5cf6'], // Morado
    ['#fb923c', '#f97316'], // Naranja
    ['#2dd4bf', '#14b8a6'], // Teal
    ['#fb7185', '#f43f5e']  // Rosa
  ];

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      textStyle: {
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
        fontSize: 13
      },
      formatter: (params: any) => {
        return `
          <div style="padding: 4px 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
            <div style="color: ${params.color};">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${params.color}; border-radius: 50%; margin-right: 6px;"></span>
              ${params.value.toFixed(3)} kWh (${params.percent}%)
            </div>
          </div>
        `;
      }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: isDarkMode ? '#d1d5db' : '#374151',
        fontSize: 12
      },
      data: data.map(d => d.name)
    },
    series: [
      {
        name: 'Consumo',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderWidth: 3,
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 5,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        },
        label: {
          show: true,
          formatter: '{d}%',
          fontSize: 12,
          fontWeight: 'bold',
          color: isDarkMode ? '#f3f4f6' : '#1f2937'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 25,
            shadowOffsetX: 0,
            shadowOffsetY: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        data: data.map((d, i) => ({
          value: d.value,
          name: d.name,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: colors[i % colors.length][0] },
                { offset: 1, color: colors[i % colors.length][1] }
              ]
            }
          }
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDuration: 1200
      }
    ]
  };

  return (
    <ReactECharts 
      option={option} 
      style={{ height: `${height}px`, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};

interface PowerLineChart3DProps {
  data: Array<{ 
    fechaRegistro: string; 
    potenciaWatts: number; 
    amperaje?: number; 
    voltaje?: number;
  }>;
  height?: number;
  isDarkMode?: boolean;
}

export const PowerLineChart3D: React.FC<PowerLineChart3DProps> = ({ 
  data, 
  height = 400, 
  isDarkMode = false 
}) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      textStyle: {
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
        fontSize: 13
      },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const dataIndex = p.dataIndex;
        const item = data[dataIndex];
        return `
          <div style="padding: 4px 8px;">
            <div style="font-weight: 600; margin-bottom: 6px;">${formatDate(item.fechaRegistro)}</div>
            <div style="color: #3b82f6; margin-bottom: 2px;">
              ⚡ ${item.potenciaWatts.toFixed(2)} W
            </div>
            ${item.amperaje ? `<div style="color: #10b981; margin-bottom: 2px;">
              🔌 ${item.amperaje.toFixed(2)} A
            </div>` : ''}
            ${item.voltaje ? `<div style="color: #f59e0b;">
              ⚙️ ${item.voltaje.toFixed(2)} V
            </div>` : ''}
          </div>
        `;
      }
    },
    legend: {
      data: ['Potencia (W)', 'Corriente (A)', 'Voltaje (V)'],
      top: '5%',
      textStyle: {
        color: isDarkMode ? '#d1d5db' : '#374151',
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => formatDate(d.fechaRegistro)),
      axisLine: {
        lineStyle: {
          color: isDarkMode ? '#4b5563' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        fontSize: 10,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: isDarkMode ? '#4b5563' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? '#374151' : '#f3f4f6',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Potencia (W)',
        type: 'line' as const,
        smooth: true,
        data: data.map(d => d.potenciaWatts),
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#60a5fa' }
            ]
          },
          shadowBlur: 8,
          shadowColor: 'rgba(59, 130, 246, 0.4)',
          shadowOffsetY: 4
        },
        itemStyle: {
          color: '#3b82f6',
          borderWidth: 2,
          borderColor: '#ffffff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 15,
            shadowColor: 'rgba(59, 130, 246, 0.6)'
          }
        },
        animationDuration: 1500,
        animationEasing: 'cubicInOut'
      },
      ...(data[0]?.amperaje ? [{
        name: 'Corriente (A)',
        type: 'line' as const,
        smooth: true,
        data: data.map(d => d.amperaje || 0),
        lineStyle: {
          width: 2,
          color: '#10b981'
        },
        itemStyle: {
          color: '#10b981'
        },
        animationDuration: 1500,
        animationEasing: 'cubicInOut' as const,
        animationDelay: 200
      }] : []),
      ...(data[0]?.voltaje ? [{
        name: 'Voltaje (V)',
        type: 'line' as const,
        smooth: true,
        data: data.map(d => d.voltaje || 0),
        lineStyle: {
          width: 2,
          color: '#f59e0b'
        },
        itemStyle: {
          color: '#f59e0b'
        },
        animationDuration: 1500,
        animationEasing: 'cubicInOut' as const,
        animationDelay: 400
      }] : [])
    ]
  };

  return (
    <ReactECharts 
      option={option} 
      style={{ height: `${height}px`, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};
