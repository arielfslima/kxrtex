# Comandos Úteis - KXRTEX

Referência rápida de comandos para desenvolvimento do projeto.

## 🔧 Setup Inicial

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais
```

### Mobile
```bash
cd mobile
npm install
cp .env.example .env
# Configurar API_URL
```

## 💾 Banco de Dados (Prisma)

### Criar Database
```bash
# PostgreSQL
createdb kxrtex

# Ou via SQL
psql -U postgres
CREATE DATABASE kxrtex;
\q
```

### Migrations
```bash
cd backend

# Criar primeira migration
npx prisma migrate dev --name init

# Criar nova migration após mudanças no schema
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations (produção)
npx prisma migrate deploy

# Reset do banco (CUIDADO: apaga tudo!)
npx prisma migrate reset
```

### Prisma Studio (Interface Visual)
```bash
cd backend
npx prisma studio
# Abre em http://localhost:5555
```

### Regenerar Prisma Client
```bash
cd backend
npx prisma generate
```

## 🚀 Executar Projeto

### Backend - Desenvolvimento
```bash
cd backend
npm run dev
# Servidor em http://localhost:3000
```

### Backend - Produção
```bash
cd backend
npm start
```

### Mobile - Desenvolvimento
```bash
cd mobile
npm start

# Ou específico para plataforma:
npm run android
npm run ios
npm run web
```

### Executar tudo (em terminais separados)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Mobile
cd mobile && npm start
```

## 📦 Gerenciamento de Dependências

### Instalar nova dependência

**Backend:**
```bash
cd backend
npm install nome-do-pacote
```

**Mobile:**
```bash
cd mobile
npm install nome-do-pacote
```

### Verificar dependências desatualizadas
```bash
npm outdated
```

### Atualizar dependências
```bash
npm update
```

### Reinstalar dependências (limpar)
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🔍 Debugging e Testes

### Verificar logs do servidor
```bash
cd backend
npm run dev
# Logs aparecem no terminal
```

### Limpar cache do Expo
```bash
cd mobile
npx expo start -c
```

### Testar API com curl
```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "senha": "Test1234",
    "tipo": "CONTRATANTE",
    "nome": "Teste",
    "telefone": "(11)99999-9999",
    "cpfCnpj": "12345678900",
    "tipoPessoa": "PF"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "senha": "Test1234"
  }'

# Get Me (substitua TOKEN)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🗄️ PostgreSQL

### Conectar ao banco
```bash
psql -U postgres -d kxrtex
```

### Comandos úteis do psql
```sql
-- Listar tabelas
\dt

-- Descrever tabela
\d nome_da_tabela

-- Ver dados
SELECT * FROM usuarios;

-- Sair
\q
```

### Dump do banco (backup)
```bash
pg_dump -U postgres kxrtex > backup.sql
```

### Restore do banco
```bash
psql -U postgres kxrtex < backup.sql
```

## 🔄 Git

### Setup inicial
```bash
git init
git add .
git commit -m "Initial setup: backend + mobile structure"
```

### Workflow recomendado
```bash
# Criar branch para feature
git checkout -b feature/nome-da-feature

# Fazer commits
git add .
git commit -m "feat: descrição da mudança"

# Voltar para main e fazer merge
git checkout main
git merge feature/nome-da-feature

# Deletar branch
git branch -d feature/nome-da-feature
```

### Convençõesdede commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 🧹 Limpeza

### Limpar node_modules
```bash
# Backend
cd backend && rm -rf node_modules

# Mobile
cd mobile && rm -rf node_modules

# Ambos
rm -rf backend/node_modules mobile/node_modules
```

### Limpar cache do Expo
```bash
cd mobile
rm -rf .expo .expo-shared
```

### Limpar builds do Prisma
```bash
cd backend
rm -rf node_modules/.prisma
npx prisma generate
```

## 📱 Expo Específico

### Ver dispositivos conectados
```bash
cd mobile
npx expo start
# Pressionar 'a' para Android, 'i' para iOS
```

### Gerar build de produção
```bash
cd mobile
eas build --platform android
eas build --platform ios
```

### Publicar update OTA
```bash
cd mobile
eas update
```

## 🔐 Variáveis de Ambiente

### Verificar .env
```bash
# Backend
cat backend/.env

# Mobile
cat mobile/.env
```

### Gerar chave JWT segura
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📊 Monitoramento

### Ver uso de porta
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Matar processo na porta
```bash
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

## 🧪 Testes (quando implementado)

### Rodar testes
```bash
cd backend
npm test

cd mobile
npm test
```

### Coverage
```bash
npm test -- --coverage
```

## 📦 Build e Deploy (futuro)

### Build do backend
```bash
cd backend
npm run build
```

### Deploy (exemplo Heroku)
```bash
heroku create kxrtex-api
git push heroku main
heroku run npx prisma migrate deploy
```

## 🆘 Troubleshooting

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
# Windows
sc query postgresql-x64-15

# Linux/Mac
sudo service postgresql status

# Reiniciar PostgreSQL
# Windows
net stop postgresql-x64-15
net start postgresql-x64-15

# Linux
sudo service postgresql restart

# Mac
brew services restart postgresql
```

### Erro de prisma client
```bash
cd backend
rm -rf node_modules/.prisma
npx prisma generate
```

### Erro de build do Expo
```bash
cd mobile
rm -rf node_modules .expo
npm install
npx expo start -c
```

### Porta já em uso
```bash
# Mudar porta do backend
# Editar .env: PORT=3001

# Ou matar processo
lsof -ti:3000 | xargs kill -9  # Mac/Linux
```

---

**Dica**: Salve este arquivo como referência rápida durante o desenvolvimento!
