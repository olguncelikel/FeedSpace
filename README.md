# Simple Social Feed

A full-stack social feed application with a FastAPI backend and a React/Vite frontend.

## Features

- User registration and JWT authentication
- Authenticated image and video uploads through ImageKit
- Captions and community feed
- Owner-only post deletion
- SQLite persistence
- Docker Compose setup for the backend and frontend

## Project Structure

```text
FastAPI/
├── app/                 # FastAPI application, database, auth, ImageKit
├── frontend/            # React/Vite application
├── Dockerfile           # Backend container
├── docker-compose.yml   # Backend + frontend services
├── main.py              # Local backend entrypoint
├── requirements.txt
└── .env.example
```

## Local Development

Create a virtual environment and install backend dependencies:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env
```

Start the backend in one terminal:

```bash
.venv/bin/python main.py
```

Start the frontend in another terminal:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Open http://localhost:5173. The Vite server proxies `/api` requests to FastAPI on port 8000.

API documentation is available at http://localhost:8000/docs.

## Docker Compose

Docker Desktop is required. Make sure `.env` exists and contains `JWT_SECRET` and `IMAGEKIT_PRIVATE_KEY`.

Build and start both services:

```bash
docker compose up --build
```

Open http://localhost:5173. The frontend Nginx server proxies API requests to the backend container. SQLite data is stored in the named `db_data` volume.

Stop the services:

```bash
docker compose down
```

To also remove the Docker database volume:

```bash
docker compose down -v
```

## Environment Variables

Use [.env.example](.env.example) as the template. Never commit `.env` or database files.

- `JWT_SECRET`: secret used to sign JWT access tokens
- `IMAGEKIT_PRIVATE_KEY`: ImageKit server-side private key
- `IMAGEKIT_PUBLIC_KEY`: optional client-side ImageKit key
- `IMAGEKIT_URL_ENDPOINT`: ImageKit delivery endpoint

## Security Notes

- `.env`, SQLite databases, virtual environments, and build output are ignored by Git.
- Rotate credentials immediately if they are ever committed publicly.
- The current SQLite setup is suitable for local development. Use migrations and a production database for deployment.
