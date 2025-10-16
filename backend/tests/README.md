# Tests - KXRTEX Backend

## Estrutura de Testes

```
tests/
├── setup.js              # Configuração global de testes
├── auth.test.js          # Testes de autenticação
├── booking.test.js       # Testes de bookings
├── validators.test.js    # Testes de validadores
├── integration/          # Testes de integração
│   └── payment.test.js   # Testes de pagamento integrados
└── README.md            # Esta documentação
```

## Configuração do Ambiente de Teste

### 1. Banco de Dados de Teste

Certifique-se de ter PostgreSQL rodando e crie um banco específico para testes:

```sql
CREATE DATABASE kxrtex_test_db;
```

### 2. Arquivo de Configuração

Copie o arquivo `.env.test` e configure as variáveis:

```bash
cp .env.test.example .env.test
```

Principais variáveis para configurar:
```env
DB_NAME=kxrtex_test_db
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
```

### 3. Redis (Opcional)

Para testes completos, certifique-se de ter Redis rodando:

```bash
redis-server
```

## Executando os Testes

### Execução Básica

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage

# Setup automático do ambiente de teste
npm run test:setup
```

### Execução Específica

```bash
# Executar apenas testes de autenticação
npm test auth.test.js

# Executar apenas testes de booking
npm test booking.test.js

# Executar testes de integração
npm test integration/
```

### Limpeza de Dados

```bash
# Limpar dados de teste
npm run test:clean
```

## Utilitários de Teste

O arquivo `setup.js` disponibiliza utilitários globais através de `global.testUtils`:

### Criação de Usuários
```javascript
// Criar usuário padrão
const user = await testUtils.createTestUser();

// Criar usuário com dados específicos
const contratante = await testUtils.createTestUser({
  email: 'contratante@test.com',
  tipo: 'contratante'
});
```

### Criação de Profissionais
```javascript
const professional = await testUtils.createTestProfessional(userId, {
  nome_artistico: 'DJ Test',
  valor_minimo: 50000
});
```

### Criação de Bookings
```javascript
const booking = await testUtils.createTestBooking(contratanteId, profissionalId, {
  status: 'confirmado',
  valor_oferecido: 100000
});
```

### Geração de Tokens
```javascript
const token = testUtils.generateTestToken(userId, userType);
```

### Utilitários Diversos
```javascript
// Aguardar operações assíncronas
await testUtils.wait(500);

// Gerar email aleatório
const email = testUtils.randomEmail();

// Gerar CPF válido
const cpf = testUtils.randomCPF();
```

## Estrutura dos Testes

### Testes de Unidade

Testam componentes individuais como validadores, utilitários e modelos:

```javascript
describe('CPF Validation', () => {
  it('should validate correct CPF', () => {
    expect(validateCPF('11144477735')).toBe(true);
  });
});
```

### Testes de Integração

Testam endpoints da API com banco de dados real:

```javascript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

### Mocks e Stubs

Serviços externos são mockados para testes isolados:

```javascript
// Mock do serviço ASAAS
jest.mock('../../src/services/asaasService', () => ({
  createPayment: jest.fn().mockResolvedValue({
    id: 'pay_test123',
    status: 'PENDING'
  })
}));
```

## Cobertura de Testes

### Métricas Mínimas

- **Linhas**: 70%
- **Funções**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Relatórios

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Visualizar relatório HTML
open coverage/lcov-report/index.html
```

## Boas Práticas

### 1. Isolamento de Testes

Cada teste deve ser independente e limpar seus dados:

```javascript
beforeEach(async () => {
  // Limpar dados antes de cada teste
  await sequelize.truncate({ cascade: true });
});
```

### 2. Dados de Teste Realistas

Use dados que simulem cenários reais:

```javascript
const userData = {
  nome: 'João Silva',
  email: testUtils.randomEmail(),
  cpf_cnpj: testUtils.randomCPF(),
  telefone: '(11) 99999-9999'
};
```

### 3. Testes de Casos Extremos

Teste tanto sucessos quanto falhas:

```javascript
it('should fail with invalid email format', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ email: 'invalid-email' })
    .expect(400);
});
```

### 4. Mensagens Descritivas

Use mensagens claras nos testes:

```javascript
it('should calculate cancellation fee for last-minute cancellation', async () => {
  // Test implementation
});
```

## Debugging

### Logs Verbosos

Para ver logs durante os testes:

```bash
TEST_VERBOSE=true npm test
```

### Executar Teste Específico

```bash
# Executar apenas um teste
npm test -- --testNamePattern="should register a new user"

# Executar com mais detalhes
npm test -- --verbose
```

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique se PostgreSQL está rodando
   - Confirme credenciais no `.env.test`

2. **Timeout em testes**
   - Aumente o timeout no Jest config
   - Verifique se não há vazamentos de memória

3. **Testes dependentes**
   - Certifique-se que testes limpam dados
   - Use `beforeEach` e `afterEach` adequadamente

## Integração Contínua

Os testes são executados automaticamente em:

- **Pull Requests**: Testes completos
- **Push para main**: Testes + coverage
- **Release**: Testes de integração completos

### GitHub Actions

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    npm run test:coverage
    npm run test:clean
```

## Contribuindo

### Adicionando Novos Testes

1. Crie arquivo de teste na pasta apropriada
2. Use os utilitários disponíveis em `testUtils`
3. Siga as convenções de nomenclatura
4. Mantenha cobertura acima de 70%

### Executando Antes de Commit

```bash
# Executar testes antes do commit
npm run test:coverage
```

## Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Sequelize Testing](https://sequelize.org/docs/v6/other-topics/testing/)