#!/bin/bash

# Script para fazer deploy do ShopDrop para GitHub Pages
# Uso: bash scripts/deploy-to-github.sh

set -e

echo "🚀 ShopDrop - Deploy para GitHub Pages"
echo "======================================="
echo ""

# Verificar se o repositório GitHub está configurado
if ! gh repo view > /dev/null 2>&1; then
  echo "❌ Erro: Você não está em um repositório GitHub ou não tem acesso."
  echo "Execute: gh repo clone Tsa88/Meu-site"
  exit 1
fi

# Verificar branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "⚠️  Aviso: Você está na branch '$BRANCH'. GitHub Pages usa 'main' por padrão."
  read -p "Deseja continuar? (s/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
  fi
fi

# Build
echo "📦 Fazendo build do projeto..."
pnpm build

if [ ! -d "dist/public" ]; then
  echo "❌ Erro: Diretório dist/public não foi criado."
  exit 1
fi

echo "✓ Build concluído com sucesso"
echo ""

# Commit
echo "📝 Fazendo commit das mudanças..."
git add -A
git commit -m "ShopDrop Deploy - $(date '+%Y-%m-%d %H:%M:%S')" || echo "ℹ️  Nenhuma mudança para commit"

# Push
echo "🔄 Fazendo push para GitHub..."
git push origin main

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximas etapas:"
echo "1. Acesse: https://github.com/Tsa88/Meu-site/settings/pages"
echo "2. Em 'Build and deployment', selecione 'GitHub Actions'"
echo "3. O workflow será acionado automaticamente"
echo "4. Acesse: https://Tsa88.github.io/Meu-site"
echo ""
