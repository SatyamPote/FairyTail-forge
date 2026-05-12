# FairyTail-Forge ✦ Local AI Comic Studio

> **100% offline · No subscriptions · No cloud APIs · Runs on your GPU**

FairyTail-Forge is a fully local, open-source desktop comic-generation studio powered by **Ollama** (LLM) and **ComfyUI** (image generation). Write a single prompt, and the app produces a cinematic comic script, generates panel images with Stable Diffusion / Flux, composes them into an A4 comic page, and exports to **PNG or PDF** — entirely on your machine.

---

## ✦ Features

| Feature | Status |
|---|---|
| 🧠 Ollama LLM script generation (streaming) | ✅ Phase 1 |
| 🎨 ComfyUI SDXL / Flux image generation | ✅ Phase 1 |
| 📄 Automatic comic page composer (PIL) | ✅ Phase 1 |
| 💾 PDF export | ✅ Phase 1 |
| 🗄️ SQLite project + panel storage | ✅ Phase 1 |
| 👤 Character profile manager | ✅ Phase 1 |
| 📚 Comic gallery browser | ✅ Phase 1 |
| 🔁 Live script streaming preview | ✅ Phase 1 |
| 💬 Speech bubbles on panels | ✅ Phase 1 |
| 🖼️ Custom Ollama Modelfile (`comicai`) | ✅ Phase 1 |

---

## 🖥️ Architecture

```
User Prompt
    ↓
PySide6 Desktop UI
    ↓
Ollama (qwen3:8b / comicai)
    ↓
Comic Script Generator + Parser
    ↓
Image Prompt Enhancer
    ↓
ComfyUI API (SDXL / Flux)
    ↓
PIL Comic Page Composer
    ↓
Export PNG / PDF
```

---

## ⚙️ Installation

### 1. Prerequisites

| Tool | Install |
|---|---|
| Python 3.10+ | https://python.org |
| Ollama | https://ollama.com |
| ComfyUI | https://github.com/comfyanonymous/ComfyUI |

### 2. Clone & install

```bash
git clone https://github.com/yourname/FairyTail-forge
cd FairyTail-forge
pip install -r requirements.txt
```

### 3. Pull an LLM model

```bash
ollama pull qwen3:8b
```

### 4. (Optional) Create a custom comic AI model

```bash
ollama create comicai -f docs/Modelfile
```

### 5. Download an image checkpoint

Place any of these in `ComfyUI/models/checkpoints/`:
- **JuggernautXL** (recommended)
- **DreamShaperXL**
- **AnimagineXL**
- **Flux Dev** (`flux1-dev.safetensors`)

### 6. Start services

```bash
# Terminal 1
ollama serve

# Terminal 2
cd ComfyUI && python main.py
```

### 7. Launch FairyTail-Forge

```bash
python main.py
# or
python launch.py
```

---

## 🚀 Quick Start

1. Open the **Generate** tab
2. Type your story prompt (e.g. *"A witch discovers a forbidden library in the clouds"*)
3. Set panel count, LLM model, and image checkpoint
4. Click **✦ Generate Script** — watch the script stream live
5. Click **🎨 Generate Images** — ComfyUI renders each panel
6. Click **📄 Compose Page** — assembles into an A4 comic
7. Click **💾 Export PDF** — saves a print-ready PDF

---

## 🧠 Recommended Models

### LLM (Ollama)
| Model | VRAM | Quality |
|---|---|---|
| `qwen3:8b` | 8 GB | ⭐⭐⭐⭐ |
| `qwen3:14b` | 14 GB | ⭐⭐⭐⭐⭐ |
| `comicai` (custom) | 8 GB | ⭐⭐⭐⭐⭐ |

### Image (ComfyUI)
| Model | Style |
|---|---|
| JuggernautXL | Photorealistic / comic |
| DreamShaperXL | Fantasy illustration |
| AnimagineXL | Anime / manga |
| Flux Dev | Highly detailed |

---

## 🖥️ Hardware Requirements

| | Minimum | Recommended |
|---|---|---|
| GPU | RTX 3060 12 GB | RTX 4070 / 4080 |
| RAM | 16 GB | 32 GB |
| Storage | 50 GB SSD | 100 GB+ SSD |

---

## 🗺️ Roadmap

- **Phase 2:** IPAdapter character consistency · auto speech bubble placement · ControlNet panel composition
- **Phase 3:** RAG long-form memory · multi-agent pipeline · AI storyboard planner · voice generation · animation

---

## 📁 Project Structure

```
FairyTail-forge/
├── main.py                  # Entry point
├── launch.py                # One-click launcher
├── requirements.txt
├── setup.py
├── docs/
│   └── Modelfile            # Custom Ollama comic model
└── fairytail/
    ├── config.py            # All settings & prompts
    ├── database.py          # SQLAlchemy ORM
    ├── llm_client.py        # Ollama streaming client
    ├── image_client.py      # ComfyUI SDXL client
    ├── composer.py          # PIL page composer + PDF
    ├── workers.py           # QThread workers
    ├── app.py               # Main window
    └── ui/
        ├── dashboard.py
        ├── generate.py
        ├── gallery.py
        ├── characters.py
        ├── settings.py
        └── widgets.py
```

---

## 📜 License

MIT — free for personal and commercial use.
