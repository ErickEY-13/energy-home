import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class MlService {
  private readonly mlApiUrl: string;

  constructor(private prisma: PrismaService) {
    this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
  }

  /**
   * Obtiene análisis ML de un dispositivo desde el servicio Python
   */
  async getAnalysis(dispositivoId: number, limit: number = 1000) {
    try {
      // Llamar al servicio ML Python
      const response = await axios.get(
        `${this.mlApiUrl}/analysis?device_id=${dispositivoId}&limit=${limit}`,
        { timeout: 30000 }
      );

      const mlData = response.data;

      // Calcular severidad basada en anomalías
      const severidad = this.calculateSeverity(
        mlData.analysis?.anomaly_count_recent || 0,
        mlData.recommendations || []
      );

      // Guardar análisis en BD
      const analisis = await this.prisma.analisisML.create({
        data: {
          dispositivoId,
          anomaliasDetectadas: mlData.analysis?.anomaly_count_recent || 0,
          severidad,
          forecastKwh: mlData.analysis?.forecast?.estimated_kwh || null,
          forecastCosto: mlData.analysis?.forecast?.estimated_cost || null,
          recomendaciones: mlData.recommendations || [],
          datosAnalisis: mlData.analysis || {},
        },
      });

      return {
        analisis,
        mlData,
      };
    } catch (error) {
      console.error('Error obteniendo análisis ML:', error.message);
      throw new HttpException(
        'Error comunicándose con servicio ML',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Obtiene el último análisis ML de un dispositivo
   */
  async getLastAnalysis(dispositivoId: number) {
    return this.prisma.analisisML.findFirst({
      where: { dispositivoId },
      orderBy: { fechaAnalisis: 'desc' },
      include: {
        dispositivo: {
          select: {
            id: true,
            nombre: true,
            serialUnico: true,
            estadoActual: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene historial de análisis ML de un dispositivo
   */
  async getAnalysisHistory(dispositivoId: number, limit: number = 50) {
    return this.prisma.analisisML.findMany({
      where: { dispositivoId },
      orderBy: { fechaAnalisis: 'desc' },
      take: limit,
    });
  }

  /**
   * Obtiene estadísticas ML de todos los dispositivos
   */
  async getMLStats() {
    const totalAnalisis = await this.prisma.analisisML.count();
    const alertasActivas = await this.prisma.alerta.count({
      where: { visto: false },
    });

    const analisisRecientes = await this.prisma.analisisML.findMany({
      where: {
        fechaAnalisis: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
        },
      },
      include: {
        dispositivo: {
          select: { nombre: true },
        },
      },
      orderBy: { fechaAnalisis: 'desc' },
      take: 10,
    });

    // Contar por severidad
    const porSeveridad = await this.prisma.analisisML.groupBy({
      by: ['severidad'],
      _count: true,
      where: {
        fechaAnalisis: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Última semana
        },
      },
    });

    return {
      totalAnalisis,
      alertasActivas,
      analisisRecientes,
      distribucionSeveridad: porSeveridad.reduce((acc, curr) => {
        acc[curr.severidad] = curr._count;
        return acc;
      }, {}),
    };
  }

  /**
   * Obtiene forecast de múltiples dispositivos
   */
  async getForecastMultiple(dispositivoIds: number[]) {
    const forecasts = await Promise.all(
      dispositivoIds.map(async (id) => {
        const lastAnalisis = await this.getLastAnalysis(id);
        return {
          dispositivoId: id,
          forecastKwh: lastAnalisis?.forecastKwh || 0,
          forecastCosto: lastAnalisis?.forecastCosto || 0,
          fechaAnalisis: lastAnalisis?.fechaAnalisis,
        };
      }),
    );

    return forecasts;
  }

  /**
   * Calcula severidad basada en anomalías y recomendaciones
   */
  private calculateSeverity(
    anomalies: number,
    recommendations: any[],
  ): 'low' | 'medium' | 'high' {
    // Si hay recomendaciones de severidad alta
    const hasHighSeverity = recommendations.some(
      (rec) => rec.severity === 'high',
    );
    if (hasHighSeverity || anomalies >= 5) {
      return 'high';
    }

    // Si hay múltiples anomalías o recomendaciones medium
    const hasMediumSeverity = recommendations.some(
      (rec) => rec.severity === 'medium',
    );
    if (hasMediumSeverity || anomalies >= 2) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Verifica estado del servicio ML
   */
  async checkMLServiceHealth() {
    try {
      const response = await axios.get(`${this.mlApiUrl}/status`, {
        timeout: 5000,
      });
      return {
        status: 'ok',
        mlService: response.data,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Servicio ML no disponible',
      };
    }
  }
}
