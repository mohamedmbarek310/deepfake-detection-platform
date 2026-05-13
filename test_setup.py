print("Testing all packages...")

print("Testing torch...")
import torch
print(f"  torch version: {torch.__version__}")

print("Testing transformers...")
import transformers
print(f"  transformers version: {transformers.__version__}")

print("Testing opencv...")
import cv2
print(f"  opencv version: {cv2.__version__}")

print("Testing facenet-pytorch...")
from facenet_pytorch import MTCNN
print("  facenet-pytorch: OK")

print("Testing fastapi...")
import fastapi
print(f"  fastapi version: {fastapi.__version__}")

print("Testing Pillow...")
from PIL import Image
print(f"  Pillow: OK")

print("Testing numpy...")
import numpy as np
print(f"  numpy version: {np.__version__}")

print("")
print("ALL PACKAGES WORKING PERFECTLY!")