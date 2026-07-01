import { Module } from '@nestjs/common';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { AlertasGateway } from './alertas.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlertasController],
  providers: [AlertasService, AlertasGateway],
  exports: [AlertasService, AlertasGateway],
})
export class AlertasModule {}
