import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdoptarDispositivoDto, CreateDispositivoDto, PersonalizarDispositivoDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DispositivosService {
  private readonly logger = new Logger(DispositivosService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Obtener todos los dispositivos del usuario autenticado (CON personalización)
  async findAllByUser(usuarioId: number) {
    const relaciones = await this.prisma.usuarioDispositivo.findMany({
      where: { usuarioId },
      include: {
        dispositivo: {
          select: {
            id: true,
            serialUnico: true,
            nombre: true,
            topicMqtt: true,
            estadoActual: true,
          },
        },
      },
    });

    // Devolver dispositivos con datos personalizados del usuario
    return relaciones.map((rel) => ({
      id: rel.dispositivo.id,
      serialUnico: rel.dispositivo.serialUnico,
      nombre: rel.dispositivo.nombre,
      nombrePersonalizado: rel.nombrePersonalizado,
      tipoObjeto: rel.tipoObjeto,
      ubicacion: rel.ubicacion,
      icono: rel.icono,
      topicMqtt: rel.dispositivo.topicMqtt,
      estadoActual: rel.dispositivo.estadoActual,
      fechaAsignado: rel.fechaAsignado,
    }));
  }

  // Obtener TODOS los dispositivos del sistema (solo admin)
  async findAllAdmin() {
    const dispositivos = await this.prisma.dispositivo.findMany({
      include: {
        usuarios: {
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { mediciones: true },
        },
      },
    });

    return dispositivos.map((d) => ({
      id: d.id,
      serialUnico: d.serialUnico,
      nombre: d.nombre,
      topicMqtt: d.topicMqtt,
      estadoActual: d.estadoActual,
      creadoEn: d.creadoEn,
      usuariosAsignados: d.usuarios.length,
      usuarios: d.usuarios.map((u) => ({
        ...u.usuario,
        nombrePersonalizado: u.nombrePersonalizado,
        tipoObjeto: u.tipoObjeto,
        ubicacion: u.ubicacion,
      })),
      totalMediciones: d._count.mediciones,
    }));
  }

  // Adoptar un dispositivo existente (con personalización opcional)
  async adoptar(usuarioId: number, adoptarDto: AdoptarDispositivoDto & PersonalizarDispositivoDto) {
    const { serialUnico, nombrePersonalizado, tipoObjeto, ubicacion, icono } = adoptarDto;

    // Buscar dispositivo por serialUnico
    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { serialUnico },
    });

    if (!dispositivo) {
      this.logger.warn(`Dispositivo no encontrado: ${serialUnico}`);
      throw new NotFoundException('Dispositivo no encontrado');
    }

    // Verificar si ya está adoptado por este usuario
    const existingRelation = await this.prisma.usuarioDispositivo.findUnique({
      where: {
        usuarioId_dispositivoId: {
          usuarioId,
          dispositivoId: dispositivo.id,
        },
      },
    });

    if (existingRelation) {
      throw new ConflictException('Ya has adoptado este dispositivo');
    }

    // Crear relación usuario-dispositivo con personalización
    const relacion = await this.prisma.usuarioDispositivo.create({
      data: {
        usuarioId,
        dispositivoId: dispositivo.id,
        nombrePersonalizado,
        tipoObjeto,
        ubicacion,
        icono,
      },
    });

    this.logger.log(`Usuario ${usuarioId} adoptó dispositivo ${serialUnico}`);

    return {
      message: 'Dispositivo adoptado exitosamente',
      dispositivo: {
        id: dispositivo.id,
        serialUnico: dispositivo.serialUnico,
        nombre: nombrePersonalizado || dispositivo.nombre,
        tipoObjeto: relacion.tipoObjeto,
        ubicacion: relacion.ubicacion,
        estadoActual: dispositivo.estadoActual,
      },
    };
  }

  // Personalizar un dispositivo ya adoptado
  async personalizar(usuarioId: number, dispositivoId: number, dto: PersonalizarDispositivoDto) {
    // Verificar que el usuario tiene acceso
    const relacion = await this.prisma.usuarioDispositivo.findUnique({
      where: {
        usuarioId_dispositivoId: {
          usuarioId,
          dispositivoId,
        },
      },
      include: {
        dispositivo: true,
      },
    });

    if (!relacion) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    // Actualizar personalización
    const updated = await this.prisma.usuarioDispositivo.update({
      where: {
        usuarioId_dispositivoId: {
          usuarioId,
          dispositivoId,
        },
      },
      data: {
        nombrePersonalizado: dto.nombrePersonalizado,
        tipoObjeto: dto.tipoObjeto,
        ubicacion: dto.ubicacion,
        icono: dto.icono,
      },
      include: {
        dispositivo: true,
      },
    });

    this.logger.log(`Usuario ${usuarioId} personalizó dispositivo ${dispositivoId}`);

    return {
      id: updated.dispositivo.id,
      serialUnico: updated.dispositivo.serialUnico,
      nombre: updated.dispositivo.nombre,
      nombrePersonalizado: updated.nombrePersonalizado,
      tipoObjeto: updated.tipoObjeto,
      ubicacion: updated.ubicacion,
      icono: updated.icono,
      topicMqtt: updated.dispositivo.topicMqtt,
      estadoActual: updated.dispositivo.estadoActual,
      fechaAsignado: updated.fechaAsignado,
    };
  }

  // Obtener lista de tipos de objetos disponibles
  getTiposObjeto() {
    return [
      { value: 'TV', label: 'Televisor', icon: 'tv' },
      { value: 'REFRIGERADOR', label: 'Refrigerador', icon: 'refrigerator' },
      { value: 'LAVADORA', label: 'Lavadora', icon: 'washing-machine' },
      { value: 'MICROONDAS', label: 'Microondas', icon: 'microwave' },
      { value: 'AIRE_ACONDICIONADO', label: 'Aire Acondicionado', icon: 'air-conditioner' },
      { value: 'VENTILADOR', label: 'Ventilador', icon: 'fan' },
      { value: 'COMPUTADORA', label: 'Computadora', icon: 'computer' },
      { value: 'LAPTOP', label: 'Laptop', icon: 'laptop' },
      { value: 'CONSOLA_VIDEOJUEGOS', label: 'Consola de Videojuegos', icon: 'gamepad' },
      { value: 'ILUMINACION', label: 'Iluminación', icon: 'lightbulb' },
      { value: 'ROUTER', label: 'Router/Modem', icon: 'router' },
      { value: 'CARGADOR', label: 'Cargador', icon: 'battery-charging' },
      { value: 'CAFETERA', label: 'Cafetera', icon: 'coffee' },
      { value: 'LICUADORA', label: 'Licuadora', icon: 'blender' },
      { value: 'HORNO', label: 'Horno', icon: 'oven' },
      { value: 'PLANCHA', label: 'Plancha', icon: 'iron' },
      { value: 'SECADORA', label: 'Secadora', icon: 'dryer' },
      { value: 'CALENTADOR', label: 'Calentador', icon: 'heater' },
      { value: 'BOMBA_AGUA', label: 'Bomba de Agua', icon: 'pump' },
      { value: 'OTRO', label: 'Otro', icon: 'device' },
    ];
  }

  // Crear un nuevo dispositivo (solo admin)
  async create(createDto: CreateDispositivoDto) {
    const { serialUnico, nombre, topicMqtt } = createDto;

    // Verificar si ya existe
    const existing = await this.prisma.dispositivo.findUnique({
      where: { serialUnico },
    });

    if (existing) {
      throw new ConflictException('El serialUnico ya está registrado');
    }

    const dispositivo = await this.prisma.dispositivo.create({
      data: {
        serialUnico,
        nombre,
        topicMqtt: topicMqtt || `energy/${serialUnico}/control`,
      },
    });

    this.logger.log(`Dispositivo creado: ${serialUnico}`);

    return {
      id: dispositivo.id,
      serialUnico: dispositivo.serialUnico,
      nombre: dispositivo.nombre,
      topicMqtt: dispositivo.topicMqtt,
      estadoActual: dispositivo.estadoActual,
      usuariosAsignados: 0,
      usuarios: [],
      totalMediciones: 0,
    };
  }

  // Verificar si un usuario tiene acceso a un dispositivo
  async verificarAcceso(usuarioId: number, dispositivoId: number): Promise<boolean> {
    const relacion = await this.prisma.usuarioDispositivo.findUnique({
      where: {
        usuarioId_dispositivoId: {
          usuarioId,
          dispositivoId,
        },
      },
    });

    return !!relacion;
  }

  // Obtener dispositivo por ID con verificación de acceso
  async findOneWithAccess(usuarioId: number, dispositivoId: number) {
    const tieneAcceso = await this.verificarAcceso(usuarioId, dispositivoId);

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { id: dispositivoId },
    });

    if (!dispositivo) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return dispositivo;
  }

  // Obtener dispositivo por ID (para uso interno)
  async findOne(dispositivoId: number) {
    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { id: dispositivoId },
    });

    if (!dispositivo) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return dispositivo;
  }

  // Actualizar estado del dispositivo
  async updateEstado(dispositivoId: number, estado: 'ON' | 'OFF') {
    return this.prisma.dispositivo.update({
      where: { id: dispositivoId },
      data: { estadoActual: estado },
    });
  }
}
