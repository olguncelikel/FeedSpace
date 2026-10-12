# Simple Social Feed Frontend

React and Vite frontend for the FastAPI backend.

## Run

Start the API from the repository root:

```bash
.venv/bin/python main.py
```

Then, in this directory:

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The Vite development server proxies `/api` requests to the FastAPI server on port 8000. Set `VITE_API_URL` to use a different API base in another environment.
