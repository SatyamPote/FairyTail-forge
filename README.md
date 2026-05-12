# 🎨 FairyTail Forge

A fully offline, professional-grade AI comic generation studio. Optimized for local execution using **Ollama** and an **Internal Comic Engine**.

## ✨ Features

- **Offline Story Generation**: Uses Ollama (phi3, gemma, or mistral) for scripts and characters.
- **Built-in Image Generator**: Uses your local `comiccraft_v10.safetensors` model directly—no extra software needed.
- **Asymmetrical Page Layout**: Automated generation of professional comic pages with dynamic panel sizes.
- **100% Privacy**: No cloud APIs, no data leaves your machine.

## 🛠️ Prerequisites

1. **Ollama**: [Install Ollama](https://ollama.com/) for story scripts.
2. **Python 3.10+**: To run the built-in image generator.
3. **Node.js 18+**: For the web interface.

## 🚀 Setup & Installation

### 1. Initialize the Project
Run the setup script to prepare the environment:
```powershell
.\setup.bat
```

### 2. Start the AI Generator
Open a terminal and run:
```powershell
.\scripts\start-ai.bat
```
*(This will load your `models/comiccraft_v10.safetensors` and start the engine).*

### 3. Start the Web App
Open another terminal and run:
```powershell
.\scripts\start-app.bat
```
Visit `http://localhost:3000`.

## 📁 Project Structure
- `models/`: Place your `.safetensors` models here.
- `ai-services/`: The internal image generation engine.
- `data/generated_images/`: Local storage for your comic panels.
- `frontend/`: The studio interface.

---
Built with ❤️ for the AI Comic Community.
