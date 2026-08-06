-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sorteo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "urlPublicacion" TEXT NOT NULL,
    "redSocial" TEXT NOT NULL,
    "cantidadGanadores" INTEGER NOT NULL,
    "cantidadSuplentes" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "hashVerificacion" TEXT,
    "timestamp" TEXT,
    "participantesHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT,

    CONSTRAINT "Sorteo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participante" (
    "id" TEXT NOT NULL,
    "usuarioExterno" TEXT NOT NULL,
    "comentario" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sorteoId" TEXT NOT NULL,

    CONSTRAINT "Participante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificado" (
    "id" TEXT NOT NULL,
    "ganadores" TEXT NOT NULL,
    "suplentes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sorteoId" TEXT NOT NULL,

    CONSTRAINT "Certificado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuotaApify" (
    "id" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuotaApify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoPase" (
    "id" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'ARS',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "preferenciaId" TEXT,
    "pagoMpId" TEXT,
    "usadoEnSorteoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pagadoAt" TIMESTAMP(3),

    CONSTRAINT "PagoPase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudCola" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesadoAt" TIMESTAMP(3),

    CONSTRAINT "SolicitudCola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Captura" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "urlPublicacion" TEXT,
    "shortcode" TEXT,
    "redSocial" TEXT,
    "sesion" TEXT NOT NULL,
    "cantidadComentarios" INTEGER NOT NULL,
    "participantesJson" TEXT NOT NULL,
    "nota" TEXT,
    "guardadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Captura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Participante_sorteoId_usuarioExterno_key" ON "Participante"("sorteoId", "usuarioExterno");

-- CreateIndex
CREATE UNIQUE INDEX "Certificado_sorteoId_key" ON "Certificado"("sorteoId");

-- CreateIndex
CREATE UNIQUE INDEX "CuotaApify_mes_key" ON "CuotaApify"("mes");

-- AddForeignKey
ALTER TABLE "Sorteo" ADD CONSTRAINT "Sorteo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participante" ADD CONSTRAINT "Participante_sorteoId_fkey" FOREIGN KEY ("sorteoId") REFERENCES "Sorteo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_sorteoId_fkey" FOREIGN KEY ("sorteoId") REFERENCES "Sorteo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

