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
    print("Attempting to load model with compatibility mode...")
    # Load the .safetensors model directly
    pipe = StableDiffusionPipeline.from_single_file(
        MODEL_PATH,
        torch_dtype=torch.float32,
        use_safetensors=True,
        load_safety_checker=False,
        local_files_only=False, # Allowed for first-time calibration
    )
    pipe.to(DEVICE)
    pipe.enable_attention_slicing()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Standard load failed: {e}")
    print("Attempting alternative load for SD1.5 compatibility...")
    try:
        # Fallback for some SD1.5 safetensors versions
        pipe = StableDiffusionPipeline.from_single_file(
            MODEL_PATH,
            torch_dtype=torch.float32,
            use_safetensors=True,
            load_safety_checker=False,
            local_files_only=False, # Allowed for first-time calibration
            original_config_file=None # Force default SD1.5 config
        )
        pipe.to(DEVICE)
        print("Model loaded successfully using fallback!")
    except Exception as e2:
        print(f"Critical Error: Could not load model even with fallback. Error: {e2}")
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
    print(f"Received request: {request.dict()}")
    if pipe is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        print(f"Generating image for prompt: {request.prompt}")
        
        # Inject Ligne Claire & Minimalist Style Guidance
        style_guidance = (
            "Ligne Claire style, clean minimalist line art, uniform line thickness, "
            "flat cinematic colors, elegant composition, high-end graphic novel aesthetic, "
            "crisp contour lines, European comic style, minimalist background, cinematic lighting, "
            "rule of thirds, clear silhouettes."
        )
        full_prompt = f"{style_guidance} {request.prompt}"
        
        # Minimalist Negative Prompt
        master_negative = (
            "realistic, photo, 3d render, messy lines, crosshatching, noisy, detailed textures, "
            "oversaturated, blurry, low quality, extra fingers, sketch, rough, painting, "
            "chaotic, hyper-realistic, skin texture, bloom, glow, messy shading."
        )
        negative_prompt = f"{master_negative}, {request.negative_prompt or ''}"

        image = pipe(
            prompt=full_prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=request.num_inference_steps or 20,
            guidance_scale=8.5,
            width=request.width or 512,
            height=request.height or 512
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
