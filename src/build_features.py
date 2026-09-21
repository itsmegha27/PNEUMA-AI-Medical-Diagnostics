from pathlib import Path
import pandas as pd

from feature_extractor import (
    load_and_preprocess,
    extract_features
)

DATASET_PATH = Path(
    r"C:\Users\ASUS\Downloads\archive\chest_xray"
)

TRAIN_PATH = DATASET_PATH / "train"

data = []

print("Starting feature extraction...")
print("Training path:", TRAIN_PATH)

for label_name, label in [
    ("NORMAL", 0),
    ("PNEUMONIA", 1)
]:
    folder = TRAIN_PATH / label_name
    images = list(folder.glob("*"))

    print(label_name, "images:", len(images))

    for i, image_path in enumerate(images):
        image = load_and_preprocess(image_path)

        features = extract_features(image)
        features["image_path"] = str(image_path)
        features["label"] = label

        data.append(features)

        if (i + 1) % 100 == 0:
            print(
                label_name,
                "processed:",
                i + 1
            )
df = pd.DataFrame(data)

output_path = Path(
    "data/processed/features.csv"
)

df.to_csv(
    output_path,
    index=False
)

print("\nFeature dataset saved!")
print("Shape:", df.shape)
print("File:", output_path)