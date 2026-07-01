import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { DispositivosService } from '../dispositivos/dispositivos.service';
import { ControlDispositivoDto, AccionControl } from './dto';

@Injectable()
export class ControlService {
  private readonly logger = new Logger(ControlService.name);

  constructor(
    private readonly dispositivosService: DispositivosService,
  ) {}

  async controlarDispositivo(
    usuarioId: number,
    dispositivoId: number,
    controlDto: ControlDispositivoDto,
  ) {
    const { accion } = controlDto;

    // Verificar acceso del usuario al dispositivo
    const tieneAcceso = await this.dispositivosService.verificarAcceso(
      usuarioId,
      dispositivoId,
    );

    if (!tieneAcceso) {
      this.logger.warn(
        `Usuario ${usuarioId} intentó controlar dispositivo ${dispositivoId} sin acceso`,
      );
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    // Obtener dispositivo
    const dispositivo = await this.dispositivosService.findOne(dispositivoId);

    // Actualizar estado en la base de datos
    await this.dispositivosService.updateEstado(
      dispositivoId,
      accion as 'ON' | 'OFF',
    );

    this.logger.log(
      `Control ejecutado: Usuario ${usuarioId} -> Dispositivo ${dispositivoId} -> ${accion}`,
    );

    return {
      message: `Dispositivo ${accion === 'ON' ? 'encendido' : 'apagado'} exitosamente`,
      dispositivo: {
        id: dispositivo.id,
        serialUnico: dispositivo.serialUnico,
        nombre: dispositivo.nombre,
        estadoActual: accion,
      },
    };
  }

  // Encender dispositivo
  async encenderDispositivo(usuarioId: number, dispositivoId: number) {
    return this.controlarDispositivo(usuarioId, dispositivoId, { accion: AccionControl.ON });
  }

  // Apagar dispositivo
  async apagarDispositivo(usuarioId: number, dispositivoId: number) {
    return this.controlarDispositivo(usuarioId, dispositivoId, { accion: AccionControl.OFF });
  }

  // Obtener estado actual del dispositivo
  async getEstadoDispositivo(usuarioId: number, dispositivoId: number) {
    const tieneAcceso = await this.dispositivosService.verificarAcceso(
      usuarioId,
      dispositivoId,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    const dispositivo = await this.dispositivosService.findOne(dispositivoId);

    return {
      id: dispositivo.id,
      serialUnico: dispositivo.serialUnico,
      nombre: dispositivo.nombre,
      estadoActual: dispositivo.estadoActual,
    };
  }
}
