# LOCAL SETUP

FairyTail Forge runs entirely on your own machine. Nothing in this guide requires an account, API key, or subscription. Everything below is open-source and free.

You need two local services running before story or image generation will work:

1. **A local LLM** (story generation) on `http://localhost:11434`
2. **A local Stable Diffusion service** (image generation) on `http://localhost:8000`

If either is missing, the app will surface a clear error — that is expected, and confirms there is no silent cloud fallback.

---

## 1. Local Story Model

### Recommended models

| Model | Size (Q4) | Best for |
|---|---|---|
| **Qwen2 1.5B** Q4 | ~1 GB | Fast, low-VRAM, good multilingual |
| **TinyLlama 1.1B** Q4 | ~700 MB | Lowest hardware bar |
| **Phi-2** Q4 | ~1.6 GB | Strong reasoning at small size |
| **Phi-3 Mini** Q4 | ~2.3 GB | Best quality in <4 GB |
| **Mistral 7B** Q4 | ~4 GB | Best quality if you have the VRAM |

All of these are open-weight and downloadable for free.

### Runtime: Ollama (easiest)

The API server talks to Ollama out of the box at `http://localhost:11434`.

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model (one-time download)
ollama pull phi3
ollama pull qwen2:1.5b
ollama pull tinyllama

# Ollama runs as a background service. Verify:
curl http://localhost:11434/api/tags
```

Pick the model in the app's "New Story" modal — the model dropdown lists whatever you've pulled.

### Runtime: llama.cpp (fully self-contained, no Ollama)

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make

# Download a GGUF model from HuggingFace (free, no account needed for public models)
# e.g. https://huggingface.co/Qwen/Qwen2-1.5B-Instruct-GGUF

# Run the server with an Ollama-compatible HTTP API
./llama-server -m models/qwen2-1_5b-instruct-q4_k_m.gguf --port 11434
```

### Runtime: ONNX Runtime / MLX (Apple Silicon)

- **MLX** (Apple Silicon only): `pip install mlx-lm` → `mlx_lm.server --model mlx-community/Qwen2-1.5B-Instruct-4bit --port 11434`
- **ONNX Runtime**: use `optimum` to export a model to ONNX and serve via `onnxruntime-genai`'s built-in HTTP server.

---

## 2. Local Image Model

### Recommended models

| Model | Size | Best for |
|---|---|---|
| **SD1.5 Turbo** | ~2 GB | 1–4 step generation, very fast |
| **LCM-LoRA SD1.5** | ~150 MB (on top of SD1.5) | Latent Consistency, 4 steps |
| **SDXL Turbo** | ~7 GB | Higher quality if you have the VRAM |

### Recommended LoRAs (manga / line art)

| LoRA | Purpose |
|---|---|
| **Manga LoRA** (e.g. `MangaV3`, `Anime-Lineart-Manga-like`) | Push toward black-and-white manga |
| **Line-art-only LoRA** (e.g. `lineart-style`) | Pure ink lines, no shading |
| **Mistoon Anime** / **AnythingV5** | Strong anime base for manga |

Get them from open repositories like CivitAI or HuggingFace (free; some sites ask for a free login but no payment is required, and the model files themselves are open-weight).

### Folder placement (Python SD service)

```
your-sd-service/
├── models/
│   ├── checkpoints/
│   │   └── comiccraft_v10.safetensors        # base model
│   └── loras/
│       ├── manga_lineart.safetensors
│       └── lcm_sd15.safetensors
└── server.py
```

### Quantized formats

- `.safetensors` — preferred (safer than `.ckpt`, no pickled code)
- `.gguf` for `stable-diffusion.cpp`
- `.onnx` for ONNX Runtime
- `.ncnn.param + .ncnn.bin` for NCNN (mobile)

---

## 3. Local Image Runtime

The API server posts to `POST http://localhost:8000/generate-image` with `{ prompt, negativePrompt, negative_prompt }`. Any local server that exposes that contract works. Pick one:

### Option A — Python SD service (default, what FairyTail Forge ships against)

A simple FastAPI/Flask wrapper around `diffusers`:

```bash
pip install diffusers transformers accelerate fastapi uvicorn safetensors
# write a tiny FastAPI app that loads SD1.5 + your manga LoRA and exposes
# POST /generate-image returning { image_path: "..." }
uvicorn server:app --port 8000
```

### Option B — ComfyUI

```bash
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI && pip install -r requirements.txt
python main.py --port 8000
```

Wrap ComfyUI's `/prompt` endpoint behind a thin `/generate-image` adapter, or update the API server to call ComfyUI directly. ComfyUI runs CPU/GPU, supports LoRAs natively, and is fully local.

### Option C — stable-diffusion.cpp (no Python)

```bash
git clone https://github.com/leejet/stable-diffusion.cpp
cd stable-diffusion.cpp && cmake -B build && cmake --build build
# Provides a CLI; wrap it in a tiny HTTP server (or use the included server build)
```

### Option D — ONNX Runtime / NCNN (mobile or low-RAM)

- **ONNX Runtime**: convert SD1.5 to ONNX with `optimum-cli`, serve via a small Python or Rust binary.
- **NCNN**: use `ncnn`'s built-in SD examples for Android/iOS — pure C++, no Python.

---

## 4. Hardware recommendations

### Minimum (workable)

- **GPU**: NVIDIA RTX 3060 12 GB, or Apple M1/M2 with 16 GB unified memory
- **RAM**: 16 GB
- **Disk**: 20 GB free for models
- Generation: ~5–15 sec/panel with SD1.5 Turbo

### Recommended

- **GPU**: NVIDIA RTX 4070 / 4070 Ti / 4080, or Apple M3 Pro / M3 Max
- **RAM**: 32 GB
- **Disk**: 50+ GB free (room for multiple checkpoints + LoRAs)
- Generation: ~1–3 sec/panel

### Mobile (Expo app)

- **Android**: Snapdragon 8 Gen 1 / Gen 2 / Gen 3 with 8+ GB RAM (NCNN-based local SD is feasible)
- **iOS**: Apple A16 / A17 / M-series (CoreML SD models work; M-series iPads are excellent)
- The Expo app currently calls the same local API server over your LAN — point `EXPO_PUBLIC_API_URL` at your desktop's IP, e.g. `http://192.168.1.50:8080`.

---

## 5. Verifying the install

```bash
# LLM up?
curl http://localhost:11434/api/tags

# Image service up?
curl -X POST http://localhost:8000/generate-image \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"manga panel, hero standing on a cliff","negativePrompt":"color"}'

# Project clean of cloud SDKs?
pnpm run check:offline
```

If all three succeed, FairyTail Forge will run end-to-end with zero internet access.

---

## What FairyTail Forge will **never** ask you to do

- Sign up for an account
- Paste an API key
- Pay for a subscription
- Send your prompts to a cloud provider

If you ever see the app asking for any of these, it's a regression — please open an issue.
