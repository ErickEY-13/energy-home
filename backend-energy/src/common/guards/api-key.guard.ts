import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// API Key global para todos los ESP32
const ESP32_API_KEY = 'energy-home-esp32-secret-key-2024';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { serialUnico, apiKey } = request.body;

    if (!serialUnico || !apiKey) {
      this.logger.warn('Intento de acceso sin serialUnico o apiKey');
      throw new UnauthorizedException('serialUnico y apiKey son requeridos');
    }

    // Validar API Key global
    if (apiKey !== ESP32_API_KEY) {
      this.logger.warn(`ApiKey inválida para dispositivo: ${serialUnico}`);
      throw new UnauthorizedException('ApiKey inválida');
    }

    // Buscar dispositivo por serialUnico
    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { serialUnico },
    });

    if (!dispositivo) {
      this.logger.warn(`Dispositivo no encontrado: ${serialUnico}`);
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    // Adjuntar dispositivo al request para uso posterior
    request.dispositivo = dispositivo;

    this.logger.log(`Autenticación exitosa del dispositivo: ${serialUnico}`);
    return true;
  }
}
