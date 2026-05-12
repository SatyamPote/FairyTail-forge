import sys
import os
import time
from pathlib import Path

# Ensure the fairytail package is findable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fairytail.llm_client import generate_script_stream, parse_script, enhance_image_prompt
from fairytail.image_client import generate_panel_image, check_comfyui
from fairytail.composer import compose_comic_page, export_pdf
from fairytail.config import DEFAULT_LLM_MODEL

def main():
    if len(sys.argv) < 2:
        print("\nUsage: python forge.py \"Your Story Idea\"")
        print("Example: python forge.py \"Cyberpunk heist in Neo-Tokyo\"\n")
        return

    user_prompt = sys.argv[1]
    comic_id = int(time.time())
    
    print(f"\n[1/5] 🧠 STARTING STORY PROCESSING...")
    print(f"Model: {DEFAULT_LLM_MODEL}")
    print(f"Prompt: {user_prompt}\n")

    # --- STEP 1: SCRIPT GENERATION ---
    print(f"--- SCRIPT OUTPUT ---")
    full_script_text = ""
    def on_token(t):
        print(t, end="", flush=True)

    try:
        panels = generate_script_stream(user_prompt, on_token=on_token)
    except Exception as e:
        print(f"\n[!] OLLAMA ERROR: {e}")
        return

    if not panels:
        print("\n[!] Error: Failed to parse script. Check Ollama output.")
        return

    print(f"\n\n[2/5] ✂️ PANEL SPLITTER: Found {len(panels)} panels.")

    # --- STEP 2: PROMPT ENHANCER & IMAGE GEN ---
    print(f"\n[3/5] 🎨 IMAGE PROCESSING (COMFYUI)...")
    
    # Check ComfyUI first
    ok, msg = check_comfyui()
    if not ok:
        print(f"[!] WARNING: {msg}")
        print("[!] Images cannot be generated without ComfyUI running on port 8188.")
        return

    image_data = []
    for p in panels:
        print(f"\n--- Panel {p.number} ---")
        print(f"Drafting enhancement...")
        
        # PROMPT ENHANCER
        enhanced = enhance_image_prompt(p)
        print(f"Enhanced Prompt: {enhanced[:100]}...")
        
        # IMAGE GENERATION
        print(f"Generating image in ComfyUI...")
        try:
            path = generate_panel_image(
                positive_prompt=enhanced,
                comic_id=comic_id,
                panel_number=p.number,
                on_progress=lambda m: print(f"  > {m}")
            )
            image_data.append({
                "number": p.number,
                "dialogue": p.dialogue,
                "image_path": str(path)
            })
        except Exception as e:
            print(f"  [!] Panel {p.number} failed: {e}")

    if not image_data:
        print("\n[!] No images were generated. Stopping.")
        return

    # --- STEP 3: COMPOSE & EXPORT ---
    print(f"\n[4/5] 📄 PAGE COMPOSER: Assembling final layout...")
    try:
        page_path = compose_comic_page(image_data, "FairyTail-Forge", comic_id=comic_id)
        print(f"✓ Page saved: {page_path}")
        
        print(f"\n[5/5] 💾 EXPORTING PDF...")
        pdf_path = Path.home() / f"comic_{comic_id}.pdf"
        export_pdf([page_path], pdf_path)
        print(f"✓ PDF EXPORTED: {pdf_path}")
        
        print(f"\n=======================================")
        print(f"   SUCCESS! YOUR COMIC IS READY.")
        print(f"=======================================\n")
        os.startfile(page_path) # Open the image
    except Exception as e:
        print(f"[!] Composition Error: {e}")

if __name__ == "__main__":
    main()
