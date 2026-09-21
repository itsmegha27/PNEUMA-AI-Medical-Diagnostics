from pathlib import Path

# Root folder of our Kaggle chest X-ray dataset
DATASET_PATH = Path(
    r"C:\Users\ASUS\Downloads\archive\chest_xray"
)

TRAIN_PATH = DATASET_PATH / "train"

print("Dataset path:", DATASET_PATH)
print("Training path:", TRAIN_PATH)
print("Training folder exists:", TRAIN_PATH.exists())

# The two categories our model will learn
normal_path = TRAIN_PATH / "NORMAL"
pneumonia_path = TRAIN_PATH / "PNEUMONIA"

normal_images = list(normal_path.glob("*"))
pneumonia_images = list(pneumonia_path.glob("*"))

print("Normal images:", len(normal_images))
print("Pneumonia images:", len(pneumonia_images))

import cv2

# Pick the first NORMAL X-ray
sample_image = normal_images[0]

# Read the image as a NumPy array
image = cv2.imread(str(sample_image))

print("Sample image:", sample_image.name)
print("Sample image:", sample_image)
print("Image loaded:", image is not None)

if image is not None:
    print("Image shape:", image.shape)
else:
    print("OpenCV could not read this file.")

import pandas as pd

data = []

for image_path in normal_images:
    data.append([str(image_path), 0])

for image_path in pneumonia_images:
    data.append([str(image_path), 1])

df = pd.DataFrame(data, columns=["image_path", "label"])

print("\nDataset shape:", df.shape)
print(df.head())

# Paths for validation and test data
VAL_PATH = DATASET_PATH / "val"
TEST_PATH = DATASET_PATH / "test"

print("\nValidation folder exists:", VAL_PATH.exists())
print("Test folder exists:", TEST_PATH.exists())

# Count validation and test images
val_images = list(VAL_PATH.glob("*/*"))
test_images = list(TEST_PATH.glob("*/*"))

print("Validation images:", len(val_images))
print("Test images:", len(test_images))