import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Load feature dataset
df = pd.read_csv("data/processed/features.csv")

feature_columns = [
    "mean_intensity",
    "std_intensity",
    "min_intensity",
    "max_intensity",
    "left_area",
    "right_area",
    "combined_area"
]

X = df[feature_columns]
y = df["label"]

print("Features shape:", X.shape)
print("Labels shape:", y.shape)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

# Feature scaling
scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Logistic Regression
model = LogisticRegression(
    class_weight="balanced",
    random_state=42,
    max_iter=1000
)

model.fit(X_train_scaled, y_train)

print("Model training completed.")

# Predictions
y_pred = model.predict(X_test_scaled)

print("Predictions generated.")

# Evaluation
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\nModel Performance:")
print("Accuracy :", accuracy)
print("Precision:", precision)
print("Recall   :", recall)
print("F1 Score :", f1)

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)

print("\nConfusion Matrix:")
print(cm)

# Detailed classification report
print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=["NORMAL", "PNEUMONIA"]
    )
)

# Save model and scaler
joblib.dump(model, "models/logistic_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")

print("\nModel saved successfully.")
print("Scaler saved successfully.")