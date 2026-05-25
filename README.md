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

## 📚 Documentation Standards

Your documentation is a direct reflection of your software, so hold it to the
same standards as your code. After much practice, this project follows a simple
recipe for writing READMEs that lowers the barrier to understanding and using
the software.

This guidance is geared toward projects that do not yet, or never will, have
fully fleshed-out documentation. Once a project has a dedicated website, the
README should become a minimal elevator pitch and a link hub for relevant
materials.

### 🌟 Highlights

A "Highlights" section is one of the most important sections to include near the
top of a good README. It should be a simple, bulleted list of the main selling
points of the software.

Main takeaways:

- Make it inviting, friendly, and approachable.
- Find the most appealing part of the software and sell it.
- Keep it concise; nobody has time for a manifesto.
- Link to everything relevant, such as documentation, CI status, and deployments.
- Use emojis when they improve scanning and friendliness.
- Provide a template or quick path for users to get started.

### ℹ️ Overview

If nothing else, write better READMEs because it makes a project look more
professional and legitimate. A good README should include a brief overview with
one or two paragraphs explaining what the software does, how it works, and who
made it.

It can also include two or three subsections with relevant context about the
creator, the broader ecosystem, or how the software compares respectfully with
other solutions.

### 😊 Leave A Good Impression

Consider the following:

- The README is often the first and only thing someone will see about the
  software.
- People judge software by its README.
- The README is shipped alongside the code in package managers.

In many people's minds, a poorly written README translates to poorly written
software. A good README should convey the quality of the work, the author's
expertise, and why users should be excited about the project.

At the end of the day, a README is often the best marketing material a project
has. Gear it toward the average user. Assume a first-year Computer Science
student is reading the documentation and wondering whether coding is for them.
Show them what quality software can do, and make the project feel approachable.

### ⌛ Be Considerate Of People's Time

When someone looks over the README, they should quickly find answers to these
questions:

- Does this solve my problem?
- Can I use this code?
- Who made this?
- How can I learn more?

Streamline the README so anyone glancing at it can answer those questions. This
requires foresight into the common problems people bring to the software. Figure
out those problems and demonstrate a solution, even when the problem is not the
central feature of the project.

Emojis can also help break up plain text and make sections easier to scan. Used
well, they make documentation friendlier without making it less professional.

To help people answer "who made this?", include an overview subsection or project
context explaining who created the software and why.
