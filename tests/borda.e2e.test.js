const request = require('supertest');
const API = 'https://points-app-backend.vercel.app';

function generateRandomCpf() {
  return String(Math.floor(10000000000 + Math.random() * 89999999999));
}

function generateRandomEmailWithSpecialChars() {
  const specialChars = ['.', '_', '-', '+'];
  const char = specialChars[Math.floor(Math.random() * specialChars.length)];
  return `qa${char}${Date.now()}@exemplo.co.uk`;
}

describe('Testes de Borda - Inputs Extremos e Limites', () => {
  it('Deve aceitar nome com caracteres especiais', async () => {
    const user = {
      cpf: generateRandomCpf(),
      full_name: 'José da Silva-Santos Jr.',
      email: generateRandomEmailWithSpecialChars(),
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const res = await request(API).post('/cadastro').send(user).expect(201);
    expect(res.body).toHaveProperty('confirmToken');
  });

  it('Deve rejeitar senha muito curta', async () => {
    const user = {
      cpf: generateRandomCpf(),
      full_name: 'Maria Oliveira',
      email: generateRandomEmail(),
      password: 'S@1a',
      confirmPassword: 'S@1a',
    };
    const res = await request(API).post('/cadastro').send(user);
    expect(res.status).toBe(400);
  });

  it('Deve aceitar transferência de pontos exatamente igual ao saldo', async () => {
    // Criar usuário, confirmar, logar
    // Depositar todo saldo disponível para envio
    // Testar transferência no limite exato
    // (Implementação detalhada conforme necessidade)
  });

  it('Deve rejeitar cpf com formato inválido', async () => {
    const user = {
      cpf: '123456', // inválido: menos que 11 dígitos
      full_name: 'Carlos Eduardo',
      email: generateRandomEmail(),
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const res = await request(API).post('/cadastro').send(user);
    expect(res.status).toBe(400);
  });
});
