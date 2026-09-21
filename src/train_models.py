import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)


df = pd.read_csv("data/processed/features.csv")

features = [
    "mean_intensity",
    "std_intensity",
    "min_intensity",
    "max_intensity",
    "left_area",
    "right_area",
    "combined_area"
]

X = df[features]
y = df["label"]

print("Dataset shape:", df.shape)
print("Features:", X.shape)
print("Labels:", y.shape)


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


models = {
    "Logistic Regression": LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
}


results = {}


for name, model in models.items():

    print("\n" + "=" * 50)
    print(name)
    print("=" * 50)

    if name == "Logistic Regression":
        model.fit(X_train_scaled, y_train)
        predictions = model.predict(X_test_scaled)

    else:
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)

    results[name] = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1
    }

    print("Accuracy :", round(accuracy, 4))
    print("Precision:", round(precision, 4))
    print("Recall   :", round(recall, 4))
    print("F1 Score :", round(f1, 4))

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            target_names=["NORMAL", "PNEUMONIA"]
        )
    )

    filename = name.lower().replace(" ", "_") + ".pkl"

    joblib.dump(
        model,
        "models/" + filename
    )

    print("Model saved:", filename)


joblib.dump(
    scaler,
    "models/scaler.pkl"
)

print("\n" + "=" * 50)
print("MODEL COMPARISON")
print("=" * 50)

for name, scores in results.items():

    print("\n" + name)

    for metric, value in scores.items():
        print(
            metric.upper(),
            ":",
            round(value, 4)
        )

print("\nAll models trained successfully!")