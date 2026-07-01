import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertasGateway } from './alertas.gateway';

@Injectable()
export class AlertasService {
  constructor(
    private prisma: PrismaService,
    private alertasGateway: AlertasGateway,
  ) {}

  /**
   * Crear y enviar alerta en tiempo real
   */
  async createAlert(data: {
    dispositivoId: number;
    tipo: 'anomalia' | 'consumo_alto' | 'spike' | 'prediccion' | 'eficiencia';
    severidad: 'low' | 'medium' | 'high';
    mensaje: string;
    datos?: any;
  }) {
    // Guardar en BD primero
    const alerta = await this.prisma.alerta.create({
      data,
      include: {
        dispositivo: {
          select: {
            nombre: true,
            serialUnico: true,
          },
        },
      },
    });

    // Enviar vía WebSocket (sin duplicar en BD)
    this.alertasGateway.sendAlert(alerta);

    return alerta;
  }

  /**
   * Obtener alertas no leídas
   */
  async getUnreadAlerts(limit: number = 50) {
    return this.prisma.alerta.findMany({
      where: { visto: false },
      orderBy: { fechaCreacion: 'desc' },
      take: limit,
      include: {
        dispositivo: {
          select: {
            nombre: true,
            serialUnico: true,
          },
        },
      },
    });
  }

  /**
   * Marcar alerta como leída
   */
  async markAsRead(alertaId: number) {
    return this.prisma.alerta.update({
      where: { id: alertaId },
      data: { visto: true },
    });
  }

  /**
   * Marcar todas las alertas como leídas
   */
  async markAllAsRead() {
    return this.prisma.alerta.updateMany({
      where: { visto: false },
      data: { visto: true },
    });
  }

  /**
   * Obtener estadísticas de alertas
   */
  async getAlertStats() {
    const total = await this.prisma.alerta.count();
    const noLeidas = await this.prisma.alerta.count({
      where: { visto: false },
    });

    // Por severidad (últimas 24h)
    const porSeveridad = await this.prisma.alerta.groupBy({
      by: ['severidad'],
      _count: true,
      where: {
        fechaCreacion: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // Por tipo (últimas 24h)
    const porTipo = await this.prisma.alerta.groupBy({
      by: ['tipo'],
      _count: true,
      where: {
        fechaCreacion: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      total,
      noLeidas,
      distribucionSeveridad: porSeveridad.reduce((acc, curr) => {
        acc[curr.severidad] = curr._count;
        return acc;
      }, {}),
      distribucionTipo: porTipo.reduce((acc, curr) => {
        acc[curr.tipo] = curr._count;
        return acc;
      }, {}),
    };
  }

  /**
   * Eliminar alertas antiguas (limpieza)
   */
  async cleanOldAlerts(daysOld: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    return this.prisma.alerta.deleteMany({
      where: {
        fechaCreacion: {
          lt: date,
        },
        visto: true, // Solo eliminar las ya leídas
      },
    });
  }
}
