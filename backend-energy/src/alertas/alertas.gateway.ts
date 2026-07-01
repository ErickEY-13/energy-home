import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // En producción, especificar dominio del frontend
    credentials: true,
  },
})
export class AlertasGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Socket> = new Map();

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`✅ Cliente conectado: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Cliente desconectado: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Enviar alerta a todos los clientes conectados (NO guarda en BD, solo emite)
   */
  sendAlert(alerta: any) {
    console.log(`🚨 Enviando alerta: ${alerta.tipo} - ${alerta.mensaje}`);
    this.server.emit('nueva-alerta', alerta);
  }

  /**
   * Enviar alerta a un usuario específico (por socket ID)
   */
  sendAlertToClient(clientId: string, alerta: any) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit('nueva-alerta', alerta);
    }
  }

  /**
   * Obtener número de clientes conectados
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  @SubscribeMessage('mark-alert-read')
  async handleMarkAlertRead(client: Socket, alertaId: number) {
    try {
      await this.prisma.alerta.update({
        where: { id: alertaId },
        data: { visto: true },
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('get-unread-alerts')
  async handleGetUnreadAlerts(client: Socket) {
    try {
      const alertas = await this.prisma.alerta.findMany({
        where: { visto: false },
        orderBy: { fechaCreacion: 'desc' },
        take: 50,
        include: {
          dispositivo: {
            select: {
              nombre: true,
              serialUnico: true,
            },
          },
        },
      });
      return { success: true, alertas };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
