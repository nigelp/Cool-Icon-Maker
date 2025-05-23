
![cooliconmaker2](https://github.com/user-attachments/assets/ba2b4e07-cf32-4524-a575-a11f62b4385d)


# Cool Icon Maker

An MVP app to generate colorful app icons locally on your computer using Stable Diffusion with LoRA fine-tuning. Options are - 512x512 or 64x64, 20 steps or 50 steps quality, JPEG or PNG.

---

## Features
- Minimal React frontend
- FastAPI backend with Stable Diffusion + LoRA
- Prompts enhanced to produce icon-style images automatically
- Generates colorful icons in 512x512 or 64x64 format
- Choice of LLM resolution - 20 steps or 50 steps
- Choice of file format - JPEG or PNG
---

## Requirements
- Python 3.8+
- Node.js (for building frontend)
- (Optionally) CUDA-capable GPU recommended for performance

---

## Installation

1. Clone this repository

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Install JavaScript dependencies and build the React app:

```bash
cd frontend
npm install
npm run build
```

---

## Usage

Simply run:

```bash
start.bat
```

This will start the FastAPI server and serve the React frontend at:

[http://127.0.0.1:8088](http://127.0.0.1:8088)

---

## Updating or Rebuilding Frontend

```
cd frontend
npm run build
```

---

## Model & LoRA

Make sure these files are in the root directory:

- `LiberteRedmond.safetensors` (Download from [HuggingFace - LiberteRedmond](https://huggingface.co/artificialguybr/Liberte/tree/main))
- `IconsRedmond15V-Icons.safetensors` (Download from [CivitAI - IconsRedmond 1.5V](https://civitai.com/models/206191/iconsredmond-15v-app-icons-lora-for-sd-liberteredmond-sd-15))

---

## License

MIT License.
