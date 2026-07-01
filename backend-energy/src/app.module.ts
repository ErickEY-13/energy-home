import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { DispositivosModule } from './dispositivos';
import { MedicionesModule } from './mediciones';
import { ControlModule } from './control';
import { SensorModule } from './sensor';
import { MlModule } from './ml';
import { AlertasModule } from './alertas';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    DispositivosModule,
    MedicionesModule,
    ControlModule,
    SensorModule,
    MlModule, // 🤖 Módulo ML integrado
    AlertasModule, // 🚨 Módulo de Alertas WebSocket
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

