# 🎨 FairyTail Forge

A fully offline, professional-grade AI comic generation studio. Inspired by AI Comic Factory, optimized for local execution on consumer hardware (Intel Iris Xe / 16GB RAM).

## ✨ Features

- **Offline Story Generation**: Uses Ollama (phi3/gemma) for scripts, characters, and panel prompts.
- **Local Image Generation**: Uses TinySD via Python FastAPI for fast, low-memory inference.
- **Sequential Pipeline**: Generates images one-by-one to prevent system lag and out-of-memory errors.
- **Modern Comic UI**: Premium dark-mode interface with dynamic layouts and speech bubble previews.
- **No Cloud APIs**: 100% private and offline.

## 🛠️ Prerequisites

1. **Ollama**: [Install Ollama](https://ollama.com/) and run `ollama run phi3` or `ollama run gemma2:2b`.
2. **Python 3.10+**: For the image generation service.
3. **Node.js 18+**: For the web interface.

## 🚀 Setup & Installation

### 1. Initialize AI Service
Open a terminal in the root directory:
```bash
cd ai-services
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 2. Initialize Web App
Open another terminal in the root directory:
```bash
cd frontend
npm install
npx prisma generate
npm run dev
```

### 3. Usage
- Go to `http://localhost:3000`
- Click "New Story"
- Enter your prompt and watch the AI forge your comic!

## 💻 Hardware Optimization
- **TinySD**: Optimized for 512x512 resolution and 8-15 inference steps.
- **CPU Inference**: Defaulting to CPU for stability on Intel Iris Xe; will use CUDA automatically if available.
- **Sequential Generation**: Only one image is generated at a time to save RAM.

## 📁 Project Structure
- `frontend/`: Next.js application with Zustand state management.
- `ai-services/`: Python FastAPI service for TinySD inference.
- `data/generated_images/`: Local storage for generated panel images.
- `database/`: SQLite storage for projects and scripts.

---
Built with ❤️ for the AI Comic Community.
