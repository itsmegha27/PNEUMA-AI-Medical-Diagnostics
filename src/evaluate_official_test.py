from pathlib import Path
import pandas as pd
import joblib

from feature_extractor import load_and_preprocess, extract_features
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

DATASET_PATH = Path(
    r"C:\Users\ASUS\Downloads\archive\chest_xray"
)

TEST_PATH = DATASET_PATH / "test"

model = joblib.load("models/random_forest.pkl")

features = [
    "mean_intensity",
    "std_intensity",
    "min_intensity",
    "max_intensity",
    "left_area",
    "right_area",
    "combined_area"
]

data = []

print("Extracting features from official test set...")

for label_name, label in [
    ("NORMAL", 0),
    ("PNEUMONIA", 1)
]:

    folder = TEST_PATH / label_name
    images = list(folder.glob("*"))

    print(label_name, "images:", len(images))

    for i, image_path in enumerate(images):

        image = load_and_preprocess(image_path)
        extracted = extract_features(image)

        row = [
            extracted[column]
            for column in features
        ]

        data.append(row)

        if (i + 1) % 50 == 0:
            print("Processed:", i + 1)

X_test = pd.DataFrame(
    data,
    columns=features
)

y_test = []

for label_name, label in [
    ("NORMAL", 0),
    ("PNEUMONIA", 1)
]:

    folder = TEST_PATH / label_name
    y_test.extend(
        [label] * len(list(folder.glob("*")))
    )

print("\nTest feature shape:", X_test.shape)

predictions = model.predict(X_test)

print("\n" + "=" * 50)
print("OFFICIAL TEST SET RESULTS")
print("=" * 50)

print(
    "Accuracy :",
    round(accuracy_score(y_test, predictions), 4)
)

print(
    "Precision:",
    round(precision_score(y_test, predictions), 4)
)

print(
    "Recall   :",
    round(recall_score(y_test, predictions), 4)
)

print(
    "F1 Score :",
    round(f1_score(y_test, predictions), 4)
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        target_names=["NORMAL", "PNEUMONIA"]
    )
)

print("\nOfficial test evaluation completed!")