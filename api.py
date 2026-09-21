from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import joblib

from src.feature_extractor import extract_features

app = FastAPI(title="PNEUMA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("models/random_forest.pkl")

@app.get("/")
def home():
    return {"status": "PNEUMA API running"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    data = await file.read()

    image = cv2.imdecode(
        np.frombuffer(data, np.uint8),
        cv2.IMREAD_GRAYSCALE
    )

    if image is None:
        return {"error": "Could not read image"}

    image = cv2.resize(image, (512, 512))

    features = extract_features(image)

    values = [[
        features["mean_intensity"],
        features["std_intensity"],
        features["min_intensity"],
        features["max_intensity"],
        features["left_area"],
        features["right_area"],
        features["combined_area"]
    ]]

    prediction = int(model.predict(values)[0])
    probabilities = model.predict_proba(values)[0]

    return {
        "label": "PNEUMONIA" if prediction == 1 else "NORMAL",
        "confidence": float(probabilities[prediction]),
        "probabilities": {
            "NORMAL": float(probabilities[0]),
            "PNEUMONIA": float(probabilities[1])
        },
        "severityIndex": (
            float(min(100, features["combined_area"] * 2))
            if prediction == 1 else None
        ),
        "features": [
            {
                "name": "Mean intensity",
                "detail": "Average image brightness",
                "value": float(features["mean_intensity"])
            },
            {
                "name": "Intensity variation",
                "detail": "Pixel intensity variation",
                "value": float(features["std_intensity"])
            },
            {
                "name": "Minimum intensity",
                "detail": "Darkest pixel value",
                "value": float(features["min_intensity"])
            },
            {
                "name": "Maximum intensity",
                "detail": "Brightest pixel value",
                "value": float(features["max_intensity"])
            },
            {
                "name": "Left region area",
                "detail": "Threshold-based image area",
                "value": float(features["left_area"])
            },
            {
                "name": "Right region area",
                "detail": "Threshold-based image area",
                "value": float(features["right_area"])
            },
            {
                "name": "Combined area",
                "detail": "Average regional area",
                "value": float(features["combined_area"])
            }
        ],
        "regions": [],
        "modelVersion": "random-forest"
    }
    data = await file.read()

    image = cv2.imdecode(
        np.frombuffer(data, np.uint8),
        cv2.IMREAD_GRAYSCALE
    )

    if image is None:
        return {"error": "Could not read image"}

    image = cv2.resize(image, (512, 512))
    features = extract_features(image)

    values = [[
        features["mean_intensity"],
        features["std_intensity"],
        features["min_intensity"],
        features["max_intensity"],
        features["left_area"],
        features["right_area"],
        features["combined_area"]
    ]]

    prediction = int(model.predict(values)[0])
    probabilities = model.predict_proba(values)[0]
@app.get("/metrics")
def get_metrics():
    return {
        "accuracy": 0.6859,
        "precision": 0.7321,
        "recall": 0.7846,
        "f1": 0.7574,
        "confusion": {
            "tn": 122,
            "fp": 112,
            "fn": 84,
            "tp": 306
        },
        "testSize": 624
    }

    return {
        "label": "PNEUMONIA" if prediction == 1 else "NORMAL",
        "confidence": float(probabilities[prediction]),
        "probabilities": {
            "NORMAL": float(probabilities[0]),
            "PNEUMONIA": float(probabilities[1])
        },
        "severityIndex": (
            float(min(100, features["combined_area"] * 2))
            if prediction == 1 else None
        ),
        "features": [
            {
                "name": "Mean intensity",
                "detail": "Average image brightness",
                "value": float(features["mean_intensity"])
            },
            {
                "name": "Intensity variation",
                "detail": "Pixel intensity variation",
                "value": float(features["std_intensity"])
            },
            {
                "name": "Minimum intensity",
                "detail": "Darkest pixel value",
                "value": float(features["min_intensity"])
            },
            {
                "name": "Maximum intensity",
                "detail": "Brightest pixel value",
                "value": float(features["max_intensity"])
            },
            {
                "name": "Left region area",
                "detail": "Threshold-based image area",
                "value": float(features["left_area"])
            },
            {
                "name": "Right region area",
                "detail": "Threshold-based image area",
                "value": float(features["right_area"])
            },
            {
                "name": "Combined area",
                "detail": "Average regional area",
                "value": float(features["combined_area"])
            }
        ],
        "regions": [],
        "modelVersion": "random-forest"
    }