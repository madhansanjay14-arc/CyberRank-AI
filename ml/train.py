# ==========================================
# CYBERRANK AI
# Random Forest Machine Learning Model
# ==========================================

import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# STEP 1: Define project paths

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "dataset" / "sample_incidents.csv"

MODEL_PATH = BASE_DIR / "ml" / "model.pkl"


# STEP 2: Load dataset

print("\nLoading CyberRank AI dataset...")

df = pd.read_csv(DATASET_PATH)

print("Total records:", len(df))


# STEP 3: Select input features

features = [
    "severity",
    "data_sensitivity",
    "asset_importance",
    "attack_confidence",
    "affected_users",
    "business_impact"
]

X = df[features]

# Target variable
y = df["attack_label"]


# STEP 4: Split training and testing data

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training records:", len(X_train))
print("Testing records:", len(X_test))


# STEP 5: Create Random Forest model

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)


# STEP 6: Train the model

print("\nTraining Random Forest model...")

model.fit(X_train, y_train)

print("Training completed!")


# STEP 7: Make predictions

predictions = model.predict(X_test)


# STEP 8: Evaluate model

accuracy = accuracy_score(y_test, predictions)

print("\n======= MODEL EVALUATION =======")

print("Accuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)

print("Confusion Matrix:")

print(confusion_matrix(y_test, predictions))


# STEP 9: Save trained model

joblib.dump(model, MODEL_PATH)

print("\nModel saved successfully!")

print("Location:", MODEL_PATH)