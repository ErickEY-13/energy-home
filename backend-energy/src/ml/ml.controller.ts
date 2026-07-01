import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MlService } from './ml.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ml')
@UseGuards(JwtAuthGuard)
export class MlController {
  constructor(private readonly mlService: MlService) {}

  /**
   * GET /ml/analysis/:id
   * Obtiene análisis ML completo de un dispositivo
   */
  @Get('analysis/:id')
  async getAnalysis(
    @Param('id', ParseIntPipe) dispositivoId: number,
    @Query('limit') limit?: number,
  ) {
    return this.mlService.getAnalysis(dispositivoId, limit || 1000);
  }

  /**
   * GET /ml/last/:id
   * Obtiene el último análisis guardado de un dispositivo
   */
  @Get('last/:id')
  async getLastAnalysis(@Param('id', ParseIntPipe) dispositivoId: number) {
    return this.mlService.getLastAnalysis(dispositivoId);
  }

  /**
   * GET /ml/history/:id
   * Obtiene historial de análisis de un dispositivo
   */
  @Get('history/:id')
  async getHistory(
    @Param('id', ParseIntPipe) dispositivoId: number,
    @Query('limit') limit?: number,
  ) {
    return this.mlService.getAnalysisHistory(dispositivoId, limit || 50);
  }

  /**
   * GET /ml/stats
   * Obtiene estadísticas generales de ML
   */
  @Get('stats')
  async getStats() {
    return this.mlService.getMLStats();
  }

  /**
   * GET /ml/forecast
   * Obtiene forecast de múltiples dispositivos
   */
  @Get('forecast')
  async getForecast(@Query('ids') ids: string) {
    const dispositivoIds = ids.split(',').map((id) => parseInt(id, 10));
    return this.mlService.getForecastMultiple(dispositivoIds);
  }

  /**
   * GET /ml/health
   * Verifica estado del servicio ML
   */
  @Get('health')
  async checkHealth() {
    return this.mlService.checkMLServiceHealth();
  }
}
