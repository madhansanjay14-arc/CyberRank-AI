# ==========================================
# CYBERRANK AI
# HYBRID RISK SCORING ENGINE
# ==========================================

from backend.scoring import calculate_risk, get_priority

from ml.predict import predict_attack_probability


# Hybrid weights

RULE_WEIGHT = 0.70
ML_WEIGHT = 0.30


# Hybrid scoring function

def calculate_hybrid_score(incident):

    # STEP 1: Rule-based score

    rule_score = calculate_risk(incident)

    # STEP 2: ML prediction

    ml_score = predict_attack_probability(incident)

    # STEP 3: Combine both scores

    final_score = (
        RULE_WEIGHT * rule_score
        +
        ML_WEIGHT * ml_score
    )

    # STEP 4: Assign priority

    priority = get_priority(final_score)

    # STEP 5: Return explanation

    return {
        "incident_id": incident["incident_id"],
        "rule_score": round(rule_score, 2),
        "ml_prediction": round(ml_score, 2),
        "final_score": round(final_score, 2),
        "priority": priority
    }


# Test the hybrid engine

if __name__ == "__main__":

    sample_incident = {

        "incident_id": "INC-101",

        "incident_type": "Data Exfiltration",

        "severity": 5,

        "data_sensitivity": 5,

        "asset_importance": 5,

        "attack_confidence": 5,

        "affected_users": 100,

        "business_impact": 5
    }

    result = calculate_hybrid_score(sample_incident)

    print("\n================================")
    print("       CYBERRANK AI")
    print("       HYBRID AI ENGINE")
    print("================================")

    print("Incident:", result["incident_id"])

    print("Rule Score:", result["rule_score"])

    print("ML Prediction:", result["ml_prediction"], "%")

    print("Final Hybrid Score:", result["final_score"])

    print("Priority:", result["priority"])

    print("================================")