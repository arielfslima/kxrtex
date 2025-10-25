# Google Maps API Setup for Location Autocomplete

## APIs Necessárias

Para o autocomplete funcionar corretamente, você precisa habilitar as seguintes APIs no Google Cloud Console:

1. **Places API (NEW)** - Obrigatória para autocomplete
   - https://console.cloud.google.com/marketplace/product/google/places-backend.googleapis.com

2. **Places API** - API antiga, ainda necessária para compatibilidade
   - https://console.cloud.google.com/marketplace/product/google/places.googleapis.com

3. **Geocoding API** - Para obter coordenadas e componentes de endereço
   - https://console.cloud.google.com/marketplace/product/google/geocoding-backend.googleapis.com

## Como Habilitar

1. Acesse: https://console.cloud.google.com/
2. Selecione seu projeto ou crie um novo
3. No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
4. Pesquise cada API acima e clique em "Ativar"

## Verificar API Key

Sua API key atual: `AIzaSyA_50_Ix2-aFOjO8yP-NL_Fn-FRz26aQZU`

1. Vá em "APIs e Serviços" > "Credenciais"
2. Encontre sua API key
3. Clique em "Editar"
4. Em "Restrições de API":
   - Marque "Restringir chave"
   - Selecione as 3 APIs listadas acima
5. Em "Restrições de aplicativo":
   - Para desenvolvimento: "Nenhum" (menos seguro mas mais fácil)
   - Para produção: Configure restrições de IP/domínio

## Testar API

Execute este comando para testar se a API está funcionando:

```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=av+paulista&key=AIzaSyA_50_Ix2-aFOjO8yP-NL_Fn-FRz26aQZU&language=pt-BR&components=country:br"
```

Se retornar JSON com sugestões = API funcionando ✅
Se retornar erro = precisa habilitar APIs no console ❌

## Problemas Comuns

### Erro: "This API project is not authorized to use this API"
- Solução: Habilitar "Places API (NEW)" no console

### Erro: "REQUEST_DENIED"
- Solução: Verificar se a API key está correta e se as APIs estão habilitadas

### Nenhuma sugestão aparece
- Verificar console.log no app (npx expo start)
- Ver mensagens de erro do Google Places
- Verificar conexão com internet

## Debug

No app, abra o console do Expo e procure por:
- `GooglePlacesAutocomplete Error:` - erros da biblioteca
- `Place selected:` - quando usuário seleciona endereço
- `Place details:` - detalhes do endereço selecionado

## Reiniciar o Expo

Após configurar as APIs, reinicie o Expo com cache limpo:

```bash
cd mobile
npx expo start -c
```
