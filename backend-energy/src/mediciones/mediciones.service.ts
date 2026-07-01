import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicionDto, QueryMedicionesDto } from './dto';
import { DispositivosService } from '../dispositivos/dispositivos.service';

@Injectable()
export class MedicionesService {
  private readonly logger = new Logger(MedicionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispositivosService: DispositivosService,
  ) {}

  // Crear medición desde sensor (ESP32)
  async createFromSensor(dispositivoId: number, medicionData: Omit<CreateMedicionDto, 'serialUnico' | 'apiKey'>) {
    const { voltaje, amperaje, potenciaWatts } = medicionData;

    const medicion = await this.prisma.medicion.create({
      data: {
        dispositivoId,
        voltaje,
        amperaje,
        potenciaWatts,
      },
    });

    this.logger.log(`Medición registrada para dispositivo ${dispositivoId}`);

    return {
      message: 'Medición registrada exitosamente',
      medicion: {
        id: medicion.id.toString(),
        voltaje: medicion.voltaje,
        amperaje: medicion.amperaje,
        potenciaWatts: medicion.potenciaWatts,
        fechaRegistro: medicion.fechaRegistro,
      },
    };
  }

  // Obtener historial de mediciones de un dispositivo
  async findByDispositivo(
    usuarioId: number,
    dispositivoId: number,
    queryDto: QueryMedicionesDto,
  ) {
    // Verificar que el usuario tiene acceso al dispositivo
    const tieneAcceso = await this.dispositivosService.verificarAcceso(
      usuarioId,
      dispositivoId,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    const { fechaInicio, fechaFin, page = 1, limit = 20 } = queryDto;

    // Construir filtro de fechas
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (fechaInicio) {
      dateFilter.gte = new Date(fechaInicio);
    }
    if (fechaFin) {
      dateFilter.lte = new Date(fechaFin);
    }

    const where = {
      dispositivoId,
      ...(Object.keys(dateFilter).length > 0 && { fechaRegistro: dateFilter }),
    };

    // Obtener total de registros
    const total = await this.prisma.medicion.count({ where });

    // Obtener mediciones con paginación
    const mediciones = await this.prisma.medicion.findMany({
      where,
      orderBy: { fechaRegistro: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: mediciones.map((m) => ({
        id: m.id.toString(),
        voltaje: m.voltaje,
        amperaje: m.amperaje,
        potenciaWatts: m.potenciaWatts,
        fechaRegistro: m.fechaRegistro,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener estadísticas de consumo
  async getEstadisticas(usuarioId: number, dispositivoId: number) {
    // Verificar acceso
    const tieneAcceso = await this.dispositivosService.verificarAcceso(
      usuarioId,
      dispositivoId,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    // Obtener estadísticas
    const stats = await this.prisma.medicion.aggregate({
      where: { dispositivoId },
      _avg: {
        voltaje: true,
        amperaje: true,
        potenciaWatts: true,
      },
      _max: {
        voltaje: true,
        amperaje: true,
        potenciaWatts: true,
      },
      _min: {
        voltaje: true,
        amperaje: true,
        potenciaWatts: true,
      },
      _count: true,
    });

    // Última medición
    const ultimaMedicion = await this.prisma.medicion.findFirst({
      where: { dispositivoId },
      orderBy: { fechaRegistro: 'desc' },
    });

    return {
      totalMediciones: stats._count,
      promedios: {
        voltaje: stats._avg.voltaje || 0,
        amperaje: stats._avg.amperaje || 0,
        potenciaWatts: stats._avg.potenciaWatts || 0,
      },
      maximos: {
        voltaje: stats._max.voltaje || 0,
        amperaje: stats._max.amperaje || 0,
        potenciaWatts: stats._max.potenciaWatts || 0,
      },
      minimos: {
        voltaje: stats._min.voltaje || 0,
        amperaje: stats._min.amperaje || 0,
        potenciaWatts: stats._min.potenciaWatts || 0,
      },
      ultimaMedicion: ultimaMedicion
        ? {
            id: ultimaMedicion.id.toString(),
            voltaje: ultimaMedicion.voltaje,
            amperaje: ultimaMedicion.amperaje,
            potenciaWatts: ultimaMedicion.potenciaWatts,
            fechaRegistro: ultimaMedicion.fechaRegistro,
          }
        : null,
    };
  }

  // Calcular consumo REAL en kWh basado en mediciones con timestamps
  async getConsumoReal(usuarioId: number, dispositivoId: number, dias: number = 30) {
    // Verificar acceso
    const tieneAcceso = await this.dispositivosService.verificarAcceso(
      usuarioId,
      dispositivoId,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    // Fecha de inicio (hace X días)
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    // Obtener TODAS las mediciones del período ordenadas por fecha
    const mediciones = await this.prisma.medicion.findMany({
      where: {
        dispositivoId,
        fechaRegistro: { gte: fechaInicio },
      },
      orderBy: { fechaRegistro: 'asc' },
      select: {
        potenciaWatts: true,
        fechaRegistro: true,
      },
    });

    if (mediciones.length < 2) {
      return {
        consumoKwh: 0,
        costoSoles: 0,
        horasMonitoreadas: 0,
        totalMediciones: mediciones.length,
        periodoInicio: fechaInicio,
        periodoFin: new Date(),
        mensaje: 'No hay suficientes mediciones para calcular consumo real',
      };
    }

    // Calcular kWh real: Σ (Potencia × Δt)
    // Usamos el método del trapecio para mayor precisión
    let consumoWh = 0;
    let horasTotales = 0;

    for (let i = 1; i < mediciones.length; i++) {
      const medicionAnterior = mediciones[i - 1];
      const medicionActual = mediciones[i];

      // Diferencia de tiempo en horas
      const diffMs = medicionActual.fechaRegistro.getTime() - medicionAnterior.fechaRegistro.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

      // Solo considerar intervalos menores a 6 horas (evitar gaps de días sin datos)
      if (diffHoras <= 6) {
        // Promedio de potencia entre las dos mediciones (método del trapecio)
        const potenciaPromedio = (medicionAnterior.potenciaWatts + medicionActual.potenciaWatts) / 2;
        
        // Wh = W × h
        consumoWh += potenciaPromedio * diffHoras;
        horasTotales += diffHoras;
      }
    }

    // Convertir Wh a kWh
    const consumoKwh = consumoWh / 1000;

    // Calcular costo con tarifa Electrosur
    const TARIFA_ELECTROSUR = 0.78; // S/ por kWh
    const costoSoles = consumoKwh * TARIFA_ELECTROSUR;

    // Primera y última medición del período
    const primeraFecha = mediciones[0].fechaRegistro;
    const ultimaFecha = mediciones[mediciones.length - 1].fechaRegistro;

    return {
      consumoKwh: Number(consumoKwh.toFixed(3)),
      costoSoles: Number(costoSoles.toFixed(2)),
      horasMonitoreadas: Number(horasTotales.toFixed(2)),
      totalMediciones: mediciones.length,
      periodoInicio: primeraFecha,
      periodoFin: ultimaFecha,
      diasSolicitados: dias,
    };
  }

  // Calcular consumo del MES ACTUAL (desde día 1 hasta hoy)
  // Si no hay datos del mes actual, muestra del mes anterior
  async getConsumoMesActual(usuarioId: number, dispositivoId: number) {
    // Verificar acceso
    const tieneAcceso = await this.dispositivosService.verificarAcceso(
      usuarioId,
      dispositivoId,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    const ahora = new Date();
    const diaActual = ahora.getDate();
    const diasEnMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
    
    // Siempre mostrar el mes actual
    const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0, 0);
    const nombreMes = ahora.toLocaleString('es', { month: 'long' });

    // Obtener mediciones del mes actual
    const mediciones = await this.prisma.medicion.findMany({
      where: {
        dispositivoId,
        fechaRegistro: { gte: primerDiaMes },
      },
      orderBy: { fechaRegistro: 'asc' },
      select: {
        potenciaWatts: true,
        fechaRegistro: true,
      },
    });

    // Si no hay suficientes mediciones, devolver ceros para el mes actual
    if (mediciones.length < 2) {
      return {
        consumoKwh: 0,
        costoSoles: 0,
        horasMonitoreadas: 0,
        totalMediciones: mediciones.length,
        periodoInicio: primerDiaMes,
        periodoFin: ahora,
        diaActual,
        diasEnMes,
        diasConDatos: 0,
        progresoMes: Math.round((diaActual / diasEnMes) * 100),
        mesActual: true,
        nombreMes,
        mensaje: mediciones.length === 0 ? 'Sin mediciones este mes' : 'Esperando más datos',
      };
    }

    // Calcular kWh real: Σ (Potencia × Δt)
    let consumoWh = 0;
    let horasTotales = 0;

    for (let i = 1; i < mediciones.length; i++) {
      const medicionAnterior = mediciones[i - 1];
      const medicionActual = mediciones[i];

      const diffMs = medicionActual.fechaRegistro.getTime() - medicionAnterior.fechaRegistro.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

      // Solo considerar intervalos menores a 6 horas (evitar gaps de días sin datos)
      if (diffHoras <= 6) {
        const potenciaPromedio = (medicionAnterior.potenciaWatts + medicionActual.potenciaWatts) / 2;
        consumoWh += potenciaPromedio * diffHoras;
        horasTotales += diffHoras;
      }
    }

    const consumoKwh = consumoWh / 1000;
    const TARIFA_ELECTROSUR = 0.78;
    const costoSoles = consumoKwh * TARIFA_ELECTROSUR;

    // Primera y última medición del período
    const primeraFecha = mediciones[0].fechaRegistro;
    const ultimaFecha = mediciones[mediciones.length - 1].fechaRegistro;
    
    // Calcular días reales con datos
    const diasConDatos = Math.ceil((ultimaFecha.getTime() - primeraFecha.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Proyección para fin de mes (basado en consumo actual)
    const consumoDiarioPromedio = diasConDatos > 0 ? consumoKwh / diasConDatos : 0;
    const proyeccionMesKwh = consumoDiarioPromedio * diasEnMes;
    const proyeccionMesSoles = proyeccionMesKwh * TARIFA_ELECTROSUR;

    return {
      consumoKwh: Number(consumoKwh.toFixed(3)),
      costoSoles: Number(costoSoles.toFixed(2)),
      horasMonitoreadas: Number(horasTotales.toFixed(2)),
      totalMediciones: mediciones.length,
      periodoInicio: primeraFecha,
      periodoFin: ultimaFecha,
      diaActual,
      diasEnMes,
      diasConDatos,
      progresoMes: Math.round((diaActual / diasEnMes) * 100),
      mesActual: true,
      nombreMes,
      proyeccion: {
        kwhEstimado: Number(proyeccionMesKwh.toFixed(3)),
        costoEstimado: Number(proyeccionMesSoles.toFixed(2)),
      },
    };
  }

  // Obtener historial de consumo mensual (últimos N meses)
  async getHistorialMensual(usuarioId: number, dispositivoId: number, meses: number = 3) {
    const tieneAcceso = await this.dispositivosService.verificarAcceso(
      usuarioId,
      dispositivoId,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException('No tienes acceso a este dispositivo');
    }

    const TARIFA_ELECTROSUR = 0.78;
    const ahora = new Date();
    const historial: Array<{
      anio: number;
      mes: number;
      nombreMes: string;
      consumoKwh: number;
      costoSoles: number;
      totalMediciones: number;
      horasMonitoreadas: number;
      esActual: boolean;
    }> = [];

    // Calcular consumo para cada mes
    for (let i = 0; i < meses; i++) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0, 0);
      const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const mediciones = await this.prisma.medicion.findMany({
        where: {
          dispositivoId,
          fechaRegistro: {
            gte: primerDia,
            lte: ultimoDia,
          },
        },
        orderBy: { fechaRegistro: 'asc' },
        select: {
          potenciaWatts: true,
          fechaRegistro: true,
        },
      });

      let consumoWh = 0;
      let horasTotales = 0;

      for (let j = 1; j < mediciones.length; j++) {
        const anterior = mediciones[j - 1];
        const actual = mediciones[j];
        const diffHoras = (actual.fechaRegistro.getTime() - anterior.fechaRegistro.getTime()) / (1000 * 60 * 60);
        
        // Solo considerar intervalos menores a 6 horas
        if (diffHoras <= 6) {
          const potenciaPromedio = (anterior.potenciaWatts + actual.potenciaWatts) / 2;
          consumoWh += potenciaPromedio * diffHoras;
          horasTotales += diffHoras;
        }
      }

      const consumoKwh = consumoWh / 1000;

      historial.push({
        anio: fecha.getFullYear(),
        mes: fecha.getMonth() + 1,
        nombreMes: fecha.toLocaleString('es', { month: 'long', year: 'numeric' }),
        consumoKwh: Number(consumoKwh.toFixed(3)),
        costoSoles: Number((consumoKwh * TARIFA_ELECTROSUR).toFixed(2)),
        totalMediciones: mediciones.length,
        horasMonitoreadas: Number(horasTotales.toFixed(2)),
        esActual: i === 0,
      });
    }

    // Resumen
    const totalKwh = historial.reduce((sum, m) => sum + m.consumoKwh, 0);
    const totalSoles = historial.reduce((sum, m) => sum + m.costoSoles, 0);
    const promedioMensual = historial.length > 0 ? totalKwh / historial.length : 0;

    return {
      historial,
      resumen: {
        totalKwh: Number(totalKwh.toFixed(3)),
        totalSoles: Number(totalSoles.toFixed(2)),
        promedioMensualKwh: Number(promedioMensual.toFixed(3)),
        promedioMensualSoles: Number((promedioMensual * TARIFA_ELECTROSUR).toFixed(2)),
        mesesAnalizados: meses,
      },
    };
  }
}
