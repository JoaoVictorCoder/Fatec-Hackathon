# :coffee: Fatec Hackathon

<div align="center">

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-3b7a57?style=for-the-badge)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Database](https://img.shields.io/badge/database-Prisma%20%2B%20SQLite%2FSQL-2d3748?style=for-the-badge&logo=prisma&logoColor=white)

</div>

---

## :bust_in_silhouette: Sobre o projeto

Sistema de **credenciamento e controle de acesso para eventos**, com foco em:

- cadastro publico de participantes
- emissao de credencial com **QR Code** e **PDF**
- painel administrativo para operacao, auditoria e gestao
- area de operador para validacao de entrada
- recursos de relatorio, backup e acompanhamento de acessos

O projeto foi estruturado para separar claramente os fluxos de **Publico**, **Admin** e **Operador QR**, reduzindo acoplamento entre interface, API e persistencia.

## :rocket: Tecnologias e ferramentas

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,js,nodejs,express,prisma,docker,sqlite" />
</div>

Principais tecnologias usadas no sistema:

- **Frontend:** React, React Router e Vite
- **Backend:** Node.js, Express e Prisma
- **Persistencia:** banco modelado com Prisma
- **Infra local:** Docker Compose
- **Documentos:** PDFKit para geracao de credenciais

## :open_file_folder: Estrutura principal

```text
Fatec-Hackathon/
|-- frontend/
|   `-- src/
|       |-- api/
|       |-- components/
|       |-- constants/
|       |-- utils/
|       `-- App.jsx
|-- backend/
|   |-- prisma/
|   `-- src/
|       |-- adapters/
|       |-- application/
|       |-- controllers/
|       |-- providers/
|       |-- repositories/
|       |-- routes/
|       `-- services/
`-- docs/
    `-- MANUTENCAO.md
```

## :gear: Funcionalidades principais

### :earth_americas: Area publica

- cadastro de credenciados
- validacao de campos e mascara de documentos
- geracao de credencial
- acesso ao PDF da credencial
- exibicao do QR Code apos cadastro

### :closed_lock_with_key: Area administrativa

- login autenticado com sessao
- listagem e busca de credenciados
- edicao de dados cadastrais
- reemissao e alteracao de status da credencial
- auditoria e analytics
- logs de acesso
- relatorio de visitantes por stand
- gestao de usuarios internos
- exportacao e monitoramento de backup

### :iphone: Area do operador QR

- login exclusivo para operacao
- leitura e validacao de check-in
- historico resumido de validacoes

## :triangular_ruler: Arquitetura

O backend segue uma organizacao inspirada em **arquitetura hexagonal**, com separacao entre:

- **ports/use-cases:** contratos e regras de aplicacao
- **adapters:** integracoes com banco, PDF, QR e catraca
- **repositories:** acesso a dados com Prisma
- **controllers/routes:** camada HTTP

No frontend, o arquivo `frontend/src/App.jsx` centraliza a navegacao e a composicao das tres jornadas do sistema.
O contrato HTTP do frontend fica concentrado em `frontend/src/api/credenciamentoApi.js`.

## :satellite: Rotas principais

### Publicas

- `POST /credenciados`
- `GET /credenciais/:id/pdf`
- `GET /credenciais/:id/qrcode`
- `GET /health`

### Autenticacao

- `POST /auth/login`
- `POST /auth/operator/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/operator/me`

### Administrativas

- `GET /admin/credenciados`
- `GET /admin/credenciados/:id`
- `PUT /admin/credenciados/:id`
- `DELETE /admin/credenciados/:id`
- `GET /admin/eventos`
- `GET /admin/audit-logs`
- `GET /admin/users`
- `GET /admin/access-logs`
- `GET /admin/backup/status`
- `POST /admin/backup/export`

### Operador

- `GET /operator/me`
- `POST /operator/check-in/validate`
- `GET /operator/history-basic`

## :computer: Como executar

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker compose up --build
```

## :key: Perfis do sistema

- `MASTER_ADMIN`: acesso total, usuarios, permissoes e backup
- `ADMIN`: operacao administrativa geral
- `OPERADOR_QR`: validacao de entrada em campo
- `COMISSAO_ORGANIZADORA`: operacao e acompanhamento com escopo controlado

## :bar_chart: Dados e regras relevantes

- status de credenciamento: `CADASTRADO`, `APROVADO`, `BLOQUEADO`, `CHECKED_IN`, `INATIVO`
- status de credencial: `GERADA`, `ATIVA`, `INATIVA`, `UTILIZADA`, `CANCELADA`
- aceite LGPD obrigatorio no cadastro
- compartilhamento com expositores controlado por consentimento
- logs e auditoria para acoes sensiveis

## :seedling: Carbono e deslocamento

O formulario publico tambem considera dados de deslocamento, com:

- cidade de origem
- tipo de combustivel
- distancia estimada
- pegada de carbono simplificada

Isso permite alimentar os dashboards de descarbonizacao no painel administrativo.

## :memo: Documentacao de manutencao

Para modificacoes manuais futuras, consulte:

- [docs/MANUTENCAO.md](docs/MANUTENCAO.md)

Esse guia explica:

- onde alterar campos, filtros e papeis
- quais arquivos participam de cada fluxo
- pontos de acoplamento sensiveis
- ordem segura para mudancas estruturais

## :warning: Limitacoes atuais

- integracao fisica com catraca ainda esta em modo mock
- layout institucional do PDF ainda usa placeholders visuais
- o foco principal continua em operacao local e demonstracao

## :pray: Resumo

Este repositório concentra um sistema completo de credenciamento com fluxo publico, administrativo e operacional, organizado para permitir evolucao futura com menos retrabalho e maior previsibilidade nas alteracoes.
