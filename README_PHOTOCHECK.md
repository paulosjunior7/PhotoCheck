# PhotoCheck - App de Câmera Forense

Um aplicativo profissional de câmera para documentação fotográfica em laudos e perícias, desenvolvido com React Native e Expo.

## 🚀 Funcionalidades

### 📸 Câmera Profissional

- **Máxima qualidade**: Fotos capturadas em resolução máxima (quality: 1.0)
- **Captura dupla**: Foto original limpa + foto com overlay de informações
- **Metadados EXIF completos**: Incluindo data, hora, localização GPS e informações do dispositivo
- **Overlay de informações em tempo real**: Exibe data, hora, coordenadas GPS e endereço
- **Controles profissionais**: Flash, troca de câmera, atualização de GPS
- **Sem perda de qualidade**: Configurações otimizadas para documentação forense
- **Informações "queimadas" na imagem**: Overlay permanente para laudos

### 📍 Geolocalização

- **GPS de alta precisão**: Coordenadas com 6 casas decimais
- **Endereço reverso**: Conversão automática de coordenadas para endereço
- **Indicador de precisão**: Mostra a margem de erro do GPS
- **Metadados GPS no EXIF**: Gravação permanente da localização na foto

### 🗂️ Galeria Especializada

- **Visualização organizada**: Grid de fotos com informações de data/hora
- **Detalhes completos**: Exibição de todos os metadados EXIF
- **Compartilhamento**: Função nativa de compartilhamento
- **Álbum dedicado**: Organização automática em álbum "PhotoCheck"
- **Visualização em tela cheia**: Modal para análise detalhada das fotos

### 📋 Recursos Forenses

- **Timestamp imutável**: Data e hora gravadas nos metadados EXIF
- **Prova de localização**: Coordenadas GPS embutidas na foto
- **Identificação do dispositivo**: Informações do app e versão nos metadados
- **Integridade dos dados**: Preservação de todos os metadados originais

### 🎯 Sistema de Captura Dupla

- **Foto original**: Alta qualidade sem overlay para análise técnica
- **Foto com overlay**: Screenshot com informações "queimadas" para laudos
- **Organização automática**: Ambas salvas no álbum "PhotoCheck"
- **Informações visíveis**: Data, hora, GPS, endereço e dispositivo no overlay

## 🛠️ Tecnologias Utilizadas

- **React Native** com **Expo SDK 53**
- **TypeScript** para tipagem segura
- **expo-camera** para funcionalidades de câmera de alta qualidade
- **expo-location** para GPS de precisão
- **expo-media-library** para gestão de fotos
- **expo-file-system** para manipulação de arquivos

## 📱 Compatibilidade

- ✅ **iOS** (iPhone/iPad)
- ✅ **Android** (smartphones/tablets)
- ⚠️ **Web** (funcionalidade limitada - sem GPS e salvamento)

## 🔧 Configuração e Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Expo CLI: `npm install -g @expo/cli`
- Para iOS: Xcode instalado (apenas em macOS)
- Para Android: Android Studio com emulador ou dispositivo físico

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/photocheck.git
cd photocheck

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npx expo start
```

### Executar no Dispositivo

```bash
# iOS (simulador ou dispositivo)
npx expo run:ios

# Android (emulador ou dispositivo)
npx expo run:android

# Web (funcionalidade limitada)
npx expo start --web
```

## 🔐 Permissões Necessárias

O app solicita as seguintes permissões automaticamente:

### iOS

- **NSCameraUsageDescription**: Acesso à câmera para captura de fotos
- **NSLocationWhenInUsePermission**: GPS para coordenadas nas fotos
- **NSPhotoLibraryAddUsageDescription**: Salvar fotos na galeria

### Android

- **CAMERA**: Acesso à câmera
- **ACCESS_FINE_LOCATION**: GPS de alta precisão
- **ACCESS_COARSE_LOCATION**: GPS básico (fallback)
- **WRITE_EXTERNAL_STORAGE**: Salvar fotos (Android < 10)
- **READ_MEDIA_IMAGES**: Acessar galeria (Android 13+)

## 📖 Como Usar

### 1. Tela da Câmera

1. **Permissões**: Conceda acesso à câmera e localização
2. **Aguarde o GPS**: Verifique se as coordenadas aparecem no overlay
3. **Configure**: Use os botões para ajustar flash e câmera
4. **Capture**: Toque no botão central grande para tirar a foto
5. **Confirmação**: Veja os detalhes da foto capturada no alerta

### 2. Tela da Galeria

1. **Visualizar**: Navegue pelas fotos em grid
2. **Detalhes**: Toque em uma foto para ver informações completas
3. **Compartilhar**: Use o ícone de compartilhamento
4. **Excluir**: Use o ícone da lixeira (confirme a ação)

### 3. Metadados Incluídos

Cada foto contém:

- 📅 **Data e hora exatas** da captura
- 📍 **Coordenadas GPS** (latitude/longitude)
- 🎯 **Precisão do GPS** em metros
- 🏠 **Endereço** do local (quando disponível)
- 📱 **Informações do dispositivo** e app
- 🔧 **Configurações da câmera** utilizadas

## 🔍 Casos de Uso

### Perícias Técnicas

- Documentação de locais de acidente
- Registro de danos em veículos
- Evidências em inspeções prediais
- Laudos de engenharia

### Inspeções Profissionais

- Vistorias de seguros
- Auditorias de qualidade
- Inspeções de segurança
- Relatórios técnicos

### Documentação Legal

- Evidências para processos judiciais
- Registro de patrimônio
- Documentação de estado de conservação
- Provas com validade temporal e geográfica

## 🛡️ Segurança e Privacidade

- **Dados locais**: Todas as fotos ficam armazenadas no dispositivo
- **Sem upload automático**: Nenhuma foto é enviada para servidores externos
- **Metadados preservados**: Informações forenses mantidas íntegras
- **Controle total**: Usuário decide quando e como compartilhar

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte ou dúvidas:

- 📧 Email: seu-email@exemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/photocheck/issues)
- 📚 Documentação: [Expo Camera Docs](https://docs.expo.dev/versions/latest/sdk/camera/)

## 🔄 Versões

### v1.0.0 (Atual)

- ✅ Câmera profissional com máxima qualidade
- ✅ GPS integrado com precisão
- ✅ Galeria com visualização de metadados
- ✅ Overlay de informações em tempo real
- ✅ Suporte completo iOS/Android

### Próximas Versões

- 📋 Formulários customizáveis para diferentes tipos de laudo
- 🔒 Criptografia de fotos sensíveis
- ☁️ Sincronização opcional com cloud
- 📊 Relatórios em PDF com fotos e dados
- 🗂️ Organização por projetos/casos

---

**PhotoCheck** - Documentação fotográfica profissional para laudos e perícias técnicas.
