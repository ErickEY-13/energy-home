import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum AccionControl {
  ON = 'ON',
  OFF = 'OFF',
}

export class ControlDispositivoDto {
  @ApiProperty({
    description: 'Acción a ejecutar en el dispositivo',
    enum: AccionControl,
    example: 'ON',
  })
  @IsEnum(AccionControl, { message: 'La acción debe ser ON o OFF' })
  @IsNotEmpty({ message: 'La acción es requerida' })
  accion: AccionControl;
}
