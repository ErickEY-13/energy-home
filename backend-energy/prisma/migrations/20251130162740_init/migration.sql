-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `rol` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `fechaRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaActualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispositivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serialUnico` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `topicMqtt` VARCHAR(191) NOT NULL,
    `estadoActual` ENUM('ON', 'OFF') NOT NULL DEFAULT 'OFF',

    UNIQUE INDEX `dispositivos_serialUnico_key`(`serialUnico`),
    UNIQUE INDEX `dispositivos_apiKey_key`(`apiKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_dispositivos` (
    `usuarioId` INTEGER NOT NULL,
    `dispositivoId` INTEGER NOT NULL,
    `fechaAsignado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`usuarioId`, `dispositivoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mediciones` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dispositivoId` INTEGER NOT NULL,
    `voltaje` DOUBLE NOT NULL,
    `amperaje` DOUBLE NOT NULL,
    `potenciaWatts` DOUBLE NOT NULL,
    `fechaRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mediciones_dispositivoId_idx`(`dispositivoId`),
    INDEX `mediciones_fechaRegistro_idx`(`fechaRegistro`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario_dispositivos` ADD CONSTRAINT `usuario_dispositivos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_dispositivos` ADD CONSTRAINT `usuario_dispositivos_dispositivoId_fkey` FOREIGN KEY (`dispositivoId`) REFERENCES `dispositivos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mediciones` ADD CONSTRAINT `mediciones_dispositivoId_fkey` FOREIGN KEY (`dispositivoId`) REFERENCES `dispositivos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
