# Testes End-to-End – Rethink Bank (API Pública)

Este projeto automatiza o fluxo E2E do usuário e diversos cenários negativos do sistema Rethink Bank utilizando **Jest + Supertest**, diretamente sobre a API pública:  
https://points-app-backend.vercel.app

---

## ✨ Stack Utilizada

- **Jest** para execução e estruturação dos testes automatizados.
- **Supertest** para simulação de requisições HTTP.

---

## Como rodar os testes

1. **Instale as dependências:**
npm install

text

2. **Execute todos os testes:**
npm test

text

3. O output detalhado está em [`evidencias_jornada.txt`](./evidencias_jornada.txt).

---

## Escopo dos Testes Automatizados

O projeto cobre:

- Cadastro e confirmação de usuário
- Login, token e endpoints autenticados
- Depósito e extrato na caixinha 
- Envio de pontos entre usuários
- Verificação de extratos e saldo
- Exclusão de conta
- Testes negativos: dados duplicados, login errado, saldo insuficiente, depósitos inválidos

Falhas e inconsistências são registradas via `console.warn` e detalhadas abaixo.

---

## 1. Bugs e Observações Encontradas

Todos os testes positivos passaram, contudo, foram identificados comportamentos inesperados. Segue enumeração dos bugs encontrados:

### Bug 1 — Saldo não atualizado após depósito na caixinha

- **Fluxo Onde Ocorre:** Consulta saldo após depósito na caixinha.
- **Descrição:** Ao depositar 30 pontos, o saldo da caixinha deveria ir para 30 e o saldo normal, cair para 70.
- **Observado:** O saldo da caixinha permaneceu 0 e o saldo normal em 100.
- **Evidência do log:**
console.warn
Saldo da caixinha esperado: 30, recebido: 0. Possível bug na lógica do backend.

console.warn
Saldo normal esperado: 70, recebido: 100. Possível bug na lógica do backend.

text
- **Tempo médio deste teste:** 1.091 s

---

### Bug 2 — API aceita valores inválidos para depósito na caixinha

- **Fluxo Onde Ocorre:** Depósito de valores inválidos na caixinha.
- **Descrição:** Foram enviados valores como -10, 0, 'abc', null, undefined — o sistema deveria rejeitar (status 400).
- **Observado:** A API retornou status 200 (aceitou o depósito) para todos esses casos.
- **Evidência do log:**
console.warn
API aceitou valor inválido para depósito: -10. Status 200 recebido.
...

text
- **Tempo total do teste:** 4.213 s

---

## 2. Detalhes de Testes Negativos

Incluem, ainda que com retorno técnico correto:

- **Cadastro com email repetido:** Rejeitado, corpo traz `"error"` corretamente.
- **Cadastro com CPF repetido:** Rejeitado, corpo traz `"error"`.
- **Login com senha incorreta:** Mensagem padrão `"credenciais inválidas"` retornada em `"error"`.
- **Envio de pontos com saldo insuficiente:** Rejeitado com `"Saldo insuficiente"` em `"error"`.
- Para todos: tempo médio de 389 ms a 543 ms.

---

## 3. Métricas Gerais

| #  | Fluxo                                      | Status          | Tempo Médio |
|----|--------------------------------------------|-----------------|-------------|
|  1 | Cadastro Usuário 1                         | Sucesso         | 3.061 s     |
|  2 | Confirmação de Email Usuário 1             | Sucesso         | 836 ms      |
|  3 | Login Usuário 1                            | Sucesso         | 868 ms      |
|  4 | Cadastro/Confirmação/Login Usuário 2       | Sucesso         | 2.097 s     |
|  5 | Consulta saldo inicial Usuário 1           | Sucesso         | 1.402 s     |
|  6 | Depósito na caixinha Usuário 1             | Sucesso         | 1.057 s     |
|  7 | Consulta saldo após depósito (bug 1)       | Warn/Bug        | 1.091 s     |
|  8 | Envio de pontos Usuário 1 para Usuário 2   | Sucesso         | 1.035 s     |
|  9 | Consulta extrato de pontos                 | Sucesso         | 664 ms      |
| 10 | Consulta extrato da caixinha               | Sucesso         | 409 ms      |
| 11 | Exclusão de conta Usuário 1                | Sucesso         | 912 ms      |
| 12 | Email repetido (negativo)                  | Sucesso         | 485 ms      |
| 13 | CPF repetido (negativo)                    | Sucesso         | 543 ms      |
| 14 | Login com senha errada (negativo)          | Sucesso         | 493 ms      |
| 15 | Saldo insuficiente (negativo)              | Sucesso         | 389 ms      |
| 16 | Dep. valores inválidos (bug 2 - warnings)  | Warn/Bug        | 4.213 s     |

---

## 4. Conclusão Técnica

- O fluxo principal (incluindo autenticação, saldo, transações e exclusão de conta) está funcionando.
- **Dois bugs relevantes** identificados: saldo não atualizado corretamente e aceitação de depósitos inválidos.
- Mensagens de erro padronizadas em `.error` e não `.message`.
- Recomendação: corrigir os bugs de saldo/validação antes do Go Live.

**O sistema NÃO está pronto para produção até que as inconsistências listadas (bugs 1 e 2) sejam corrigidas.**

---

## 5. Evidências detalhadas

Logs completos e detalhes de todas as execuções estão em [`evidencias_jornada.txt`](./evidencias_jornada.txt).

---

Se precisar de qualquer orientação extra, exemplos de melhorias ou expansão dos testes, sinta-se à vontade para solicitar.