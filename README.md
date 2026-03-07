# Checkpoint 2 - Refinamento Operacional + Alinhamento Hackathon

Evolucao incremental do projeto existente para uso mais real em evento, mantendo separacao entre area publica e area admin.

## Principais ajustes desta etapa

- Remocao de `RG` do cadastro e do modelo.
- Documento flexivel por categoria (`CPF`, `CNPJ` ou ambos).
- `PCD` como classificacao adicional para qualquer categoria.
- `nacionalidade` para visitante.
- Consulta publica de status removida (status apenas no admin).
- PDF da credencial em formato A4 dobravel em 4 paineis.
- Cores por categoria no PDF.
- Edicao admin de cadastro.
- Exclusao logica (inativacao) no admin.
- Mudanca de status da credencial e reemissao.
- Check-in ajustado para registrar multiplas entradas sem bloqueio por duplicidade.
- Auditoria para acoes sensiveis.
- Entidade `Evento` adicionada e vinculada ao credenciamento.
- Mapeamento de perfil organizacional alinhado ao enunciado:
  - `ADMIN` -> `Admin`
  - `LEITOR_CATRACA` e `APP_GATE` -> `LeitorCatraca`
- Estrutura hexagonal explicita (incremental):
  - `src/application/use-cases`
  - `src/application/ports/in`
  - `src/application/ports/out`
  - `src/adapters/out/*`
- Descarbonizacao mock em background (sem API externa de mapas), com tabela e dashboard admin.

## Rotas publicas

- `POST /credenciados`
- `GET /credenciais/:id/pdf`
- `GET /credenciais/:id/qrcode`
- `GET /health`

## Rotas auth

- `POST /auth/login`
- `POST /auth/operator/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/operator/me`

## Rotas admin

- `GET /admin/credenciados`
- `GET /admin/credenciados/:id`
- `PUT /admin/credenciados/:id`
- `PATCH /admin/credenciados/:id/status`
- `DELETE /admin/credenciados/:id` (exclusao logica)
- `GET /admin/credenciados/:id/historico`
- `POST /admin/credenciados/comissao-organizadora`
- `GET /admin/eventos`
- `GET /admin/audit-logs`
- `POST /admin/check-in/validate`
- `GET /admin/analytics/overview`
- `GET /admin/analytics/fraud`
- `GET /admin/analytics/descarbonizacao`
- `GET /admin/credenciais/:id`
- `PUT /admin/credenciais/:id`
- `PATCH /admin/credenciais/:id/status`
- `POST /admin/credenciais/:id/reemitir`
- `GET /admin/eventos-cadastro`
- `GET /admin/users`
- `POST /admin/users`
- `PUT /admin/users/:id`
- `PATCH /admin/users/:id/active`
- `PATCH /admin/users/:id/permissions`
- `GET /admin/access-logs`
- `GET /admin/access-logs/:id`
- `GET /admin/backup/status`
- `POST /admin/backup/export`

## Rotas operador

- `GET /operator/me`
- `POST /operator/check-in/validate`
- `GET /operator/history-basic`

## Modelos (Prisma)

- `Credenciado`
- `Credencial`
- `EventoSistema`
- `AdminUser`
- `AuditLog`
- `GateDevice`
- `AccessAttempt`
- `Evento`
- `DescarbonizacaoRegistro`

## Status relevantes

- Credenciamento: `CADASTRADO`, `APROVADO`, `BLOQUEADO`, `CHECKED_IN`, `INATIVO`
- Credencial: `GERADA`, `ATIVA`, `INATIVA`, `UTILIZADA`, `CANCELADA`

## LGPD aplicado

- Aceite obrigatorio no cadastro.
- Minimizacao de dados em respostas publicas.
- Listagem admin com mascaramento de dados sensiveis.
- Detalhes completos apenas em area admin autenticada/autorizada.
- Audit log para acoes administrativas e validacoes de acesso.

## Como rodar

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name checkpoint2_refine
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Docker:

```bash
docker compose up --build
```

## Credenciais seed

- Master Admin: `master@evento.com` / `Master@123`
- Admin: `admin@evento.com` / `Admin@123`
- Gate: `gate@evento.com` / `Gate@123`
- Leitor Catraca: `leitor@evento.com` / `Leitor@123`

## Perfis e permissoes

- `MASTER_ADMIN`: acesso maximo, gestao de usuarios, permissoes, backup.
- `ADMIN`: operacao administrativa ampla (sem gestao total de usuarios por padrao).
- `OPERADOR_QR`: operacao mobile de validacao de entrada com permissao customizada por flags.

## Carbono e cidades

- Formulario publico com:
  - cidade de origem
  - combustivel
  - distancia automatica para cidades vizinhas de Franca
  - pegada de carbono estimada (simplificada)
- Cidades mapeadas:
  - Restinga (6.5 km)
  - Patrocinio Paulista (32.5 km)
  - Cristais Paulista (30 km)
  - Ribeirao Corrente (40 km)
  - Batatais (60 km)
  - Claraval (37.5 km)
  - Ibiraci (51.5 km)
  - Sao Jose da Bela Vista (44 km)

## Backup e contingencia

- Volume de backup: `backup_data` no `docker-compose`.
- Export manual:
```bash
cd backend
npm run backup:export
```
- Export por API (somente `MASTER_ADMIN`):
  - `POST /admin/backup/export`
- Status de backup:
  - `GET /admin/backup/status`
- Restore simples para demo:
  - subir banco limpo e importar dados do JSON exportado via script/manual conforme necessidade operacional.

## Limitacoes pendentes

- Layout institucional do PDF usa placeholders para logos.
- Integracao fisica de catraca continua mock.
- Sem exclusao fisica como fluxo principal (apenas exclusao logica).
