import { Controller, Get, Post, Param, ParseIntPipe, UseGuards, Body } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  /**
   * GET /alertas/unread
   * Obtiene alertas no leídas
   */
  @Get('unread')
  @UseGuards(JwtAuthGuard)
  async getUnreadAlerts() {
    return this.alertasService.getUnreadAlerts();
  }

  /**
   * POST /alertas/mark-read/:id
   * Marca una alerta como leída
   */
  @Post('mark-read/:id')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id', ParseIntPipe) alertaId: number) {
    return this.alertasService.markAsRead(alertaId);
  }

  /**
   * POST /alertas/mark-all-read
   * Marca todas las alertas como leídas
   */
  @Post('mark-all-read')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead() {
    return this.alertasService.markAllAsRead();
  }

  /**
   * GET /alertas/stats
   * Obtiene estadísticas de alertas
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.alertasService.getAlertStats();
  }

  /**
   * POST /alertas/create
   * Endpoint PÚBLICO para que el servicio ML Python cree alertas
   */
  @Post('create')
  async createAlert(@Body() data: any) {
    return this.alertasService.createAlert(data);
  }
}
