import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SensorService } from './sensor.service';
import { SensorDataDto } from './dto';

@ApiTags('Sensor - ESP32')
@Controller('SensorData')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Recibir datos del sensor ESP32',
    description: 'Endpoint para que el ESP32 envíe datos de medición. No requiere JWT, usa apiKey del dispositivo.'
  })
  @ApiBody({ type: SensorDataDto })
  @ApiResponse({
    status: 201,
    description: 'Datos recibidos correctamente',
    schema: {
      example: {
        success: true,
        message: 'Datos recibidos correctamente',
        medicion: {
          id: '1',
          voltaje: 120.5,
          amperaje: 2.5,
          potenciaWatts: 301.25,
          fechaRegistro: '2024-01-15T10:30:00.000Z',
        },
        dispositivo: {
          id: 1,
          nombre: 'Sensor Sala Principal',
          estadoActual: 'ON',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Dispositivo no autorizado o ApiKey inválida' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async recibirDatos(@Body() sensorData: SensorDataDto) {
    return this.sensorService.recibirDatos(sensorData);
  }

  @Get('status')
  @ApiOperation({ 
    summary: 'Consultar estado del dispositivo',
    description: 'El ESP32 puede consultar su estado actual (ON/OFF) para sincronizarse'
  })
  @ApiQuery({ name: 'serialUnico', description: 'Serial único del dispositivo' })
  @ApiQuery({ name: 'apiKey', description: 'API Key del dispositivo' })
  @ApiResponse({
    status: 200,
    description: 'Estado del dispositivo',
    schema: {
      example: {
        serialUnico: 'ESP32-001-ABC',
        nombre: 'Sensor Sala Principal',
        estadoActual: 'ON',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Dispositivo no autorizado o ApiKey inválida' })
  async getEstado(
    @Query('serialUnico') serialUnico: string,
    @Query('apiKey') apiKey: string,
  ) {
    return this.sensorService.getEstadoDispositivo(serialUnico, apiKey);
  }
}
