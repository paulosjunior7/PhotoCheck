# 📱 Guia de Publicação - PhotoCheck no Expo

## ✅ Pré-requisitos Completos

### 1. Conta Expo (Gratuita)

```bash
# Instalar Expo CLI e EAS CLI
npm install -g @expo/cli eas-cli

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

### Passo 1: Configurar EAS e Publicar

```bash
# Navegar para o diretório do projeto
cd /Users/paulojunior/Public/Fonts/PhotoCheck

# Verificar se está logado
expo whoami

# Configurar EAS (primeira vez)
eas update:configure

# Publicar update
eas update --branch preview --message "Primeira versão do PhotoCheck"
```

### Passo 2: Criar Build para Expo Go

```bash
# Criar build de desenvolvimento para Expo Go
eas build --profile development --platform all
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
# Publicar update de desenvolvimento
eas update --branch preview --message "Versão de desenvolvimento"

# Publicar update de produção
eas update --branch production --message "Versão de produção"

# Ver estatísticas do app
expo analytics
```

## 📊 Após a Publicação

✅ **PhotoCheck está publicado com sucesso!**

### 📱 Como Outras Pessoas Podem Baixar:

#### **Método 1: Link Direto (Mais Fácil)**

1. **Compartilhe este link**: `https://expo.dev/@paulosjunior7/photocheck`
2. A pessoa abre o link no celular
3. Clica em "Open with Expo Go"
4. O app abre automaticamente no Expo Go

#### **Método 2: QR Code**

1. Acesse: `https://expo.dev/@paulosjunior7/photocheck`
2. Mostre o QR code na tela
3. A pessoa escaneia com o Expo Go
4. O app carrega automaticamente

#### **Método 3: Buscar no Expo Go**

1. Abrir o app Expo Go
2. Ir em "Search" ou "Explore"
3. Buscar por: `@paulosjunior7/photocheck`
4. Tocar para abrir

### 📲 **Pré-requisitos para Usuários:**

**1. Instalar Expo Go (Gratuito):**

- **iOS**: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Google Play - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

**2. Permissões necessárias:**

- ✅ Câmera (para tirar fotos)
- ✅ Localização (para GPS)
- ✅ Galeria (para salvar fotos)

### 🔗 **Links para Compartilhar:**

- **📱 App**: `https://expo.dev/@paulosjunior7/photocheck`
- **⚙️ Dashboard**: `https://expo.dev/accounts/paulosjunior7/projects/photocheck`
- **📊 Updates**: `https://expo.dev/accounts/paulosjunior7/projects/photocheck/updates`

## 🔄 Atualizações

```bash
# Atualizar versão no package.json e app.json
# Depois publicar update
eas update --branch production --message "Nova versão com melhorias"
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
