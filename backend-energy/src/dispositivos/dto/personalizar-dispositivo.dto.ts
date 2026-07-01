import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum TipoObjeto {
  TV = 'TV',
  REFRIGERADOR = 'REFRIGERADOR',
  LAVADORA = 'LAVADORA',
  MICROONDAS = 'MICROONDAS',
  AIRE_ACONDICIONADO = 'AIRE_ACONDICIONADO',
  VENTILADOR = 'VENTILADOR',
  COMPUTADORA = 'COMPUTADORA',
  LAPTOP = 'LAPTOP',
  CONSOLA_VIDEOJUEGOS = 'CONSOLA_VIDEOJUEGOS',
  ILUMINACION = 'ILUMINACION',
  ROUTER = 'ROUTER',
  CARGADOR = 'CARGADOR',
  CAFETERA = 'CAFETERA',
  LICUADORA = 'LICUADORA',
  HORNO = 'HORNO',
  PLANCHA = 'PLANCHA',
  SECADORA = 'SECADORA',
  CALENTADOR = 'CALENTADOR',
  BOMBA_AGUA = 'BOMBA_AGUA',
  OTRO = 'OTRO',
}

export class PersonalizarDispositivoDto {
  @ApiPropertyOptional({
    description: 'Nombre personalizado del dispositivo (ej: "TV Sala", "Refri Cocina")',
    example: 'TV Samsung Sala',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombrePersonalizado?: string;

  @ApiPropertyOptional({
    description: 'Tipo de electrodoméstico/objeto conectado',
    enum: TipoObjeto,
    example: TipoObjeto.TV,
  })
  @IsOptional()
  @IsEnum(TipoObjeto)
  tipoObjeto?: TipoObjeto;

  @ApiPropertyOptional({
    description: 'Ubicación del dispositivo en casa',
    example: 'Sala Principal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ubicacion?: string;

  @ApiPropertyOptional({
    description: 'Icono personalizado para el dispositivo',
    example: 'tv',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string;
}
