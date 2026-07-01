-- CreateTable
CREATE TABLE `analisis_ml` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dispositivoId` INTEGER NOT NULL,
    `fechaAnalisis` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `anomaliasDetectadas` INTEGER NOT NULL DEFAULT 0,
    `severidad` ENUM('low', 'medium', 'high') NOT NULL,
    `forecastKwh` DOUBLE NULL,
    `forecastCosto` DOUBLE NULL,
    `recomendaciones` JSON NULL,
    `datosAnalisis` JSON NULL,

    INDEX `analisis_ml_dispositivoId_idx`(`dispositivoId`),
    INDEX `analisis_ml_fechaAnalisis_idx`(`fechaAnalisis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alertas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dispositivoId` INTEGER NOT NULL,
    `tipo` ENUM('anomalia', 'consumo_alto', 'spike', 'prediccion', 'eficiencia') NOT NULL,
    `severidad` ENUM('low', 'medium', 'high') NOT NULL,
    `mensaje` TEXT NOT NULL,
    `datos` JSON NULL,
    `visto` BOOLEAN NOT NULL DEFAULT false,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `alertas_dispositivoId_idx`(`dispositivoId`),
    INDEX `alertas_fechaCreacion_idx`(`fechaCreacion`),
    INDEX `alertas_visto_idx`(`visto`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `analisis_ml` ADD CONSTRAINT `analisis_ml_dispositivoId_fkey` FOREIGN KEY (`dispositivoId`) REFERENCES `dispositivos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_dispositivoId_fkey` FOREIGN KEY (`dispositivoId`) REFERENCES `dispositivos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
