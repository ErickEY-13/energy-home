import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDispositivoDto {
  @ApiProperty({
    description: 'Serial único del dispositivo',
    example: 'ESP32-001-ABC',
  })
  @IsString({ message: 'El serialUnico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El serialUnico es requerido' })
  serialUnico: string;

  @ApiProperty({
    description: 'Nombre del dispositivo',
    example: 'Sensor Sala Principal',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Topic MQTT del dispositivo',
    example: 'energy/esp32-001/control',
  })
  @IsString({ message: 'El topicMqtt debe ser una cadena de texto' })
  @IsOptional()
  topicMqtt?: string;
}
