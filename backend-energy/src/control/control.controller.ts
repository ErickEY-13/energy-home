import {
  Controller,
  Post,
  Get,
  Param,
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
import { ControlService } from './control.service';
import { JwtAuthGuard, RolesGuard, Roles, GetUser } from '../common';

@ApiTags('Control - Dispositivos')
@Controller('device')
export class ControlController {
  constructor(private readonly controlService: ControlService) {}

  @Post(':id/on')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encender dispositivo' })
  @ApiParam({ name: 'id', description: 'ID del dispositivo a encender' })
  @ApiResponse({
    status: 200,
    description: 'Dispositivo encendido exitosamente',
    schema: {
      example: {
        message: 'Dispositivo encendido exitosamente',
        dispositivo: {
          id: 1,
          serialUnico: 'ESP32-001-ABC',
          nombre: 'Sensor Sala Principal',
          estadoActual: 'ON',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  @ApiResponse({ status: 404, description: 'Dispositivo no encontrado' })
  async encender(
    @GetUser('id') usuarioId: number,
    @Param('id', ParseIntPipe) dispositivoId: number,
  ) {
    return this.controlService.encenderDispositivo(usuarioId, dispositivoId);
  }

  @Post(':id/off')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apagar dispositivo' })
  @ApiParam({ name: 'id', description: 'ID del dispositivo a apagar' })
  @ApiResponse({
    status: 200,
    description: 'Dispositivo apagado exitosamente',
    schema: {
      example: {
        message: 'Dispositivo apagado exitosamente',
        dispositivo: {
          id: 1,
          serialUnico: 'ESP32-001-ABC',
          nombre: 'Sensor Sala Principal',
          estadoActual: 'OFF',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  @ApiResponse({ status: 404, description: 'Dispositivo no encontrado' })
  async apagar(
    @GetUser('id') usuarioId: number,
    @Param('id', ParseIntPipe) dispositivoId: number,
  ) {
    return this.controlService.apagarDispositivo(usuarioId, dispositivoId);
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estado actual del dispositivo' })
  @ApiParam({ name: 'id', description: 'ID del dispositivo' })
  @ApiResponse({
    status: 200,
    description: 'Estado del dispositivo',
    schema: {
      example: {
        id: 1,
        serialUnico: 'ESP32-001-ABC',
        nombre: 'Sensor Sala Principal',
        estadoActual: 'ON',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes acceso a este dispositivo' })
  @ApiResponse({ status: 404, description: 'Dispositivo no encontrado' })
  async getEstado(
    @GetUser('id') usuarioId: number,
    @Param('id', ParseIntPipe) dispositivoId: number,
  ) {
    return this.controlService.getEstadoDispositivo(usuarioId, dispositivoId);
  }
}
