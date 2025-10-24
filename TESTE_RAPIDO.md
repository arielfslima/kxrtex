# Guia de Teste Rápido - KXRTEX

## ✅ APIs Configuradas

- **ASAAS**: Configurado (Sandbox/Homologação)
- **Cloudinary**: Quase pronto (falta adicionar CLOUD_NAME)

## 🚀 Como Testar

### 1. Obter Cloud Name do Cloudinary

1. Acesse: https://console.cloudinary.com/
2. No Dashboard, procure por "Cloud Name" (geralmente aparece no topo)
3. Copie o Cloud Name (algo como `dxxxxxx` ou o nome que você escolheu)
4. Atualize no arquivo `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME="SEU_CLOUD_NAME_AQUI"
   ```

### 2. Reiniciar o Backend

Depois de adicionar o Cloud Name:

```bash
cd backend

# Ctrl+C para parar o servidor atual

npm run dev
```

### 3. Acessar a Aplicação Web

A aplicação web já deve estar rodando em:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### 4. Fluxo de Teste Completo

#### A. Criar Contas

**Criar Contratante:**
1. Acesse http://localhost:5173
2. Clique em "Cadastrar"
3. Escolha "Contratante"
4. Preencha os dados:
   - Nome: Seu Nome
   - Email: seuemail@test.com
   - Telefone: (11) 99999-9999
   - CPF: 123.456.789-00
   - Senha: SuaSenha123
5. Clique em "Cadastrar"

**Criar Artista:**
1. Abra uma aba anônima/privada
2. Acesse http://localhost:5173
3. Clique em "Cadastrar"
4. Escolha "Artista"
5. Preencha os dados:
   - Nome: Nome do Artista
   - Nome Artístico: DJ Test
   - Email: artista@test.com
   - Telefone: (11) 98888-8888
   - CPF: 987.654.321-00
   - Categoria: DJ
   - Cidade: São Paulo
   - Valor Base: 500
   - Senha: SuaSenha123
6. Clique em "Cadastrar"

#### B. Testar Upload de Imagens (Artista)

1. Na conta do artista, clique em "Perfil"
2. **Foto de Perfil:**
   - Clique ou arraste uma imagem
   - Deve mostrar preview
   - Clique em "Salvar Imagem"
   - Aguarde upload ✅

3. **Portfolio:**
   - Role para baixo até "Portfolio"
   - Clique ou arraste múltiplas imagens
   - Clique em "Adicionar X Imagem(ns)"
   - Aguarde upload ✅
   - Você pode deletar imagens clicando em "Remover" ao passar o mouse

#### C. Testar Busca e Booking (Contratante)

1. Na conta do contratante, clique em "Artistas"
2. Procure o artista que você criou
3. Clique no card do artista
4. Veja o portfolio com as imagens que você enviou ✅
5. Clique em "Solicitar Booking"
6. Preencha:
   - Data do Evento: Qualquer data futura
   - Horário: 20:00
   - Duração: 4 horas
   - Local: Nome do Local, São Paulo - SP
   - Descrição: Evento de teste
   - Orçamento: 500
7. Clique em "Enviar Proposta"

#### D. Testar Negociação e Chat (Artista)

1. Na conta do artista, clique em "Bookings"
2. Veja a proposta PENDENTE
3. Clique no booking
4. **Testar Chat:**
   - Digite uma mensagem
   - Veja o indicador de "digitando..." na outra aba
   - Envie a mensagem
   - A mensagem aparece em tempo real ✅
5. **Aceitar Booking:**
   - Role para baixo
   - Clique em "Aceitar Booking"
   - Status muda para ACEITO ✅

#### E. Testar Pagamento PIX (Contratante)

1. Na conta do contratante, acesse o booking
2. Clique em "Realizar Pagamento"
3. Selecione "PIX"
4. Clique em "Confirmar Pagamento"
5. **Você verá:**
   - QR Code gerado pelo ASAAS (sandbox) ✅
   - Código PIX para copiar ✅
   - Mensagem de aguardando pagamento ✅

**NOTA:** No ambiente sandbox do ASAAS, o pagamento não será realmente processado. Para testar o fluxo completo, você precisaria:
- Usar a API de teste do ASAAS para simular pagamento
- OU configurar um webhook de teste
- OU mudar para ambiente de produção (não recomendado para testes)

#### F. Testar Check-in (Artista)

**IMPORTANTE:** O check-in só funciona:
- Quando o status está CONFIRMADO
- Entre 2h antes e 1h depois do horário do evento
- Dentro de 500m do local (se houver coordenadas)

Para testar:
1. Se necessário, altere a data/hora do booking no banco para estar na janela válida
2. Na conta do artista, acesse o booking CONFIRMADO
3. Clique em "Fazer Check-in"
4. Permita acesso à localização
5. Tire/selecione uma foto
6. Clique em "Confirmar Check-in"
7. **Resultado:**
   - Status muda para EM_ANDAMENTO ✅
   - Mensagem no chat informando check-in ✅
   - 50% do pagamento liberado ✅

#### G. Testar Check-out (Artista)

1. Na conta do artista, acesse o booking EM_ANDAMENTO
2. Clique em "Fazer Check-out"
3. Confirme a localização
4. Clique em "Confirmar Check-out"
5. **Resultado:**
   - Status muda para CONCLUIDO ✅
   - Mensagem no chat informando check-out ✅
   - Restante do pagamento será liberado em 48h ✅

#### H. Testar Avaliações

1. **Contratante avalia artista:**
   - Acesse o booking CONCLUIDO
   - Clique em "Avaliar Artista"
   - Dê nota de 1-5 estrelas em cada critério:
     - Profissionalismo
     - Pontualidade
     - Comunicação
     - Performance
     - Condições de Trabalho
     - Respeito
   - Escreva um comentário
   - Clique em "Enviar Avaliação" ✅

2. **Artista avalia contratante:**
   - Na conta do artista, acesse o booking
   - Clique em "Avaliar Contratante"
   - Dê notas nos mesmos critérios
   - Envie a avaliação ✅

3. **Ver avaliações:**
   - Acesse o perfil do artista
   - Veja a média de avaliações atualizada ✅

## 🐛 Troubleshooting

### Upload de Imagens não funciona

**Erro:** "Erro ao fazer upload"

**Solução:**
1. Verifique se você adicionou o CLOUDINARY_CLOUD_NAME no .env
2. Reinicie o backend
3. Verifique os logs do backend para ver o erro específico

### Pagamento não gera QR Code

**Erro:** "Erro ao criar pagamento"

**Solução:**
1. Verifique se o ASAAS_API_KEY está correto no .env
2. Verifique se o ASAAS_API_URL está apontando para sandbox
3. Verifique os logs do backend
4. Teste a API do ASAAS diretamente:
   ```bash
   curl https://sandbox.asaas.com/api/v3/customers \
     -H "access_token: $aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjAyZTkwYjBmLTUyZjEtNGYyNC05OTc2LTgwMTgwMDYxNGE1MDo6JGFhY2hfYTBkOGMwMzMtZTcwNi00MTc0LTg2Y2QtOWZlNjIwNWYzMzI2"
   ```

### Chat não funciona em tempo real

**Solução:**
1. Verifique se o Socket.IO está conectado (abra o console do navegador)
2. Verifique se o backend está rodando
3. Teste enviando mensagens - devem aparecer em tempo real

### Check-in rejeitado

**Erro:** "Check-in só pode ser feito entre 2h antes e 1h após o início do evento"

**Solução:**
1. O check-in tem validação de tempo
2. Para testar, altere a data/hora do evento no banco para estar na janela válida
3. Ou espere até estar na janela de tempo real

## 📊 Verificar Dados no Banco

Para ver os dados sendo criados:

```bash
cd backend
npx prisma studio
```

Isso abre uma interface visual em http://localhost:5555 onde você pode ver todas as tabelas e dados.

## 🎯 Checklist de Teste Completo

- [ ] Cloudinary Cloud Name configurado
- [ ] Backend reiniciado
- [ ] Conta de Contratante criada
- [ ] Conta de Artista criada
- [ ] Foto de perfil do artista enviada
- [ ] Imagens do portfolio enviadas
- [ ] Booking criado
- [ ] Chat funcionando em tempo real
- [ ] Booking aceito
- [ ] Pagamento PIX iniciado (QR Code gerado)
- [ ] Check-in realizado
- [ ] Check-out realizado
- [ ] Avaliações trocadas
- [ ] Avaliação média atualizada no perfil

## ✅ Tudo Funcionando?

Se todos os itens acima funcionaram, **PARABÉNS!** 🎉

Sua plataforma KXRTEX está 100% funcional e pronta para testes mais avançados ou deploy em produção!

## 📞 Próximos Passos

1. **Testes mais extensivos** com múltiplos usuários
2. **Deploy em ambiente de staging** (Heroku, Railway, Render)
3. **Configurar webhook do ASAAS** para receber confirmações de pagamento reais
4. **Completar o Mobile** (15% restante - Chat UI, Payment UI, Review UI)
5. **Testes de carga** para verificar performance
