-- CreateTable
CREATE TABLE "Captura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "urlPublicacion" TEXT,
    "shortcode" TEXT,
    "redSocial" TEXT,
    "sesion" TEXT NOT NULL,
    "cantidadComentarios" INTEGER NOT NULL,
    "participantesJson" TEXT NOT NULL,
    "nota" TEXT,
    "guardadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);