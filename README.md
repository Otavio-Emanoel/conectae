![Conectae Logo](assets/logo.png)

# Conectae

Conectae é um aplicativo mobile construído com React Native e Expo, focado em criação de posts, câmera integrada, perfis de usuário e navegação simples.

## Recursos

- Tela de câmera para capturar fotos
- Criar e visualizar posts
- Login / Cadastro
- Perfil do usuário e configurações
- Integração com bibliotecas Expo (camera, image picker)

## Tecnologias

- Expo
- React Native
- TypeScript
- react-native-gesture-handler
- react-native-reanimated

## Pré-requisitos

- Node.js (recomendado >= 16)
- Yarn ou npm
- Expo CLI (opcional, mas recomendado)

Instale o Expo CLI globalmente se preferir:

```bash
npx expo-cli --version || npm i -g expo-cli
```

## Instalação

1. Clone o repositório:

```bash
git clone <repo-url>
cd conectae
```

2. Instale dependências:

```bash
npm install
# ou
yarn
```

3. Execute o projeto (Expo):

```bash
npm run start
# ou
yarn start
```

Para abrir no emulador/dispositivo:

```bash
npm run android
npm run ios
npm run web
```

## Scripts (package.json)

- `start`: inicia o Metro / Expo
- `android`: abre no Android via Expo
- `ios`: abre no iOS via Expo
- `web`: abre no navegador via Expo

## Estrutura do projeto

- `App.tsx` - ponto de entrada do app
- `src/components/` - telas e componentes UI (CameraScreen, HomeScreen, ProfileScreen, etc.)
- `assets/` - imagens e ícones (inclui o logo em `assets/logo.png`)
- `package.json` - dependências e scripts

Exemplo de arquivos principais:

- [App.tsx](App.tsx)
- [src/components/CameraScreen.tsx](src/components/CameraScreen.tsx)
- [src/components/CreatePostScreen.tsx](src/components/CreatePostScreen.tsx)
- [src/components/HomeScreen.tsx](src/components/HomeScreen.tsx)

## Personalização

- Substitua `assets/logo.png` pelo seu logo mantendo o mesmo nome para que o README e o app o encontrem automaticamente.

## Contribuição

Contribuições são bem-vindas — abra uma issue ou um pull request.

## Licença

Este projeto está sob licença MIT (adicione um arquivo LICENSE se desejar).
