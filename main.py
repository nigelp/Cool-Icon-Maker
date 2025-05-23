import io
import base64
from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline
import torch
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

MODEL_PATH = "LiberteRedmond.safetensors"
LORA_PATH = "IconsRedmond15V-Icons.safetensors"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipe = None

def load_pipeline():
    global pipe
    pipe = StableDiffusionPipeline.from_single_file(MODEL_PATH, torch_dtype=torch.float32)
    pipe.to("cpu")
    pipe.load_lora_weights(LORA_PATH)


class GenerateRequest(BaseModel):
    prompt: str
    use_cuda: bool = False
    resolution: int = 64
    steps: int = 20
    format: str = "jpeg"


@app.on_event("startup")
def startup_event():
    load_pipeline()


@app.post("/api/generate")
def generate_icon(payload: GenerateRequest):
    used_cuda = False
    cuda_message = ""
    if payload.use_cuda:
        if torch.cuda.is_available():
            try:
                pipe.to("cuda")
                torch.cuda.synchronize()
                used_cuda = True
                cuda_message = "CUDA enabled"
            except Exception as e:
                pipe.to("cpu")
                cuda_message = f"CUDA error: {str(e)}"
        else:
            pipe.to("cpu")
            cuda_message = "CUDA not available"
    else:
        pipe.to("cpu")
        cuda_message = "CUDA not requested"

    prompt = f"model:icons, {payload.prompt}, simple colorful app icon, minimal vector, transparent background"
    image = pipe(prompt, num_inference_steps=payload.steps).images[0]
    image = image.resize((payload.resolution, payload.resolution), Image.LANCZOS)

    # Prepare image for icon download
    buffered = io.BytesIO()
    save_format = "JPEG" if payload.format.lower() == "jpeg" else "PNG"
    image.save(buffered, format=save_format)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # --- Favicon generation fix ---
    # image is a PIL.Image, use it directly for favicon sizes
    favicon_buffer = io.BytesIO()
    sizes = [(16, 16), (32, 32)]
    # Create icon in memory (ensure the main image is RGBA for .ico)
    img_for_ico = image.convert('RGBA')
    img_for_ico.save(favicon_buffer, format="ICO", sizes=sizes)
    favicon_buffer.seek(0)
    favicon_b64 = base64.b64encode(favicon_buffer.read()).decode("utf-8")
    # --- End fix ---

    return JSONResponse(content={
        "image": img_str,
        "favicon": favicon_b64,
        "used_cuda": used_cuda,
        "cuda_message": cuda_message
    })

# Mount React static build LAST, so it won't override /api/* endpoints
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="frontend")


def create_favicon(input_path, output_path="favicon.ico"):
    """
    Convert input image (PNG or JPEG) into a favicon.ico containing 16x16 and 32x32 sizes.
    """
    img = Image.open(input_path)
    # Ensure alpha for PNGs and proper conversion for JPEG
    if img.mode not in ("RGBA", "RGB"):
        img = img.convert("RGBA")
    sizes = [(16, 16), (32, 32)]
    resized_images = [img.resize(size, Image.LANCZOS) for size in sizes]
    # Save as .ico with both sizes
    resized_images[0].save(
        output_path,
        format="ICO",
        sizes=sizes
    )
    return output_path