# 📸 Sistema de Captura com Overlay - PhotoCheck

## 🎯 Funcionalidade Implementada

O PhotoCheck agora captura **duas versões** de cada foto:

### 1. 📷 Foto Original (Alta Qualidade)

- **Resolução máxima** da câmera
- **Metadados EXIF completos** (GPS, data, hora, dispositivo)
- **Sem overlay visual** - foto limpa
- **Para análise técnica** e arquivamento

### 2. 🖼️ Foto com Overlay (Para Laudo)

- **Screenshot da tela completa** incluindo as informações sobrepostas
- **Informações "queimadas" na imagem**:
  - 📋 **LAUDO FOTOGRÁFICO** (título)
  - 📅 **DATA:** dd/mm/aaaa
  - 🕐 **HORA:** hh:mm:ss
  - 📍 **GPS:** latitude, longitude (6 casas decimais)
  - 🎯 **PRECISÃO:** ±XXm
  - 🏠 **LOCAL:** endereço completo
  - 📱 **DISPOSITIVO:** PhotoCheck v1.0
- **Para apresentação** em laudos e relatórios

## 🔧 Como Funciona Tecnicamente

### Captura Dupla

```typescript
// 1. Foto da câmera (alta qualidade)
const cameraPhoto = await cameraRef.current.takePictureAsync({
  quality: 1.0, // Máxima qualidade
  exif: true, // Metadados completos
});

// 2. Screenshot da tela (com overlay)
const screenshotUri = await captureRef(viewShotRef, {
  format: "jpg",
  quality: 1.0,
});
```

### Organização na Galeria

- Ambas as fotos são salvas no **álbum "PhotoCheck"**
- **Nome automático** com timestamp
- **Sequência clara**: original seguida do overlay

## 📱 Experiência do Usuário

### Ao Tirar a Foto

1. **Posicione** o dispositivo
2. **Aguarde** o GPS aparecer no overlay
3. **Toque** no botão de captura
4. **Confirmação** aparece mostrando:
   - ✅ 2 versões salvas
   - 📊 Detalhes técnicos da captura

### Na Galeria do Celular

- **Álbum "PhotoCheck"** com todas as fotos
- **Duas fotos por captura**:
  1. Foto limpa (para análise)
  2. Foto com informações (para laudo)

## 🎨 Design do Overlay

### Estilo Profissional

- **Fundo semitransparente** preto (80% opacidade)
- **Bordas arredondadas** e borda sutil
- **Fonte monoespaçada** para aspecto técnico
- **Cores diferenciadas**:
  - 🟡 **Título** em dourado (destaque)
  - ⚪ **Labels** em cinza claro
  - ⚪ **Valores** em branco
  - 🔴 **Avisos** em vermelho (quando sem GPS)

### Layout Organizado

```
📋 LAUDO FOTOGRÁFICO
📅 DATA:     02/08/2025
🕐 HORA:     14:32:15
📍 GPS:      -23.550520, -46.633309
🎯 PRECISÃO: ±3m
🏠 LOCAL:    Rua Augusta, 123
             Consolação, São Paulo-SP
───────────────────────────────────
📱 DISPOSITIVO: PhotoCheck v1.0
```

## 🔍 Casos de Uso

### Para Perícias

- **Foto limpa**: análise técnica detalhada
- **Foto com overlay**: apresentação em laudo

### Para Inspeções

- **Foto limpa**: documentação interna
- **Foto com overlay**: relatório ao cliente

### Para Processos Legais

- **Foto limpa**: evidência técnica
- **Foto com overlay**: prova contextualizada

## 📊 Vantagens do Sistema

### ✅ Conformidade Legal

- **Metadados preservados** na foto original
- **Informações visíveis** na foto do laudo
- **Rastreabilidade completa** de local e tempo

### ✅ Flexibilidade

- **Duas versões** para diferentes necessidades
- **Qualidade preservada** na foto original
- **Apresentação profissional** no overlay

### ✅ Produtividade

- **Captura única** gera ambas as versões
- **Organização automática** na galeria
- **Informações completas** sempre disponíveis

## 🚀 Próximas Melhorias

### v1.1 (Planejado)

- **Overlay customizável** por tipo de laudo
- **Logotipo da empresa** no overlay
- **Numeração sequencial** de fotos

### v1.2 (Futuro)

- **Overlay com assinatura digital**
- **QR Code** para verificação
- **Templates** predefinidos por área

---

**PhotoCheck v1.0** - Documentação fotográfica profissional com overlay integrado para laudos técnicos.
