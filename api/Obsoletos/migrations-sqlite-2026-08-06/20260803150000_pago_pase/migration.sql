-- CreateTable
CREATE TABLE "PagoPase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monto" INTEGER NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'ARS',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "preferenciaId" TEXT,
    "pagoMpId" TEXT,
    "usadoEnSorteoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pagadoAt" DATETIME
);