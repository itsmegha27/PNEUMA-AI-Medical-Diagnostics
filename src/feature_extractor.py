import cv2
import numpy as np
from pathlib import Path

def load_and_preprocess(image_path):
    """Load and standardize an X-ray image."""

    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(grayscale, (512, 512))

    return resized


def calculate_intensity_features(image):
    """Calculate basic pixel-intensity statistics."""

    mean_intensity = image.mean()
    std_intensity = image.std()
    min_intensity = image.min()
    max_intensity = image.max()

    return {
        "mean_intensity": mean_intensity,
        "std_intensity": std_intensity,
        "min_intensity": min_intensity,
        "max_intensity": max_intensity
    }
def calculate_area_feature(image):
    """Create a simple intensity-based mask and calculate its area."""

    threshold = 180

    _, mask = cv2.threshold(
        image, threshold, 255, cv2.THRESH_BINARY
    )

    affected_pixels = cv2.countNonZero(mask)
    total_pixels = image.shape[0] * image.shape[1]

    area_percent = (affected_pixels / total_pixels) * 100

    return area_percent
def create_threshold_mask(image):
    """Create a binary mask using the intensity threshold."""

    threshold = 180

    _, mask = cv2.threshold(
        image, threshold, 255, cv2.THRESH_BINARY
    )

    return mask
def create_lung_roi(image):
    """Create a rough region of interest for the lungs."""

    height, width = image.shape

    roi = image[
        int(height * 0.15):int(height * 0.90),
        int(width * 0.10):int(width * 0.90)
    ]

    return roi
def create_lung_zones(image):
    """Keep approximate left and right lung regions."""

    h, w = image.shape

    left = image[:, int(w * 0.05):int(w * 0.45)]
    right = image[:, int(w * 0.55):int(w * 0.95)]

    return left, right
def calculate_zone_area(image, threshold=180):
    """Calculate threshold-based bright-pixel percentage."""

    _, mask = cv2.threshold(
        image, threshold, 255, cv2.THRESH_BINARY
    )
   
    bright_pixels = cv2.countNonZero(mask)
    total_pixels = image.shape[0] * image.shape[1]

    return (bright_pixels / total_pixels) * 100
def extract_features(image):
    """Extract all numerical features from one X-ray."""

    features = calculate_intensity_features(image)

    lung_roi = create_lung_roi(image)
    left_lung, right_lung = create_lung_zones(lung_roi)

    left_area = calculate_zone_area(left_lung)
    right_area = calculate_zone_area(right_lung)

    features["left_area"] = left_area
    features["right_area"] = right_area
    features["combined_area"] = (left_area + right_area) / 2

    return features
if __name__ == "__main__":
    test_image = (
        r"C:\Users\ASUS\Downloads\archive\chest_xray"
        r"\train\NORMAL\IM-0115-0001.jpeg"
    )

    processed = load_and_preprocess(test_image)
    lung_roi = create_lung_roi(processed)
    left_lung, right_lung = create_lung_zones(lung_roi)
    left_area = calculate_zone_area(left_lung)
    right_area = calculate_zone_area(right_lung)

    print("Left lung bright area:", left_area, "%")
    print("Right lung bright area:", right_area, "%")
    combined_area = (
            (left_area + right_area) / 2
        )
    
    print(
            "Combined lung bright area:",
            combined_area,
            "%"
        )
    cv2.imwrite(
        "data/processed/left_lung.png",
        left_lung
    )

    cv2.imwrite(
        "data/processed/right_lung.png",
        right_lung
    )

    print("Lung zones saved.")
    print("Left lung zone:", left_lung.shape)
    print("Right lung zone:", right_lung.shape)
    print("Lung ROI shape:", lung_roi.shape)
    roi_path = Path("data/processed/lung_roi.png")

    cv2.imwrite(
        str(roi_path),
        lung_roi
    )

    print("Lung ROI saved at:", roi_path)

    features = calculate_intensity_features(processed)
    area_percent = calculate_area_feature(processed)
    mask = create_threshold_mask(processed)
    output_folder = Path("data/processed")
    output_folder.mkdir(parents=True, exist_ok=True)

    output_path = output_folder / "sample_mask.png"

    cv2.imwrite(str(output_path), mask)

    print("Mask saved at:", output_path)
    cv2.imwrite(
        "data/processed/sample_mask.png",
        mask
    )

    print("Mask saved successfully.")
    print("Threshold-based area:", area_percent, "%")
    print("Minimum intensity:", features["min_intensity"])
    print("Maximum intensity:", features["max_intensity"])
    all_features = extract_features(processed)

    print("\nExtracted features:")
    for name, value in all_features.items():
        print(name, ":", value)