import cv2
import joblib

from feature_extractor import extract_features


MODEL_PATH = "models/random_forest.pkl"


def predict_image(image_path):

    model = joblib.load(MODEL_PATH)

    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError("Image could not be read.")

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    image = cv2.resize(
        image,
        (512, 512)
    )

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

    prediction = model.predict(values)[0]

    probability = model.predict_proba(values)[0]

    return prediction, probability, features