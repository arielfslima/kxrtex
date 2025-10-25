#!/bin/bash

# Script para rodar migrations no Railway
# Execute este script após o primeiro deploy

echo "🚂 Rodando migrations no Railway..."

# Instalar Railway CLI (se não tiver)
if ! command -v railway &> /dev/null
then
    echo "📦 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Login (vai abrir navegador)
echo "🔐 Fazendo login no Railway..."
railway login

# Link ao projeto
echo "🔗 Conectando ao projeto..."
railway link

# Rodar migrations
echo "📊 Executando migrations..."
railway run npx prisma migrate deploy

# Seed de dados iniciais (categorias, etc)
echo "🌱 Inserindo dados iniciais..."
railway run npx prisma db seed

echo "✅ Migrations concluídas!"
echo "🎉 Seu backend está pronto!"
