# PhotoCheck - App de Câmera Forense

> **App profissional para documentação fotográfica em laudos e perícias**

[![Expo](https://img.shields.io/badge/Expo-v53.0-blue.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-v0.79-green.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-blue.svg)](https://www.typescriptlang.org/)

## 📸 Sobre o App

PhotoCheck é um aplicativo profissional de câmera desenvolvido especificamente para documentação fotográfica em laudos técnicos, perícias e documentação jurídica. O app captura fotos com overlay de informações forenses permanentes, incluindo GPS, data/hora e metadados EXIF completos.

## ✨ Funcionalidades Principais

- 📸 **Captura Dupla**: Foto original + foto com overlay forense
- 📍 **GPS de Alta Precisão**: Coordenadas com 6 casas decimais
- 🕐 **Timestamp Imutável**: Data/hora nos metadados EXIF
- 🗺️ **Endereço Reverso**: Conversão automática GPS → endereço
- 📋 **Overlay Configurável**: Posição e elementos personalizáveis
- 💾 **Organização Automática**: Álbum dedicado "PhotoCheck"
- 🔍 **Múltiplas Lentes**: Suporte a zoom ótico (0.5x, 1x, 2x)
- 📱 **Interface Profissional**: Design otimizado para uso técnico

## 🚀 Como Usar

### Instalação via Expo Go

1. Instale o [Expo Go](https://expo.dev/go) no seu dispositivo
2. Escaneie o QR code do projeto ou acesse via link
3. Permita acesso à câmera, localização e galeria

### Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/photocheck.git

# Instale as dependências
cd photocheck
npm install

# Inicie o servidor de desenvolvimento
npx expo start
```

## 📱 Capturas de Tela

| Câmera Principal                            | Configurações                    | Overlay Forense                 |
| ------------------------------------------- | -------------------------------- | ------------------------------- |
| Interface limpa com controles profissionais | Configuração completa do overlay | Informações permanentes na foto |

## 🛠️ Tecnologias

- **React Native** + **Expo SDK 53**
- **TypeScript** para tipagem segura
- **expo-camera** - Captura profissional
- **expo-location** - GPS de alta precisão
- **expo-media-library** - Gerenciamento de fotos
- **react-native-view-shot** - Captura de overlay

## 📋 Permissões Necessárias

- **Câmera**: Para captura de fotos
- **Localização**: Para coordenadas GPS
- **Galeria**: Para salvar fotos documentadas

## 🔒 Privacidade

- Todos os dados permanecem no dispositivo
- Não há coleta de informações pessoais
- GPS usado apenas para metadados das fotos
- Código aberto para transparência total

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para profissionais que precisam de documentação fotográfica confiável.

---

**📧 Contato:** seu.email@exemplo.com  
**🔗 GitHub:** [github.com/seu-usuario/photocheck](https://github.com/seu-usuario/photocheck)
