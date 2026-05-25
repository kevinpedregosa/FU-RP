# Duckweed Frond Counter

Computer vision app for counting duckweed fronds from petri dish images. The
project combines a FastAPI backend, a Next.js frontend, classical image
segmentation, optional YOLO inference, result history, overlays, exports, and
manual count correction for research workflows.

## 🌟 Highlights

- Upload duckweed images and generate frond-count estimates.
- Review original and segmented overlays side by side.
- Correct counts manually when research accuracy requires human review.
- Browse recent analysis history and reopen previous runs.
- Export results as JSON or CSV.
- Run locally with Docker Compose or separate backend/frontend dev servers.

## ℹ️ Overview

This software helps researchers estimate duckweed frond counts from images. The
backend preprocesses images, segments likely frond regions, filters common petri
dish artifacts, estimates merged fronds, and stores inference results. The
frontend provides an approachable interface for uploads, result review, manual
correction, and dataset management.

The project is designed for research iteration: automated counts give a useful
starting point, while manual corrections preserve the ability to record verified
counts for later model improvement.

## 🚀 Running The App

Start the backend:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the website:

```text
http://localhost:3000
```

Backend API docs:

```text
http://localhost:8000/docs
```

## 🧪 Testing

Run backend tests:

```bash
cd backend
source .venv/bin/activate
python -m pytest tests/ -v
```

Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

Run inference on a local image:

```bash
cd backend
source .venv/bin/activate
python scripts/test_inference.py --image /path/to/duckweed.jpg --save-overlay --verbose
```
