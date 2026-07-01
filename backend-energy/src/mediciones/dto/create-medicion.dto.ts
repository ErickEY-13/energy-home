import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateMedicionDto {
  @ApiProperty({
    description: 'Serial único del dispositivo',
    example: 'ESP32-001-ABC',
  })
  @IsString({ message: 'El serialUnico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El serialUnico es requerido' })
  serialUnico: string;

  @ApiProperty({
    description: 'API Key del dispositivo',
    example: 'uuid-api-key',
  })
  @IsString({ message: 'La apiKey debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La apiKey es requerida' })
  apiKey: string;

  @ApiProperty({
    description: 'Voltaje medido en Volts',
    example: 120.5,
  })
  @IsNumber({}, { message: 'El voltaje debe ser un número' })
  @Min(0, { message: 'El voltaje no puede ser negativo' })
  voltaje: number;

  @ApiProperty({
    description: 'Amperaje medido en Amperes',
    example: 2.5,
  })
  @IsNumber({}, { message: 'El amperaje debe ser un número' })
  @Min(0, { message: 'El amperaje no puede ser negativo' })
  amperaje: number;

  @ApiProperty({
    description: 'Potencia calculada en Watts',
    example: 301.25,
  })
  @IsNumber({}, { message: 'La potenciaWatts debe ser un número' })
  @Min(0, { message: 'La potenciaWatts no puede ser negativa' })
  potenciaWatts: number;
}
