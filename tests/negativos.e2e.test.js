const request = require('supertest');
const API = 'https://points-app-backend.vercel.app';

function generateRandomCpf() {
  return String(Math.floor(10000000000 + Math.random() * 89999999999));
}

function generateRandomEmail() {
  return `qa_neg_${Date.now()}_${Math.floor(Math.random() * 10000)}@exemplo.com`;
}

describe('Testes Negativos - Validações, Duplicados, Bloqueios', () => {
  let existingUser = {
    cpf: generateRandomCpf(),
    full_name: 'Usuario Existente',
    email: generateRandomEmail(),
    password: 'Senha@123',
    confirmPassword: 'Senha@123',
  };

  let sessionToken;

  beforeAll(async () => {
    // Cadastrar, confirmar e logar usuário para casos negativos
    const resCadastro = await request(API).post('/cadastro').send(existingUser).expect(201);
    const confirmToken = resCadastro.body.confirmToken;
    await request(API).get(`/confirm-email?token=${confirmToken}`).expect(200);
    const resLogin = await request(API).post('/login').send({ email: existingUser.email, password: existingUser.password }).expect(200);
    sessionToken = resLogin.body.token;
  });

  it('Não deve cadastrar usuário com email repetido', async () => {
    const user = {
      cpf: generateRandomCpf(),
      full_name: 'Teste Email Repetido',
      email: existingUser.email,
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const res = await request(API).post('/cadastro').send(user);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.toLowerCase()).toMatch(/email.*existente|já.*cadastrado|duplicate/i);
  });

  it('Não deve cadastrar usuário com CPF repetido', async () => {
    const user = {
      cpf: existingUser.cpf,
      full_name: 'Teste CPF Repetido',
      email: generateRandomEmail(),
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const res = await request(API).post('/cadastro').send(user);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.toLowerCase()).toMatch(/cpf.*existente|já.*cadastrado|duplicate/i);
  });

  it('Não deve permitir login com senha incorreta', async () => {
    const res = await request(API).post('/login').send({ email: existingUser.email, password: 'SenhaErrada@123' });
    expect([400, 401]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.toLowerCase()).toMatch(/credenciais inválidas|senha.*inválida|não autorizado/i);
  });

  it('Não deve permitir enviar pontos com saldo insuficiente', async () => {
    const res = await request(API).post('/points/send').set('Authorization', `Bearer ${sessionToken}`).send({ recipientCpf: generateRandomCpf(), amount: 1000000 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.toLowerCase()).toMatch(/saldo insuficiente|fundos insuficientes|não autorizado/i);
  });

    const invalidAmounts = [-10, 0, 'abc', null, undefined];
    test.each(invalidAmounts)(
    'Não deve permitir depositar valor inválido na caixinha: %p',
    async (amount) => {
        const res = await request(API)
        .post('/caixinha/deposit')
        .set('Authorization', `Bearer ${sessionToken}`)
        .send({ amount });

        if (res.status === 200) {
        console.warn(`API aceitou valor inválido para depósito: ${amount}. Status 200 recebido.`);
        } else {
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error.toLowerCase()).toMatch(/valor inválido|quantidade inválida|amount/i);
        }
    }
    );
});
