# PNEUMA — AI-Powered Medical Diagnostic & Infection Analytics

> An educational AI-assisted chest X-ray classification prototype built with Python, Scikit-Learn, OpenCV, FastAPI, and a custom medical-tech interface.

![PNEUMA](https://img.shields.io/badge/PNEUMA-AI%20Medical%20Diagnostics-2563EB)
![Python](https://img.shields.io/badge/Python-3.11-3776AB)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-Machine%20Learning-F7931E)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8)

---

## Overview

**PNEUMA** is an AI-assisted chest X-ray analysis prototype designed to demonstrate how machine learning and computer vision can be combined into an interactive medical diagnostic workflow.

The system accepts a chest X-ray image, performs image preprocessing and feature extraction, and uses a trained **Random Forest classifier** to classify the image into:

- `NORMAL`
- `PNEUMONIA`

The prediction is returned through a **FastAPI backend** and displayed through the PNEUMA diagnostic interface.

The project also provides model metrics, extracted image features, analysis history, and dataset information through the frontend.

> **Important:** PNEUMA is an educational/internship prototype and is **not a clinically validated diagnostic system**. Its predictions should not be used for medical diagnosis or treatment decisions.

---

## Key Features

### AI Classification

- Binary chest X-ray classification
- NORMAL vs PNEUMONIA prediction
- Random Forest machine-learning model
- Prediction probabilities
- Confidence estimation

### Computer Vision Pipeline

Each uploaded image is processed through:

```text
Input X-ray
     ↓
Image validation
     ↓
Grayscale conversion
     ↓
Resize to 512 × 512
     ↓
Intensity feature extraction
     ↓
Regional area feature extraction
     ↓
Random Forest classification
     ↓
Prediction + probabilities
