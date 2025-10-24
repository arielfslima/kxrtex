# 🎯 Como Visualizar o KXRTEX Mobile

## ✅ Status Atual

- **Backend**: ✅ RODANDO (porta 3000)
- **Database**: ✅ PostgreSQL conectado
- **Frontend Mobile**: ⚠️ Código pronto, mas Expo Web tem bugs no Windows

## 🐛 Problema com Expo Web

O Expo 50 tem um bug conhecido no Windows que tenta criar um diretório com o nome `node:sea` (contém dois-pontos), o que é inválido no sistema de arquivos do Windows.

## 📱 3 Formas de Visualizar o App

### Opção 1: Expo Go (RECOMENDADO - Mais Fácil)

1. **Instale o Expo Go no seu celular:**
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Conecte ao mesmo WiFi:**
   - Certifique-se que seu PC e celular estão na mesma rede WiFi

3. **Inicie o Expo:**
   ```bash
   cd mobile
   npx expo start
   ```

4. **Escaneie o QR Code:**
   - Android: Use o app Expo Go para escanear
   - iOS: Use a câmera nativa do iPhone

### Opção 2: Emulador Android

1. **Instale o Android Studio:**
   - Download: https://developer.android.com/studio

2. **Configure um emulador:**
   - Abra Android Studio > Device Manager
   - Create Device > Pixel 6 > System Image (R ou S)

3. **Inicie o Expo com emulador:**
   ```bash
   cd mobile
   npx expo start
   # Pressione 'a' para abrir no Android
   ```

### Opção 3: Converter para Vite + React (Web Puro)

Se você realmente precisa rodar no navegador web, posso converter o projeto para Vite, que não tem os bugs do Expo.

**Passos:**
1. Criar novo projeto Vite com React
2. Copiar os componentes e telas
3. Adaptar React Native components para web (View → div, Text → span, etc.)
4. Manter a mesma lógica de negócio

**Tempo estimado:** 30-40 minutos

## 🧪 Testando a API Diretamente

Enquanto isso, você pode testar a API diretamente:

### 1. Criar um Artista

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"dj@test.com\",
    \"senha\": \"Senha123\",
    \"tipo\": \"ARTISTA\",
    \"nome\": \"DJ Kxrtex\",
    \"telefone\": \"(11) 91234-5678\",
    \"cpfCnpj\": \"12345678901\",
    \"nomeArtistico\": \"DJ Underground\",
    \"categoria\": \"DJ\",
    \"bio\": \"DJ especializado em techno\",
    \"valorBaseHora\": 500
  }"
```

### 2. Listar Artistas

```bash
curl http://localhost:3000/api/artists
```

### 3. Criar um Contratante

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"contratante@test.com\",
    \"senha\": \"Senha123\",
    \"tipo\": \"CONTRATANTE\",
    \"nome\": \"João Silva\",
    \"telefone\": \"(11) 98765-4321\",
    \"cpfCnpj\": \"98765432100\"
  }"
```

### 4. Fazer Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"contratante@test.com\",
    \"senha\": \"Senha123\"
  }"
```

### 5. Usar Postman/Insomnia

Você também pode importar a coleção de requisições em:
- Postman: https://www.postman.com/downloads/
- Insomnia: https://insomnia.rest/download

Todas as rotas estão documentadas em `backend/MVP_BACKEND_SUMMARY.md`

## 📊 Resumo

**O que está pronto:**
- ✅ Backend 100% funcional (40+ endpoints)
- ✅ Database PostgreSQL configurado
- ✅ Código do frontend mobile (5 telas completas)
- ✅ Componentes e serviços React
- ✅ Design system implementado

**O que falta:**
- ⚠️ Resolver o problema do Expo Web no Windows
  - Solução temporária: Usar Expo Go no celular
  - Solução permanente: Converter para Vite ou usar Expo 54 (requer migração React 19)

## 🚀 Próximos Passos Recomendados

1. **Testar com Expo Go** (5 minutos) - Forma mais rápida de ver funcionando
2. **Ou:** Converter para Vite (40 minutos) - Se precisar rodar no navegador
3. **Testar a API** com Postman/Insomnia para validar o backend

---

Qual opção você prefere seguir? Posso te ajudar com qualquer uma delas! 🎵
