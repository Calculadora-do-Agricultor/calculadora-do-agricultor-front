
  

  

  

# Calculadora do Agricultor

  

  

  

![Logo do Projeto](./src/assets/logoEscura.svg)

  

  

  

## 📌 Sobre o Projeto

  

  

  

A **Calculadora do Agricultor** é um software desenvolvido em parceria entre a **FATEC Matão - Luiz Marchesan** e a empresa **Tatu Marchesan**, com o objetivo de auxiliar os agricultores nos cálculos essenciais para otimizar a produção, evitar desperdícios e melhorar a eficiência operacional, colaborando diretamente com a agricultura de precisão.

  

  

  

  

## 🎯 Objetivo

  

  

  

Desenvolvimento de uma calculadora agrícola baseada em fórmulas oferecidas pela **Marchesan**, permitindo que os agricultores realizem cálculos como:

  

  

  

- Distribuição de sementes por metro

  

  

  

- Cálculo de vazão de bicos de pulverização

  

  

  

- Eficiência operacional de implementos

  

  

  

- Conversões de unidades agrícolas

  

  

  

- Entre outros...

  

  

  

  

## 🚀 Tecnologias Utilizadas

  

  

  

*  **React:** Biblioteca JavaScript para construção de interfaces de usuário.

  

  

  

*  **Vite:** Ferramenta de build extremamente rápida para desenvolvimento web moderno.

  

  

  

-  **Tailwind CSS** – Framework CSS para estilização eficiente.

  

  

  

-  **Firebase** – Autenticação, banco de dados NoSQL e hospedagem.

  

  

  

  

## 📌 Funcionalidades

  

  

  

- Cadastro e login de usuários com autenticação segura

  

  

  

- Disponibilidade automática de cálculos agrícolas

  

  

  

- Registro de logs de localização (geolocalização anônima)
  - Coleta de dados de localização durante o cadastro de usuários
  - Armazenamento seguro em coleção dedicada no Firebase
  - Solicitação de permissão via modal informativo
  - Registro de logs mesmo quando a permissão é negada

  

  

  

- Interface responsiva e intuitiva

  

  

  

- Possibilidade de criar novas fórmulas e cálculos personalizados

  

  

  

  

## 🛠️ Como Configurar o Projeto

  

  

  

### 1️⃣ Requisitos

  

  

  

- Node.js instalado

  

  

  

- Firebase configurado

  

  

  

- Visual Studio Code instalado

  

  

  

- Git instalado

  

  

  

  

### 2️⃣ Clonar o Repositório

  

  

  

```sh

git  clone  https://github.com/Calculadora-do-Agricultor/calculadora-do-agricultor-front.git

cd  calculadora-do-agricultor-front

```

  

  

  

  

### 3️⃣ Instalar Dependências

  

  

  

```sh

npm  install

```

  

  

  

  

### 4️⃣ Configurar Firebase

  

  

  

1. Criar um projeto no Firebase

2. Criar um arquivo `.env.local` na raiz do projeto e adicionar as credenciais do Firebase:



```

VITE_FIREBASE_API_KEY=your_api_key

VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain

VITE_FIREBASE_PROJECT_ID=your_project_id

VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket

VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id

VITE_FIREBASE_APP_ID=your_app_id

```

  

  

  

  

### 5️⃣ Roda o projeto

  

  

  

Inicie o servidor de desenvolvimento com: `npm run dev` ou `yarn dev` ou `pnpm run dev`

  

  

```sh

npm  run  dev

```

  

  

Abra o aplicativo no seu navegador: `http://localhost:5173` (ou a porta especificada pelo Vite).

  

  

  

## 🛠️ Build para produção

  

  

  

Para construir uma versão otimizada para produção:

  

  

  

```bash

npm  run

```

  

  

## 🧱 Estrutura do Projeto

  

  

```

/calculadora-do-agricultor-front
│-- src
│ │-- assets # Arquivos processados e otimizados durante o bundling
│ │-- components # Componentes reutilizáveis
│ │-- pages # Páginas principais
│ │-- hooks # Hooks personalizados
│ │-- services # Comunicação com Firebase e APIs externas
│ │-- styles # Arquivos de estilização global 
│ └-- App.jsx # Componente raiz da aplicação
│-- public # Arquivos estáticos (ícones, imagens, etc.)
│-- package.json # Dependências do projeto
└-- vite.config.js # Configuração do Vite

```

  

  

## 🔀 Estrutura de Branches

  

  

-  `main`: Versão estável e pronta para produção.

  

-  `develop`: Branch principal para desenvolvimento.

  

-  `homologation`: Branch destinada para testes antes da fusão na `main`.

  

  

## 🔹 Padrões de Commits e Pull Requests

  

  

Para manter um histórico claro e organizado, siga as diretrizes abaixo:

  

  

### Commits

  

  

Use a convenção **Conventional Commits**, por exemplo:

  

  

```

feat: implementar dashboard de métricas

fix: corrigir erro na exibição de notificações

chore: atualizar versão das bibliotecas

refactor: melhorar lógica de manipulação de estados

```

  

  

Tipos recomendados:

  

  

-  `feat`: Implementação de nova funcionalidade

  

-  `fix`: Correção de falhas ou bugs

  

-  `docs`: Atualização de documentação

  

-  `style`: Alterações de estilo ou formatação (sem impactar o código funcional)

  

-  `refactor`: Melhorias no código sem alterar comportamento

  

-  `chore`: Tarefas gerais, como atualização de dependências e configuração

  

  

### Pull Requests

  

  

1.  **Crie uma nova branch baseada na `develop`**:

  

```bash

git  checkout  -b  feature/nova-funcionalidade 

```

  

2.  **Faça suas alterações e commits respeitando a convenção.**

  

3.  **Envie as mudanças para o repositório remoto:**

  

```bash

git  push  origin  feature/nova-funcionalidade

```

  

4.  **Abra um Pull Request** e aguarde a análise e aprovação da equipe.

  

  

  

  

## 📜 Licença

  

  

  

Este projeto é de uso educacional e não possui uma licença comercial.

  

  

  

  

## 📢 Contato

  

  

- Instituições:

  

	- [Fatec Matão - Luiz Marchesan](https://fatecmatao.edu.br/site-fatec/)

  

	- [Tatu Marchesan](https://www.marchesan.com.br/)

  

  

- Equipe de Desenvolvimento:

  

	- [Clara Domitila Chence](https://github.com/clarachence)

	- [Hadrian Gabriel Souza Silva](https://github.com/hadriansilva-cps)
	
	- [Hugo Miranda Machado Barroso](https://github.com/HugoM1randa)

	- [Isabela Neves da Silva](https://github.com/IsabelaNeves1)

	- [Ramon dos Santos](https://github.com/RamonSantos10)

  

  

  

  

Caso tenha sugestões ou encontre bugs, por favor, abra uma [issue](https://github.com/Calculadora-do-Agricultor/calculadora-do-agricultor-front/issues) no repositório.