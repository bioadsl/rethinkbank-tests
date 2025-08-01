# Testes End-to-End – Rethink Bank (API Pública)

Este projeto automatiza o fluxo E2E de um usuário do sistema Rethink Bank utilizando **Jest + Supertest**, consumindo diretamente a API pública fornecida pela equipe do desafio.

## ✨ Stack Utilizada

- **Jest** para execução e organização dos testes automatizados
- **Supertest** para requisições HTTP contra endpoints RESTful

## Como rodar os testes

1. **Clone este repositório e instale as dependências:**


npm install


2. **Execute a suíte de testes automatizados:**

npm test


> Todas as requisições são feitas diretamente ao endpoint oficial:  
> `https://points-app-backend.vercel.app`

3. **Evidências:**  
O output completo da execução está disponível no arquivo [`evidencias_jornada.txt`](./evidencias_jornada.txt).

## Escopo dos testes automatizados

O teste cobre toda a jornada crítica do usuário final, incluindo:

- Cadastro de usuário (com dados únicos a cada rodada)
- Confirmação de e-mail via token recebido
- Login e obtenção do token de sessão
- Verificação do saldo inicial
- Depósito de pontos na caixinha
- Consulta do saldo após operações financeiras
- Criação de um segundo usuário e envio de pontos
- Consulta dos extratos de pontos e caixinha
- Exclusão lógica da conta

Além disso, possíveis inconsistências ou falhas lógicas são capturadas nos logs via `console.warn` e detalhadas nesta documentação.

## Evidências

- Todos os testes passaram? Veja detalhes e logs em [`evidencias_jornada.txt`](./evidencias_jornada.txt).
- Avisos importantes sobre inconsistências do backend são reportados via `console.warn` e estão documentadas abaixo (Bugs encontrados).

## Respostas ao desafio

### 1. Bugs encontrados

- **Após realizar depósito na caixinha, o saldo normal não é descontado conforme esperado**, permanecendo em 100, e o saldo da caixinha em várias execuções foi retornado como 0 (quando deveria ser 30).
- **Cenário esperado:** saldo normal deveria diminuir de acordo com o valor depositado na caixinha (de 100 para 70) e o saldo da caixinha refletir o depósito (30).
- ***Evidência automática:***

console.warn
Saldo da caixinha esperado: 30, recebido: 0. Possível bug na lógica do backend.

console.warn
Saldo normal esperado: 70, recebido: 100. Possível bug na lógica do backend.

- Mais detalhes e logs completos no arquivo [`evidencias_jornada.txt`](./evidencias_jornada.txt).


- **Tempo médio do teste deste fluxo:** 1.554 segundos

---

### 2. Fluxo: Depósito de valores inválidos na caixinha

- **Descrição:**  
Testes com valores inválidos de depósito (-10, 0, 'abc', null, undefined) esperavam erro HTTP 400.

- **Observado:**  
A API aceitou várias dessas requisições com status 200, sem rejeitar o valor inválido.

- **Evidência no log dos testes:**

console.warn
API aceitou valor inválido para depósito: -10. Status 200 recebido.

console.warn
API aceitou valor inválido para depósito: 0. Status 200 recebido.

console.warn
API aceitou valor inválido para depósito: abc. Status 200 recebido.

console.warn
API aceitou valor inválido para depósito: null. Status 200 recebido.

console.warn
API aceitou valor inválido para depósito: undefined. Status 200 recebido.


- **Tempo médio total dos testes de valores inválidos:** 4.763 segundos

---

### 3. Fluxo: Cadastro de usuário com CPF repetido

- **Descrição:**  
Tentativa de cadastro com CPF já registrado deveria retornar erro.

- **Observado:**  
O backend retorna erro HTTP 400, mas o corpo da resposta contém a propriedade `"error"` ao invés de `"message"` como esperado.

- **Evidência de resposta:**

{
"error": "duplicate key value violates unique constraint "users_cpf_key""
}


- **Tempo deste teste:** 493 ms

---

### 4. Fluxo: Login com senha incorreta

- **Descrição:**  
Login com senha errada deve falhar com mensagem adequada.

- **Observado:**  
Resposta com status 400 ou 401, corpo com `"error": "Credenciais inválidas"`.

- **Ajuste necessário no teste:**  
Adequar regex da mensagem para aceitar `"credenciais inválidas"`, `"senha inválida"` ou `"não autorizado"`.

- **Tempo deste teste:** 501 ms

---

### 5. Fluxo: Enviar pontos com saldo insuficiente

- **Descrição:**  
Tentativa de enviar pontos acima do saldo do usuário deve ser rejeitada.

- **Observado:**  
Erro HTTP 400 com propriedade `"error"` e mensagem `"Saldo insuficiente"`.

- **Tempo deste teste:** 378 ms

---

## Resumo das Métricas Gerais

| Fluxo                                         | Status | Tempo Médio (aprox.) |
|-----------------------------------------------|--------|---------------------|
| Cadastro Usuário 1                            | Sucesso| 950 ms              |
| Confirmação de Email Usuário 1                | Sucesso| 675 ms              |
| Login Usuário 1                               | Sucesso| 806 ms              |
| Cadastro, Confirmação e Login Usuário 2      | Sucesso| 2.321 s             |
| Consulta saldo inicial Usuário 1              | Sucesso| 1.483 s             |
| Depósito na caixinha Usuário 1                | Sucesso| 1.205 s             |
| Consulta saldo após depósito Usuário 1        | Warns (bug)| 1.554 s          |
| Envio de pontos Usuário 1 para Usuário 2      | Sucesso| 1.477 s             |
| Consulta extrato de pontos                      | Sucesso| 397 ms              |
| Consulta extrato da caixinha                    | Sucesso| 390 ms              |
| Exclusão de conta Usuário 1                     | Sucesso| 922 ms              |
| Cadastro usuário com email repetido             | Sucesso| 467 ms              |
| Cadastro usuário com CPF repetido (ajustar test) | Falha | 493 ms              |
| Login com senha incorreta (ajustar regex)        | Falha | 501 ms              |
| Enviar pontos saldo insuficiente                 | Sucesso| 378 ms              |
| Depósito valores inválidos na caixinha           | Warns (bug) | 4.763 s          |

---

## Conclusão e Recomendações

- Os testes positivos passaram com sucesso e validam o fluxo principal da aplicação conforme documentação.
- Foram identificados dois potenciais bugs relevantes no backend relacionados à manipulação do saldo:
  - Saldo não atualizado corretamente após depósito na caixinha.
  - Aceitação de depósitos com valores inválidos.
- Necessário ajuste nas respostas do backend para envio de mensagens de erro consistentes (`"error"` em vez de `"message"`).
- Ajustes nos testes negativos foram realizados para refletir isso, exceto para duas exceções:
  - Teste de cadastro com CPF repetido: validar `.error` e conteúdo no corpo da resposta.
  - Teste de login com senha incorreta: regex atualizada para considerar `"credenciais inválidas"`.
- Com base nesses achados, o sistema não está pronto para produção até que esses bugs sejam corrigidos e validados.

---

## Evidências detalhadas

Os logs completos da execução dos testes, incluindo os avisos `console.warn` que evidenciam os bugs, estão disponíveis no arquivo [`evidencias_jornada.txt`](./evidencias_jornada.txt) incluído neste repositório.

---

Se desejar, posso ajudar a formatar versões finais do README, enviar sugestões para scripts de instalação e execução, ou auxiliar com qualquer outro conteúdo para sua entrega. Basta pedir!


- **Tempo deste teste:** 493 ms

---

### 4. Fluxo: Login com senha incorreta

- **Descrição:**  
Login com senha errada deve falhar com mensagem adequada.

- **Observado:**  
Resposta com status 400 ou 401, corpo com `"error": "Credenciais inválidas"`.

- **Ajuste necessário no teste:**  
Adequar regex da mensagem para aceitar `"credenciais inválidas"`, `"senha inválida"` ou `"não autorizado"`.

- **Tempo deste teste:** 501 ms

---

### 5. Fluxo: Enviar pontos com saldo insuficiente

- **Descrição:**  
Tentativa de enviar pontos acima do saldo do usuário deve ser rejeitada.

- **Observado:**  
Erro HTTP 400 com propriedade `"error"` e mensagem `"Saldo insuficiente"`.

- **Tempo deste teste:** 378 ms

---

## Resumo das Métricas Gerais

| Fluxo                                         | Status | Tempo Médio (aprox.) |
|-----------------------------------------------|--------|---------------------|
| Cadastro Usuário 1                            | Sucesso| 950 ms              |
| Confirmação de Email Usuário 1                | Sucesso| 675 ms              |
| Login Usuário 1                               | Sucesso| 806 ms              |
| Cadastro, Confirmação e Login Usuário 2      | Sucesso| 2.321 s             |
| Consulta saldo inicial Usuário 1              | Sucesso| 1.483 s             |
| Depósito na caixinha Usuário 1                | Sucesso| 1.205 s             |
| Consulta saldo após depósito Usuário 1        | Warns (bug)| 1.554 s          |
| Envio de pontos Usuário 1 para Usuário 2      | Sucesso| 1.477 s             |
| Consulta extrato de pontos                      | Sucesso| 397 ms              |
| Consulta extrato da caixinha                    | Sucesso| 390 ms              |
| Exclusão de conta Usuário 1                     | Sucesso| 922 ms              |
| Cadastro usuário com email repetido             | Sucesso| 467 ms              |
| Cadastro usuário com CPF repetido (ajustar test) | Falha | 493 ms              |
| Login com senha incorreta (ajustar regex)        | Falha | 501 ms              |
| Enviar pontos saldo insuficiente                 | Sucesso| 378 ms              |
| Depósito valores inválidos na caixinha           | Warns (bug) | 4.763 s          |

---

## Conclusão e Recomendações

- Os testes positivos passaram com sucesso e validam o fluxo principal da aplicação conforme documentação.
- Foram identificados dois potenciais bugs relevantes no backend relacionados à manipulação do saldo:
  - Saldo não atualizado corretamente após depósito na caixinha.
  - Aceitação de depósitos com valores inválidos.
- Necessário ajuste nas respostas do backend para envio de mensagens de erro consistentes (`"error"` em vez de `"message"`).
- Ajustes nos testes negativos foram realizados para refletir isso, exceto para duas exceções:
  - Teste de cadastro com CPF repetido: validar `.error` e conteúdo no corpo da resposta.
  - Teste de login com senha incorreta: regex atualizada para considerar `"credenciais inválidas"`.
- Com base nesses achados, o sistema não está pronto para produção até que esses bugs sejam corrigidos e validados.

---

## Evidências detalhadas

Os logs completos da execução dos testes, incluindo os avisos `console.warn` que evidenciam os bugs, estão disponíveis no arquivo [`evidencias_jornada.txt`](./evidencias_jornada.txt) incluído neste repositório.




