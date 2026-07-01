import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdoptarDispositivoDto {
  @ApiProperty({
    description: 'Serial único del dispositivo a adoptar',
    example: 'ESP32-001-ABC',
  })
  @IsString({ message: 'El serialUnico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El serialUnico es requerido' })
  serialUnico: string;
}
