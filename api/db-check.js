const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
(async () => {
  const sorteos = await p.sorteo.count().catch((e) => `ERR: ${e.message.slice(0, 120)}`);
  const capturas = await p.captura.count().catch((e) => `ERR: ${e.message.slice(0, 120)}`);
  const cola = await p.solicitudCola.count().catch((e) => `ERR: ${e.message.slice(0, 120)}`);
  const cuota = await p.cuotaApify.findMany({ take: 5 }).catch((e) => `ERR: ${e.message.slice(0, 120)}`);
  console.log('Sorteos:', sorteos);
  console.log('Capturas:', capturas);
  console.log('Cola:', cola);
  console.log('CuotaApify:', JSON.stringify(cuota));
})().finally(() => p.$disconnect());