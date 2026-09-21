import streamlit as st
import cv2
import numpy as np
import joblib

from src.feature_extractor import extract_features


st.set_page_config(
    page_title="AI Medical Analytics",
    page_icon="🩺",
    layout="wide"
)


st.title("🩺 AI Medical Diagnostic Analytics")

st.caption(
    "Educational prototype for chest X-ray image analysis"
)

st.warning(
    "This system is an educational/internship prototype "
    "and is NOT a clinically validated diagnostic tool."
)


st.sidebar.header("System Information")

st.sidebar.write(
    "Model: Random Forest"
)

st.sidebar.write(
    "Task: NORMAL vs PNEUMONIA"
)

st.sidebar.write(
    "Official Test Accuracy: 68.59%"
)


uploaded = st.file_uploader(
    "Upload a chest X-ray image",
    type=["jpg", "jpeg", "png"]
)


if uploaded:

    file_bytes = np.asarray(
        bytearray(uploaded.read()),
        dtype=np.uint8
    )

    image = cv2.imdecode(
        file_bytes,
        cv2.IMREAD_GRAYSCALE
    )

    image = cv2.resize(
        image,
        (512, 512)
    )


    st.subheader("Uploaded X-ray")

    st.image(
        image,
        caption="Processed Chest X-ray",
        use_container_width=True
    )


    if st.button("🔍 Analyze X-ray"):

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


        model = joblib.load(
            "models/random_forest.pkl"
        )


        prediction = model.predict(values)[0]

        probabilities = model.predict_proba(
            values
        )[0]


        if prediction == 1:

            result = "PNEUMONIA / ABNORMAL PATTERN"

            confidence = probabilities[1] * 100

        else:

            result = "NORMAL"

            confidence = probabilities[0] * 100


        st.subheader("Analysis Result")

        st.metric(
            "Predicted Class",
            result
        )

        st.metric(
            "Model Confidence",
            f"{confidence:.2f}%"
        )


        # Prototype image-derived index
        severity = min(
            100,
            max(
                0,
                features["combined_area"] * 2
            )
        )


        st.subheader(
            "Prototype Image-Derived Severity Index"
        )

        st.progress(
            int(severity)
        )

        st.write(
            f"Index: {severity:.1f} / 100"
        )

        st.caption(
            "This is an experimental image-derived "
            "index and NOT a clinical severity score."
        )


        st.subheader("Extracted Image Features")


        col1, col2, col3 = st.columns(3)


        col1.metric(
            "Mean Intensity",
            f"{features['mean_intensity']:.2f}"
        )


        col2.metric(
            "Intensity Variation",
            f"{features['std_intensity']:.2f}"
        )


        col3.metric(
            "Combined Bright Area",
            f"{features['combined_area']:.2f}%"
        )