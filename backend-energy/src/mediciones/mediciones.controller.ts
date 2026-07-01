import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MedicionesService } from './mediciones.service';
import { QueryMedicionesDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles, GetUser } from '../common';

@ApiTags('Mediciones')
@Controller('mediciones')
export class MedicionesController {
  constructor(private readonly medicionesService: MedicionesService) {}

  @Get(':dispositivoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener historial de mediciones de un dispositivo' })
  @ApiParam({ name: 'dispositivoId', description: 'ID del dispositivo' })
  @ApiResponse({
    status: 200,
    description: 'Historial de mediciones',
    schema: {
      example: {
        data: [
          {
            id: '1',
            voltaje: 120.5,
            amperaje: 2.5,
            potenciaWatts: 301.25,
            fechaRegistro: '2024-01-15T10:30:00.000Z',
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 20,
          totalPages: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  async findByDispositivo(
    @GetUser('id') usuarioId: number,
    @Param('dispositivoId', ParseIntPipe) dispositivoId: number,
    @Query() queryDto: QueryMedicionesDto,
  ) {
    return this.medicionesService.findByDispositivo(usuarioId, dispositivoId, queryDto);
  }

  @Get(':dispositivoId/estadisticas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de consumo de un dispositivo' })
  @ApiParam({ name: 'dispositivoId', description: 'ID del dispositivo' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del dispositivo',
    schema: {
      example: {
        totalMediciones: 1000,
        promedios: { voltaje: 120.5, amperaje: 2.5, potenciaWatts: 301.25 },
        maximos: { voltaje: 125.0, amperaje: 5.0, potenciaWatts: 625.0 },
        minimos: { voltaje: 115.0, amperaje: 0.5, potenciaWatts: 57.5 },
        ultimaMedicion: {
          id: '1000',
          voltaje: 120.5,
          amperaje: 2.5,
          potenciaWatts: 301.25,
          fechaRegistro: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  async getEstadisticas(
    @GetUser('id') usuarioId: number,
    @Param('dispositivoId', ParseIntPipe) dispositivoId: number,
  ) {
    return this.medicionesService.getEstadisticas(usuarioId, dispositivoId);
  }

  @Get(':dispositivoId/consumo-real')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calcular consumo real en kWh basado en mediciones reales' })
  @ApiParam({ name: 'dispositivoId', description: 'ID del dispositivo' })
  @ApiResponse({
    status: 200,
    description: 'Consumo real del dispositivo',
    schema: {
      example: {
        consumoKwh: 12.45,
        costoSoles: 9.71,
        horasMonitoreadas: 168.5,
        totalMediciones: 2500,
        periodoInicio: '2024-01-01T00:00:00.000Z',
        periodoFin: '2024-01-15T10:30:00.000Z',
        diasSolicitados: 30,
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  async getConsumoReal(
    @GetUser('id') usuarioId: number,
    @Param('dispositivoId', ParseIntPipe) dispositivoId: number,
    @Query('dias') dias?: string,
  ) {
    const diasNum = dias ? parseInt(dias, 10) : 30;
    return this.medicionesService.getConsumoReal(usuarioId, dispositivoId, diasNum);
  }

  @Get(':dispositivoId/consumo-mes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calcular consumo del mes actual (desde día 1)' })
  @ApiParam({ name: 'dispositivoId', description: 'ID del dispositivo' })
  @ApiResponse({
    status: 200,
    description: 'Consumo del mes actual',
    schema: {
      example: {
        consumoKwh: 5.23,
        costoSoles: 4.08,
        horasMonitoreadas: 48.5,
        totalMediciones: 1200,
        periodoInicio: '2024-12-01T00:00:00.000Z',
        periodoFin: '2024-12-05T14:30:00.000Z',
        diaActual: 5,
        diasEnMes: 31,
        progresoMes: 16,
        proyeccion: {
          kwhEstimado: 32.43,
          costoEstimado: 25.29,
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  async getConsumoMesActual(
    @GetUser('id') usuarioId: number,
    @Param('dispositivoId', ParseIntPipe) dispositivoId: number,
  ) {
    return this.medicionesService.getConsumoMesActual(usuarioId, dispositivoId);
  }

  @Get(':dispositivoId/historial-mensual')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener historial de consumo por mes (últimos N meses)' })
  @ApiParam({ name: 'dispositivoId', description: 'ID del dispositivo' })
  @ApiResponse({
    status: 200,
    description: 'Historial de consumo mensual',
    schema: {
      example: {
        historial: [
          {
            anio: 2025,
            mes: 12,
            nombreMes: 'diciembre 2025',
            consumoKwh: 3.14,
            costoSoles: 2.45,
            totalMediciones: 50,
            horasMonitoreadas: 24.5,
            esActual: true,
          },
          {
            anio: 2025,
            mes: 11,
            nombreMes: 'noviembre 2025',
            consumoKwh: 45.2,
            costoSoles: 35.26,
            totalMediciones: 1200,
            horasMonitoreadas: 168.5,
            esActual: false,
          },
        ],
        resumen: {
          totalKwh: 48.34,
          totalSoles: 37.71,
          promedioMensualKwh: 24.17,
          promedioMensualSoles: 18.85,
          mesesAnalizados: 2,
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  async getHistorialMensual(
    @GetUser('id') usuarioId: number,
    @Param('dispositivoId', ParseIntPipe) dispositivoId: number,
    @Query('meses') meses?: string,
  ) {
    const mesesNum = meses ? parseInt(meses, 10) : 3;
    return this.medicionesService.getHistorialMensual(usuarioId, dispositivoId, mesesNum);
  }
}
