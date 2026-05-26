# Duckweed Frond Counter

Full-stack computer vision system for counting duckweed fronds from top-down
sample images. The project combines a FastAPI backend, a Next.js frontend,
classical image segmentation, optional YOLO instance segmentation, result
history, overlays, exports, and manual count correction for research workflows.

## Current Interface

The frontend has been redesigned as a research-forward bioimage analysis tool:

- Black instrument-style interface with white typography and green data accents.
- Animated wireframe mesh on the landing page.
- Fusion Research Project branding and logo in the hero.
- Upload, history, admin, and results screens restyled for a scientific workflow.
- Duckweed sample imagery used in the landing page problem section.
- Large data-forward statistics and simplified navigation.

## Features

- Upload JPEG, PNG, TIFF, or WEBP sample images.
- Run automated duckweed frond counting.
- Review original and segmented result imagery.
- Compare classical and YOLO-derived counts where available.
- Apply manual corrections to result counts.
- Browse recent analysis history.
- Export result records as JSON or CSV.
- Add corrected results back into the dataset for future model improvement.

## Project Structure

```text
.
├── backend/                 FastAPI app, CV pipeline, database, tests
│   ├── app/api/routes/       Health, upload, inference, dataset routes
│   ├── app/core/             Preprocessing, segmentation, counting, overlays
│   ├── app/ml/               YOLO inference/training helpers
│   ├── storage/              Local uploads/results/exports
│   ├── dataset/              Dataset files
│   └── Dockerfile
├── frontend/                Next.js app
│   ├── app/                  App routes
│   ├── components/           Landing, upload, results, shared components
│   ├── public/               Static assets, including Fusion logo and duckweed photo
│   └── Dockerfile
└── docker-compose.yml
```

## Run Locally

Use two terminal windows.

### Backend

```bash
cd /Users/kevinpedregosa/FU-RP/backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Health check:

```bash
curl http://127.0.0.1:8000/api/health
```

API docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd /Users/kevinpedregosa/FU-RP/frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is already occupied, Next.js may choose another port such as
`3001`. Use the URL printed by `npm run dev`.

## Run With Docker Compose

From the repo root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

Useful Docker commands:

```bash
docker compose up backend
docker compose logs -f backend
docker compose down
```

The backend container uses `python:3.11-slim` and installs OpenCV/system runtime
libraries, including `libgl1` for Debian Trixie compatibility.

## Run A Sample Image Analysis

1. Start the backend on port `8000`.
2. Start the frontend on port `3000`.
3. Open:

```text
http://localhost:3000/upload
```

4. Drop or select a duckweed sample image.
5. Click the bioimage analysis action.
6. Review the generated result page and export or correct the count if needed.

You can also run inference directly from the backend:

```bash
cd /Users/kevinpedregosa/FU-RP/backend
source .venv/bin/activate
python scripts/test_inference.py --image /path/to/duckweed.jpg --save-overlay --verbose
```

## Tests And Checks

Backend tests:

```bash
cd /Users/kevinpedregosa/FU-RP/backend
source .venv/bin/activate
python -m pytest tests/ -v
```

Frontend lint/build:

```bash
cd /Users/kevinpedregosa/FU-RP/frontend
npm run lint
npm run build
```

## Environment Notes

Backend environment values can be configured in `backend/.env`.

Common backend values:

```text
DATABASE_URL
STORAGE_DIR
MODELS_DIR
ENVIRONMENT
LOG_LEVEL
ALLOWED_ORIGINS
```

Frontend API configuration is read from:

```text
NEXT_PUBLIC_API_URL
```

For local development, the frontend expects the backend to be reachable at
`http://localhost:8000` or `http://127.0.0.1:8000`, depending on environment.

## Notes For Future Work

- Keep backend API contracts stable when changing the frontend.
- Keep uploaded/result files out of git unless they are intentional examples.
- Run `npm run build` after UI changes.
- Run backend tests after changing API routes, database models, or CV pipeline code.
