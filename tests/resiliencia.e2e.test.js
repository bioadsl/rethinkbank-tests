const request = require('supertest');
const API = 'https://points-app-backend.vercel.app';

describe('Testes de Resiliência - Requisições Malformadas e Campos Incorretos', () => {
  it('Cadastro sem CPF deve ser rejeitado', async () => {
    const data = {
      full_name: 'Ana Pereira',
      email: 'ana.pereira@example.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const res = await request(API).post('/cadastro').send(data);
    expect(res.status).toBe(400);
  });

  it('Cadastro com tipo errado para campo CPF (número)', async () => {
    const data = {
      cpf: 12345678901, // number em vez de string
      full_name: 'João Silva',
      email: 'joao.silva@example.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    };
    const res = await request(API).post('/cadastro').send(data);
    // Depende da API, pode aceitar ou rejeitar: ajuste conforme comportamento esperado
    if (res.status === 200) {
      console.warn('API aceitou CPF como number ao invés de string.');
    } else {
      expect(res.status).toBe(400);
    }
  });

  it('Requisição POST em endpoint GET deve retornar erro ou método não permitido', async () => {
    const res = await request(API).post('/points/saldo');
    expect([404, 405]).toContain(res.status);
  });

  it('Request com campos extras inesperados deve ser ignorado ou gerar erro', async () => {
    const data = {
      cpf: '12345678901',
      full_name: 'Pessoa Teste',
      email: 'teste@example.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
      extra_field: 'indesejado',
    };
    const res = await request(API).post('/cadastro').send(data);
    // Ajuste teste conforme comportamento esperado (aceitar/ignorar erro)
    expect([201, 400]).toContain(res.status);
  });

  it('Campos nulos e indefinidos no cadastro devem ser rejeitados', async () => {
    const data = {
      cpf: null,
      full_name: undefined,
      email: '',
      password: '',
      confirmPassword: '',
    };
    const res = await request(API).post('/cadastro').send(data);
    expect(res.status).toBe(400);
  });
});
