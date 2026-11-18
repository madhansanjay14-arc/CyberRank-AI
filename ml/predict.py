# ==========================================
# CYBERRANK AI
# Random Forest Prediction Engine
# ==========================================

import joblib
import pandas as pd

from pathlib import Path


# Locate trained model

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "model.pkl"


# Load model

model = joblib.load(MODEL_PATH)


# Features used during training

FEATURES = [
    "severity",
    "data_sensitivity",
    "asset_importance",
    "attack_confidence",
    "affected_users",
    "business_impact"
]


# Prediction function

def predict_attack_probability(incident):

    # Convert incident into DataFrame

    input_data = pd.DataFrame(
        [[incident[feature] for feature in FEATURES]],
        columns=FEATURES
    )

    # Predict probability

    probabilities = model.predict_proba(input_data)[0]

    # Find probability belonging to class 1

    attack_index = list(model.classes_).index(1)

    attack_probability = probabilities[attack_index]

    return round(float(attack_probability) * 100, 2)


# Test prediction

if __name__ == "__main__":

    sample_incident = {
        "severity": 5,
        "data_sensitivity": 5,
        "asset_importance": 5,
        "attack_confidence": 5,
        "affected_users": 100,
        "business_impact": 5
    }

    result = predict_attack_probability(sample_incident)

    print("\n======= CYBERRANK AI ML PREDICTION =======")

    print("Attack probability:", result, "%")