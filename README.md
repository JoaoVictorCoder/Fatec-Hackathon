# Base de projeto: Frontend HTML + Backend Python

Estrutura criada:

```
frontend/
  index.html
  styles.css
  app.js
backend/
  app.py
  requirements.txt
.gitignore
```

## 1) Backend (Python + Flask)

No terminal:

```bash
cd backend
python -m venv .venv
```

Ative o ambiente virtual:

- Windows (PowerShell):

```bash
.venv\Scripts\Activate.ps1
```

Instale dependencias e rode:

```bash
pip install -r requirements.txt
python app.py
```

Backend em: `http://127.0.0.1:5000`

### Banco SQL

O backend usa SQLite via SQLAlchemy.

- Arquivo do banco: `backend/instance/app.db` (criado automaticamente ao iniciar o backend)
- Tabela inicial: `tasks`

## 2) Frontend (HTML/CSS/JS)

Em outro terminal:

```bash
cd frontend
python -m http.server 5500
```

Frontend em: `http://127.0.0.1:5500`

## Endpoints iniciais

- `GET /api/health`
- `GET /api/message`
- `GET /api/tasks`
- `POST /api/tasks`

Exemplo de criacao de task:

```bash
curl -X POST http://127.0.0.1:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Primeira task\"}"
```
