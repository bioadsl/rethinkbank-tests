const request = require('supertest');
const API = 'https://points-app-backend.vercel.app';

// Função para gerar CPF aleatório válido (string com 11 dígitos)
function generateRandomCpf() {
  return String(Math.floor(10000000000 + Math.random() * 89999999999));
}

// Função para gerar email aleatório válido
function generateRandomEmail() {
  return `qa_${Date.now()}_${Math.floor(Math.random() * 10000)}@exemplo.com`;
}

// Função para gerar email com caracteres especiais para teste de borda
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
      password: 'S@1a', // senha com menos de 8 caracteres
      confirmPassword: 'S@1a',
    };

    const res = await request(API).post('/cadastro').send(user);
    expect(res.status).toBe(400);
  });

  it('Deve aceitar transferência de pontos exatamente igual ao saldo', async () => {
    // Implementação detalhada do fluxo para testar transferência do saldo exato
    // Exemplo base para criar usuário, confirmar, logar, enviar pontos

    // Gerar dados para usuário
    const user = {
      cpf: generateRandomCpf(),
      full_name: 'Usuario Teste Transferencia',
      email: generateRandomEmail(),
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };

    // Cadastro
    const cadastroRes = await request(API).post('/cadastro').send(user).expect(201);
    const confirmToken = cadastroRes.body.confirmToken;

    // Confirmação de email
    await request(API).get(`/confirm-email?token=${confirmToken}`).expect(200);

    // Login
    const loginRes = await request(API).post('/login').send({ email: user.email, password: user.password }).expect(200);
    const token = loginRes.body.token;

    // Consulta saldo inicial (deve ser 100)
    const saldoRes = await request(API).get('/points/saldo').set('Authorization', `Bearer ${token}`).expect(200);
    expect(saldoRes.body.normal_balance).toBe(100);

    // Cria usuário destinatário para envio
    const user2 = {
      cpf: generateRandomCpf(),
      full_name: 'Usuario Destinatario',
      email: generateRandomEmail(),
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };

    const cadastroRes2 = await request(API).post('/cadastro').send(user2).expect(201);
    const confirmToken2 = cadastroRes2.body.confirmToken;
    await request(API).get(`/confirm-email?token=${confirmToken2}`).expect(200);

    // Login destinatário
    const loginRes2 = await request(API).post('/login').send({ email: user2.email, password: user2.password }).expect(200);
    const token2 = loginRes2.body.token;

    // Enviar exatamente 100 pontos para o destinatário
    const sendRes = await request(API)
      .post('/points/send')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientCpf: user2.cpf,
        amount: 100,
      })
      .expect(200);

    expect(sendRes.body.message).toMatch(/Pontos enviados com sucesso/);

    // Verificar saldo zerado do remetente
    const saldoFinal = await request(API).get('/points/saldo').set('Authorization', `Bearer ${token}`).expect(200);
    expect(saldoFinal.body.normal_balance).toBe(0);
  });

  it('Deve rejeitar cpf com formato inválido', async () => {
    const user = {
      cpf: '123456', // formato inválido - menos que 11 dígitos
      full_name: 'Carlos Eduardo',
      email: generateRandomEmail(),
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };

    const res = await request(API).post('/cadastro').send(user);
    expect(res.status).toBe(400);
  });
});
