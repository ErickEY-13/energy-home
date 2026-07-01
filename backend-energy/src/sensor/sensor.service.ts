import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SensorDataDto } from './dto';

// API Key global para todos los ESP32
const ESP32_API_KEY = 'energy-home-esp32-secret-key-2024';

@Injectable()
export class SensorService {
  private readonly logger = new Logger(SensorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recibirDatos(sensorData: SensorDataDto) {
    const { serialUnico, apiKey, voltaje, amperaje, potenciaWatts } = sensorData;

    // Validar API Key global
    if (apiKey !== ESP32_API_KEY) {
      this.logger.warn(`ApiKey inválida recibida para dispositivo: ${serialUnico}`);
      throw new UnauthorizedException('ApiKey inválida');
    }

    // Buscar dispositivo
    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { serialUnico },
    });

    if (!dispositivo) {
      this.logger.warn(`Dispositivo no encontrado: ${serialUnico}`);
      throw new UnauthorizedException('Dispositivo no registrado. Regístralo primero en el panel admin.');
    }

    // Actualizar estado a ON (está enviando datos = está activo)
    await this.prisma.dispositivo.update({
      where: { id: dispositivo.id },
      data: { estadoActual: 'ON' },
    });

    // Guardar medición en la base de datos
    const medicion = await this.prisma.medicion.create({
      data: {
        dispositivoId: dispositivo.id,
        voltaje,
        amperaje,
        potenciaWatts,
      },
    });

    this.logger.log(
      `Datos recibidos de ${serialUnico}: V=${voltaje}, A=${amperaje}, W=${potenciaWatts}`,
    );

    return {
      success: true,
      message: 'Datos recibidos correctamente',
      medicion: {
        id: medicion.id.toString(),
        voltaje: medicion.voltaje,
        amperaje: medicion.amperaje,
        potenciaWatts: medicion.potenciaWatts,
        fechaRegistro: medicion.fechaRegistro,
      },
      dispositivo: {
        id: dispositivo.id,
        nombre: dispositivo.nombre,
        estadoActual: 'ON',
      },
    };
  }

  // Obtener estado actual para que el ESP32 consulte
  async getEstadoDispositivo(serialUnico: string, apiKey: string) {
    // Validar API Key global
    if (apiKey !== ESP32_API_KEY) {
      throw new UnauthorizedException('ApiKey inválida');
    }

    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { serialUnico },
    });

    if (!dispositivo) {
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    return {
      serialUnico: dispositivo.serialUnico,
      nombre: dispositivo.nombre,
      estadoActual: dispositivo.estadoActual,
    };
  }
}
