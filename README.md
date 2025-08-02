# Testes End-to-End – Rethink Bank (API Pública)

Este projeto automatiza todos os cenários principais, negativos, de borda, segurança e resiliência do Rethink Bank utilizando **Jest + Supertest** diretamente sobre a API pública:  
https://points-app-backend.vercel.app

---

## ✨ Stack Utilizada

- **Jest**: execução/organização dos testes automatizados.
- **Supertest**: requisições HTTP automatizadas.

---

## Como executar os testes

1. **Instale as dependências:**
npm install

text

2. **Execute todos os testes:**  
npm test

text
O resultado também pode ser salvo em arquivo:
npm test > evidencias_completo.txt

text

3. **Relatório de cobertura (coverage):**
npm run test:coverage

text
- O resumo aparece no terminal.
- O HTML detalhado é gerado em `/coverage/lcov-report/index.html`.

> **Nota:** Coverage pode aparecer como 0% pois a API é externa (não há código local a ser instrumentado).

---

## Evidências dos testes

- Todos os logs e avisos gerados em tempo de execução estão disponíveis em [`evidencias_completo.txt`](./evidencias_completo.txt).
- **Principais evidências geradas nos avisos/warnings:**

console.warn
Saldo da caixinha esperado: 30, recebido: 0. Possível bug na lógica do backend.

console.warn
Saldo normal esperado: 70, recebido: 100. Possível bug na lógica do backend.

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

text
- **Todos os arquivos de teste finalizam com “PASS”** indicando sucesso dos fluxos — exceto as inconsistências acima (relatadas no backend/negativos).

---

## Organização dos testes

Arquivos organizados em `/tests`, por categoria:
- `happyPath.e2e.test.js` — Jornada completa do usuário
- `negativos.e2e.test.js` — Validações, duplicados, bloqueios
- `borda.e2e.test.js` — Inputs extremos, limites
- `seguranca.e2e.test.js` — Testes de autorização e token
- `resiliencia.e2e.test.js` — Requisições malformadas/campos errados

---

## Resumo e recomendações

- **Principais fluxos passaram**, mas bugs críticos precisam ser corrigidos:
  1. Saldo e caixinha não atualizam corretamente após depósito (ver evidências).
  2. API aceita depósito de valores negativos/nulos/texto (ver evidências).
- O arquivo [`evidencias_completo.txt`](./evidencias_completo.txt) traz todos os detalhes dos testes, logs e warnings para análise do time de QA/desenvolvimento.

---

## Relatório de cobertura

- Execute `npm run test:coverage` para visualizar.
- O link do relatório detalhado: `/coverage/lcov-report/index.html`
- **Observação:** Como a automação testa uma API pública sem acesso ao backend/instrumentação, o coverage aparece 0%.

## Conclusão técnica e criticidade dos bugs

Após a execução abrangente da suíte de testes (happy path, negativos, borda, segurança e resiliência), todos os fluxos principais operam, mas foram identificados **dois bugs críticos**:

### 1. Saldo não atualizado após depósito na caixinha
- **Criticidade:** ALTA
- **Impacto:** Compromete completamente a transparência, confiabilidade e rastreabilidade do controle financeiro da plataforma. Pode permitir manipulação ou inconsistência de saldos.
- **Status encontrado:** O saldo normal não é descontado e o saldo da caixinha permanece em 0 após depósito, contrariando a lógica do produto.

### 2. API aceita valores inválidos para depósito
- **Criticidade:** ALTA
- **Impacto:** Permite manipulação indevida do sistema (depósito de valores negativos, nulos ou não numéricos), abrindo brecha para exploração, fraudes ou corrupção de dados financeiros.
- **Status encontrado:** API responde status 200 para depósitos inválidos, sem bloquear essas operações.

### 3. Mensagens de erro inconsistentes
- **Criticidade:** MÉDIA
- **Impacto:** Dificulta o uso automático e o debug da API, e pode prejudicar a integração com outros sistemas e a experiência do usuário.

---

**Resumo Final:**
- Como ambos bugs são classificados como de criticidade ALTA, o sistema, nesta versão, **não está pronto para produção**.
- Recomenda-se **correção urgente** dos fluxos de saldo/validação de valores, e uma revisão das mensagens de erro antes de qualquer Go Live.

---

Todas as evidências detalhadas podem ser consultadas em [`evidencias_completo.txt`](./evidencias_completo.txt) para análise detalhada do comportamento atual da API.
