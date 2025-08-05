# 📱 Guia de Publicação - PhotoCheck no Expo

## ✅ Pré-requisitos Completos

### 1. Conta Expo (Gratuita)

```bash
# Instalar Expo CLI
npm install -g @expo/cli

# Fazer login na conta Expo
expo login
```

### 2. Verificar Configurações

- ✅ `app.json` configurado com todas as informações
- ✅ `package.json` com metadados completos
- ✅ README.md profissional
- ✅ LICENSE (MIT)
- ✅ PRIVACY.md (política de privacidade)
- ✅ Ícones e splash screen criados

## 🚀 Processo de Publicação

### Passo 1: Publicar no Expo Go (Gratuito)

```bash
# Navegar para o diretório do projeto
cd /Users/paulojunior/Public/Fonts/PhotoCheck

# Verificar se está logado
expo whoami

# Publicar no Expo Go
expo publish
```

### Passo 2: Publicar na Expo Gallery

```bash
# Enviar para galeria pública do Expo
expo publish --release-channel production
```

## 📱 Para Builds Standalone (Opcional)

### Android (Google Play Store)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar build
eas build:configure

# Build para Android
eas build --platform android

# Submit para Play Store (requer conta desenvolvedor)
eas submit --platform android
```

### iOS (App Store)

```bash
# Build para iOS
eas build --platform ios

# Submit para App Store (requer conta desenvolvedor)
eas submit --platform ios
```

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
npm start

# Testar no Android
npm run android

# Testar no iOS
npm run ios

# Verificar erros
npm run lint
```

### Publicação

```bash
# Publicar versão de desenvolvimento
expo publish --release-channel dev

# Publicar versão de produção
expo publish --release-channel production

# Ver estatísticas do app
expo analytics
```

## 📊 Após a Publicação

1. **URL do App**: `https://expo.dev/@seu-usuario/photocheck`
2. **QR Code**: Gerado automaticamente para compartilhamento
3. **Estatísticas**: Disponíveis no dashboard do Expo

## 🔄 Atualizações

```bash
# Atualizar versão no package.json e app.json
# Depois publicar novamente
expo publish
```

## ⚠️ Limitações da Conta Gratuita

- ✅ Publicação no Expo Go: **Ilimitada**
- ✅ Builds de desenvolvimento: **Limitados por mês**
- ❌ Builds de produção: **Requer plano pago ou configuração manual**

## 🎯 Próximos Passos

1. **Publicar no Expo Go** (gratuito e imediato)
2. **Compartilhar QR Code** com usuários
3. **Coletar feedback** dos usuários
4. **Iterar e melhorar** baseado no feedback
5. **Considerar build standalone** quando necessário

## 📞 Suporte

- **Documentação Expo**: https://docs.expo.dev
- **Comunidade**: https://forums.expo.dev
- **Discord**: https://chat.expo.dev

---

**🚀 Pronto para publicar!** Todos os arquivos estão configurados corretamente.
