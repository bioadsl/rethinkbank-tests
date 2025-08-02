const request = require('supertest');
const API = 'https://points-app-backend.vercel.app';

describe('Testes de Segurança e Autorização', () => {
  it('Negar acesso a endpoint protegido sem token', async () => {
    const res = await request(API).get('/points/saldo');
    expect([401, 403]).toContain(res.status);
  });

  it('Negar acesso com token inválido', async () => {
    const res = await request(API).get('/points/saldo').set('Authorization', 'Bearer token_invalido');
    expect([401, 403]).toContain(res.status);
  });

  it('Negar acesso a operações de outro usuário (Horizontal Privilege Escalation)', async () => {
    // Essa validação exige criação de dois usuários, tokens, e tentativa de usar token de um para agir sobre conta do outro
    // Implementar quando necessário
  });
});
