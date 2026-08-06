import { createHmac } from 'crypto';
import { verifyWebhookSignature as verify } from '@shared/mercadopago';

describe('verifyWebhookSignature (MercadoPago)', () => {
  const secret = 'mi-secret-webhook';

  const firmar = (xRequestId: string | undefined, dataId: string | undefined, ts: string) => {
    const manifestParts: string[] = [];
    if (dataId) manifestParts.push(`id:${dataId.toLowerCase()}`);
    if (xRequestId) manifestParts.push(`request-id:${xRequestId}`);
    manifestParts.push(`ts:${ts}`);
    const manifest = manifestParts.join(';') + ';';
    const v1 = createHmac('sha256', secret).update(manifest).digest('hex');
    return `ts=${ts},v1=${v1}`;
  };

  it('acepta una firma válida (manifest completo)', () => {
    const ts = '1704908010';
    const dataId = '999999999';
    const xRequestId = 'req-123';
    const xSignature = firmar(xRequestId, dataId, ts);
    expect(verify(xSignature, xRequestId, dataId, secret)).toBe(true);
  });

  it('rechaza una firma alterada', () => {
    const ts = '1704908010';
    const dataId = '999999999';
    const xRequestId = 'req-123';
    const xSignature = firmar(xRequestId, dataId, ts);
    const falsa = xSignature.slice(0, -2) + (xSignature.endsWith('00') ? '11' : '00');
    expect(verify(falsa, xRequestId, dataId, secret)).toBe(false);
  });

  it('acepta una firma sin xRequestId (parte omisible)', () => {
    const ts = '1704908010';
    const dataId = '999999999';
    const xSignature = firmar(undefined, dataId, ts);
    expect(verify(xSignature, undefined, dataId, secret)).toBe(true);
  });

  it('acepta dataId en mayúsculas (se normaliza)(interna per MP)', () => {
    const ts = '1704908010';
    const dataId = 'ORD01JQ4S4KY8HWQ6NA5PXB65B3D3';
    const xSignature = firmar('req-1', dataId, ts);
    expect(verify(xSignature, 'req-1', dataId, secret)).toBe(true);
  });

  it('rechaza firma con ts/hash ausentes o header malformado', () => {
    expect(verify('', 'req', 'data', secret)).toBe(false);
    expect(verify('v1=abc', 'req', 'data', secret)).toBe(false);
    expect(verify('ts=123', 'req', 'data', secret)).toBe(false);
  });
});