print("Starting model test...")
print("First run will download the model (~300MB) - please wait")
print("")

from transformers import pipeline
from PIL import Image

# Load the model
print("Loading model from HuggingFace...")
detector = pipeline(
    "image-classification",
    model="dima806/deepfake_vs_real_image_detection"
)
print("Model loaded successfully!")
print("")

# Test real face
print("Testing real_face.jpg...")
real_image = Image.open("real_face.jpg")
real_result = detector(real_image)
print(f"Results for REAL face:")
for r in real_result:
    print(f"  {r['label']}: {r['score']*100:.2f}%")
print("")

# Test fake face
print("Testing fake_face.jpg...")
fake_image = Image.open("fake_face.jpg")
fake_result = detector(fake_image)
print(f"Results for FAKE face:")
for r in fake_result:
    print(f"  {r['label']}: {r['score']*100:.2f}%")
print("")

print("Model test complete!")