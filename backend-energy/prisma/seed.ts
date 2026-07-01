import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder...\n');

  // ========================================
  // 1. LIMPIAR BASE DE DATOS
  // ========================================
  console.log('🧹 Limpiando base de datos...');
  
  await prisma.medicion.deleteMany();
  await prisma.usuarioDispositivo.deleteMany();
  await prisma.dispositivo.deleteMany();
  await prisma.usuario.deleteMany();
  
  console.log('   ✅ Base de datos limpia');

  // ========================================
  // 2. CREAR USUARIOS DE PRUEBA
  // ========================================
  console.log('\n👤 Creando usuarios...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // Usuario Admin
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@energy.com',
      passwordHash,
      rol: 'admin',
    },
  });
  console.log(`   ✅ Admin creado: ${admin.email}`);

  // Usuario Normal
  const user = await prisma.usuario.create({
    data: {
      email: 'user@energy.com',
      passwordHash,
      rol: 'user',
    },
  });
  console.log(`   ✅ Usuario creado: ${user.email}`);

  // ========================================
  // 3. CREAR DISPOSITIVOS DE PRUEBA
  // ========================================
  console.log('\n📟 Creando dispositivos...');

  const dispositivo1 = await prisma.dispositivo.create({
    data: {
      serialUnico: 'ESP32-001-SALA',
      nombre: 'ESP32 Sensor Sala',
      topicMqtt: 'energy/sala/sensor1',
      estadoActual: 'ON',
    },
  });
  console.log(`   ✅ Dispositivo creado: ${dispositivo1.nombre}`);

  const dispositivo2 = await prisma.dispositivo.create({
    data: {
      serialUnico: 'ESP32-002-COCINA',
      nombre: 'ESP32 Sensor Cocina',
      topicMqtt: 'energy/cocina/sensor1',
      estadoActual: 'ON',
    },
  });
  console.log(`   ✅ Dispositivo creado: ${dispositivo2.nombre}`);

  const dispositivo3 = await prisma.dispositivo.create({
    data: {
      serialUnico: 'ESP32-003-DORMITORIO',
      nombre: 'ESP32 Sensor Dormitorio',
      topicMqtt: 'energy/dormitorio/sensor1',
      estadoActual: 'OFF',
    },
  });
  console.log(`   ✅ Dispositivo creado: ${dispositivo3.nombre}`);

  // ========================================
  // 4. ASIGNAR DISPOSITIVOS A USUARIOS
  // ========================================
  console.log('\n🔗 Asignando dispositivos a usuarios...');

  // Asignar dispositivos al usuario normal con personalizaciones
  await prisma.usuarioDispositivo.create({
    data: {
      usuarioId: user.id,
      dispositivoId: dispositivo1.id,
      nombrePersonalizado: 'TV Samsung 55"',
      tipoObjeto: 'TV',
      ubicacion: 'Sala Principal',
      icono: '📺',
    },
  });
  console.log(`   ✅ TV Samsung asignado a ${user.email}`);

  await prisma.usuarioDispositivo.create({
    data: {
      usuarioId: user.id,
      dispositivoId: dispositivo2.id,
      nombrePersonalizado: 'Refrigerador LG',
      tipoObjeto: 'REFRIGERADOR',
      ubicacion: 'Cocina',
      icono: '🧊',
    },
  });
  console.log(`   ✅ Refrigerador asignado a ${user.email}`);

  await prisma.usuarioDispositivo.create({
    data: {
      usuarioId: user.id,
      dispositivoId: dispositivo3.id,
      nombrePersonalizado: 'Aire Acondicionado',
      tipoObjeto: 'AIRE_ACONDICIONADO',
      ubicacion: 'Dormitorio',
      icono: '❄️',
    },
  });
  console.log(`   ✅ Aire Acondicionado asignado a ${user.email}`);

  // ========================================
  // 5. CREAR MEDICIONES DE PRUEBA
  // ========================================
  console.log('\n⚡ Creando mediciones de prueba...');

  const ahora = new Date();
  const medicionesData: Array<{
    dispositivoId: number;
    voltaje: number;
    amperaje: number;
    potenciaWatts: number;
    fechaRegistro: Date;
  }> = [];

  // Función para generar mediciones con variación realista
  const generarMediciones = (
    dispositivoId: number,
    baseVoltaje: number,
    baseAmperaje: number,
    diasAtras: number,
    intervalosHora: number = 1
  ) => {
    for (let dia = diasAtras; dia >= 0; dia--) {
      for (let hora = 0; hora < 24; hora += intervalosHora) {
        const fecha = new Date(ahora);
        fecha.setDate(fecha.getDate() - dia);
        fecha.setHours(hora, Math.floor(Math.random() * 60), 0, 0);

        // Variación realista (+/- 5% voltaje, +/- 20% amperaje)
        const voltaje = baseVoltaje + (Math.random() - 0.5) * baseVoltaje * 0.1;
        const amperaje = baseAmperaje + (Math.random() - 0.5) * baseAmperaje * 0.4;
        const potenciaWatts = voltaje * amperaje;

        medicionesData.push({
          dispositivoId,
          voltaje: parseFloat(voltaje.toFixed(2)),
          amperaje: parseFloat(amperaje.toFixed(3)),
          potenciaWatts: parseFloat(potenciaWatts.toFixed(2)),
          fechaRegistro: fecha,
        });
      }
    }
  };

  // Dispositivo 1 (TV): ~120V, ~0.8A = ~96W
  generarMediciones(dispositivo1.id, 120, 0.8, 7, 2); // 7 días, cada 2 horas

  // Dispositivo 2 (Refrigerador): ~120V, ~1.5A = ~180W (funciona 24/7)
  generarMediciones(dispositivo2.id, 120, 1.5, 7, 1); // 7 días, cada hora

  // Dispositivo 3 (Aire Acondicionado): ~120V, ~10A = ~1200W
  generarMediciones(dispositivo3.id, 120, 10, 7, 3); // 7 días, cada 3 horas

  // Insertar todas las mediciones
  await prisma.medicion.createMany({
    data: medicionesData,
  });
  console.log(`   ✅ ${medicionesData.length} mediciones creadas`);

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('\n' + '='.repeat(50));
  console.log('🎉 SEEDER COMPLETADO');
  console.log('='.repeat(50));
  console.log('\n📋 DATOS DE PRUEBA:');
  console.log('─'.repeat(50));
  console.log('USUARIOS:');
  console.log('  📧 admin@energy.com  | 🔑 123456 | 👑 admin');
  console.log('  📧 user@energy.com   | 🔑 123456 | 👤 user');
  console.log('─'.repeat(50));
  console.log('DISPOSITIVOS:');
  console.log(`  📺 TV Samsung 55" (Sala) - ${dispositivo1.serialUnico}`);
  console.log(`  🧊 Refrigerador LG (Cocina) - ${dispositivo2.serialUnico}`);
  console.log(`  ❄️ Aire Acondicionado (Dormitorio) - ${dispositivo3.serialUnico}`);
  console.log('─'.repeat(50));
  console.log(`MEDICIONES: ${medicionesData.length} registros (últimos 7 días)`);
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error en seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
