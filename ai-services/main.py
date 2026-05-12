import torch
from diffusers import StableDiffusionPipeline
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import os
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_ID = "segmind/tiny-sd"
DEVICE = "cpu"  # Force CPU for stability on low-end hardware, or use "cuda" if available
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "generated_images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Loading model {MODEL_ID} on {DEVICE}...")
pipe = StableDiffusionPipeline.from_pretrained(
    MODEL_ID, 
    torch_dtype=torch.float32 if DEVICE == "cpu" else torch.float16
)
pipe = pipe.to(DEVICE)
# Optimize for CPU
if DEVICE == "cpu":
    pipe.enable_attention_slicing()

print("Model loaded successfully.")

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str = "bad quality, blurry, distorted, low resolution, watermark"
    num_inference_steps: int = 12
    guidance_scale: float = 7.0
    width: int = 512
    height: int = 512

@app.post("/generate-image")
async def generate_image(request: GenerateRequest):
    try:
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        image = pipe(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
            width=request.width,
            height=request.height
        ).images[0]
        
        image.save(filepath)
        
        # Return relative path for frontend access
        return {"image_path": f"/api/images/{filename}", "full_path": filepath}
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ready", "model": MODEL_ID, "device": DEVICE}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
