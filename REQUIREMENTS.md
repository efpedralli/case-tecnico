Este projeto implementa um MVP para controle de ocupação de ambientes de ensino, com:

- Backend em Node.js + Express + Prisma + PostgreSQL (Docker)
- Frontend em React + Vite + MUI

---

FLUXOS PRINCIPAIS

- Login de admin e aluno
- Cadastro/importação de alunos
- Cadastro de ambientes (salas, laboratórios etc.)
- Check-in / check-out de presença
- Área do estudante (com QR Code para check-in)
- Dashboard de ocupação em tempo real
- Gráficos de ocupação por sala
- Gestão manual de presença por aluno e sala

---

PRÉ-REQUISITOS

- Node.js (versão 20+)
- npm (ou pnpm/yarn)
- Docker e Docker Compose

---

BACKEND

- Em /backend/ criar um arquivo .env constando as variáveis:
  DATABASE_URL=
  JWT_SECRET=
  PORT=3333
  com os dados do banco de dados e uma senha segura JWT.

- Subir banco de dados PostgreSQL com Docker:

cd backend
docker compose up -d

- Instalar as dependências
  npm install

- Rodar as migrações do Prisma
  npx prisma migrate dev

- Popular o banco (seed)
  npm run prisma:seed

- Subir o servidor backend
  npm run dev

---

FRONTEND

- Em /frontend/ criar o arquivo .env com a variável
  VITE_API_URL:
  Que deverá conter a url e a porta da API

- Instalar as dependências
  npm install

- Rodar frontend
  npm run dev

---

FLUXOS DE AUTENTICAÇÃO

ADMIN

- Acessar o frontend na url e porta informada ao iniciar o frontend.
- Usar as credenciais do seed
  -- E-mail: admin@case.com
  -- Senha: 123456
  Será redirecionado ao Dashboard

ESTUDANTE

- O admin deve criar o aluno em /students ou via importação com arquivo XLSX
- A senha padrão do aluno é a matricula
- O aluno faz login escolhendo no seletor "Estudante" e informando a matricula e a senha, mesma da matricula
- Aluno terá acesso à área do estudante que contem as salas disponíveis, leitor de QR Code para check-in e histórico dos seus check-ins

---

FUNCIONALIDADES

ADMIN

- Na tela inicial de dashboard:
  -- Cards com total de presentes e quantidade de espaços monitorados
  -- Formulário para cadastro de novo ambiente com nome do ambiente, tipo, bloco e capacidade
  -- Tabela de ocupação por ambiente com organizador de crescente e decrescente
  --- Ao clicar sobre o ambiente nesta tabela, será redirecionado à tela de Gestão de Sala

- Tela de Gestão de Sala
  -- Lista dos estudantes, com busca pelo nome ou matricula e tabela com ordenação por nome e matricula.
  -- Na listagem é possível fazer o check-in e check-out dos estudantes presentes na sala pelo checkbox.
  -- QR Code do espaço selecionado
  -- Gráfico para gestão da ocupação ao longo do tempo, atualizado em tempo real.

- Tela Alunos
  -- Cadastro manual de alunos com nome, curso, matrícula e e-mail
  -- Importação via excel para inserção em massa de alunos no sistema
  -- Listagem de alunos com busca pelo nome ou matricula.
  -- Ao clicar sobre um aluno na tabela redirecionará à tela de Histórico e Dados do Aluno.

- Tela Histórico e Dados do Aluno
  -- Tabela com o histórico de presenças do aluno com data e hora de check-in e check-out
  -- Inserção de check-in e check-out manualmente, selecionando uma sala e atribuindo check-in ou check-out do aluno. Também é mostrado se o aluno está com check-in ativo em qual sala.
  -- Formulário para atualização dos dados do aluno
  -- Botão para deletar o aluno (soft delete, marca o estudante como deletedAt)

- Tela Registro de Presenças
  -- É possível selecionar um aluno e um ambiente para fazer o check-in diretamente.

ESTUDANTE

- Área do estudante mostra:
  -- Onde está o estudante, caso esteja com check-in
  -- Botão que redireciona à tela de leitura de QR Code
  -- Listagem de salas disponíveis ao aluno para fazer check-in

- Tela Ler QR Code da Sala
  -- Ao permitir a câmera, o aluno pode fazer a leitura do QR Code que, assim que reconhecido, faz o check-in do aluno na sala correspondente

- Tela Histórico
  -- Aluno tem acesso ao histórico dos seus check-ins
