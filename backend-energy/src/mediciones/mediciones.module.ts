import { Module } from '@nestjs/common';
import { MedicionesController } from './mediciones.controller';
import { MedicionesService } from './mediciones.service';
import { DispositivosModule } from '../dispositivos/dispositivos.module';

@Module({
  imports: [DispositivosModule],
  controllers: [MedicionesController],
  providers: [MedicionesService],
  exports: [MedicionesService],
})
export class MedicionesModule {}
