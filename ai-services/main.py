import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from diffusers import StableDiffusionPipeline
import uuid
from PIL import Image
import io
import base64

app = FastAPI()

# Configuration
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "comiccraft_v10.safetensors"))
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "generated_images"))
DEVICE = "cpu"  # Force CPU for Intel Iris Xe stability

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Loading ComicCraft model from: {MODEL_PATH}")
try:
    # Load the .safetensors model directly with explicit safetensors support
    pipe = StableDiffusionPipeline.from_single_file(
        MODEL_PATH,
        torch_dtype=torch.float32,
        use_safetensors=True,
        load_safety_checker=False,
        local_files_only=True
    )
    pipe.to(DEVICE)
    # Optimization for CPU
    pipe.enable_attention_slicing()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    pipe = None

from typing import Optional

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = "realistic, photo, blurry, low quality, extra fingers"
    num_inference_steps: Optional[int] = 15
    width: Optional[int] = 512
    height: Optional[int] = 512

@app.post("/generate-image")
async def generate_image(request: GenerateRequest):
    if pipe is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        print(f"Generating image for prompt: {request.prompt}")
        
        # Add style triggers
        full_prompt = f"comic book style, cartoon, {request.prompt}"
        
        image = pipe(
            prompt=full_prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=7.5,
            width=request.width,
            height=request.height
        ).images[0]

        # Generate unique filename
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Save locally
        image.save(filepath)
        print(f"Image saved to {filepath}")

        return {
            "image_path": f"/api/images/{filename}",
            "success": True
        }
    except Exception as e:
        print(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
