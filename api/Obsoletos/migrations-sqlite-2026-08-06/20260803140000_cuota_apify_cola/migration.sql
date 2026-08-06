-- CreateTable
CREATE TABLE "CuotaApify" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mes" TEXT NOT NULL,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SolicitudCola" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "urlPublicacion" TEXT NOT NULL,
    "redSocial" TEXT NOT NULL,
    "cantidadGanadores" INTEGER NOT NULL,
    "cantidadSuplentes" INTEGER NOT NULL DEFAULT 0,
    "eliminarDuplicados" BOOLEAN NOT NULL DEFAULT true,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "sorteoId" TEXT,
    "resultado" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesadoAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "CuotaApify_mes_key" ON "CuotaApify"("mes");
