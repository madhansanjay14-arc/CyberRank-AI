# =====================================================
# CYBERRANK AI
# Explainable Cyber Incident Risk Scoring Engine
# =====================================================


# 1. RISK FACTOR WEIGHTS

WEIGHTS = {
    "severity": 0.20,
    "data_sensitivity": 0.15,
    "asset_importance": 0.15,
    "attack_confidence": 0.20,
    "affected_users": 0.10,
    "business_impact": 0.20,
}


# 2. FACTOR DISPLAY NAMES

FACTOR_NAMES = {
    "severity": "Incident Severity",
    "data_sensitivity": "Data Sensitivity",
    "asset_importance": "Asset Importance",
    "attack_confidence": "Attack Confidence",
    "affected_users": "Affected Users",
    "business_impact": "Business Impact",
}


# 3. NORMALIZE RATINGS

def normalize_rating(value):

    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("Rating must be a number between 1 and 5")

    if not 1 <= value <= 5:
        raise ValueError("Rating must be between 1 and 5")

    return ((value - 1) / 4) * 100


# 4. NORMALIZE AFFECTED USERS

def normalize_users(count):

    if isinstance(count, bool) or not isinstance(count, int):
        raise ValueError("Affected users must be a non-negative integer")

    if count < 0:
        raise ValueError("Affected users cannot be negative")

    if count == 0:
        return 0

    elif count <= 5:
        return 20

    elif count <= 20:
        return 40

    elif count <= 50:
        return 60

    elif count <= 100:
        return 80

    else:
        return 100


# 5. VALIDATE INCIDENT

def validate_incident(incident):

    for factor in WEIGHTS:

        if factor not in incident:
            raise ValueError(f"Missing incident factor: {factor}")

        value = incident[factor]

        if factor == "affected_users":
            normalize_users(value)
        else:
            normalize_rating(value)


# 6. CALCULATE RULE-BASED RISK

def calculate_risk(incident):

    validate_incident(incident)

    total_score = 0

    for factor, weight in WEIGHTS.items():

        value = incident[factor]

        if factor == "affected_users":
            normalized_score = normalize_users(value)
        else:
            normalized_score = normalize_rating(value)

        total_score += normalized_score * weight

    return round(total_score, 2)


# 7. EXPLAINABLE RISK DETAILS

def calculate_risk_details(incident):

    validate_incident(incident)

    factor_details = {}

    total_score = 0

    for factor, weight in WEIGHTS.items():

        value = incident[factor]

        if factor == "affected_users":
            normalized_score = normalize_users(value)
        else:
            normalized_score = normalize_rating(value)

        contribution = normalized_score * weight

        factor_details[factor] = {
            "factor_name": FACTOR_NAMES[factor],
            "input_value": value,
            "normalized_score": round(normalized_score, 2),
            "weight": weight,
            "contribution": round(contribution, 2),
        }

        total_score += contribution

    return {
        "rule_score": round(total_score, 2),
        "factor_details": factor_details,
    }


# 8. PRIORITY CLASSIFICATION

def get_priority(score):

    if score >= 85:
        return "CRITICAL"

    elif score >= 65:
        return "HIGH"

    elif score >= 40:
        return "MEDIUM"

    else:
        return "LOW"


# 9. GENERATE EXPLANATION

def generate_risk_explanation(factor_details, priority):

    explanations = []

    for factor, details in factor_details.items():

        contribution = details["contribution"]

        if contribution >= 15:
            impact_level = "Very High"

        elif contribution >= 10:
            impact_level = "High"

        elif contribution >= 5:
            impact_level = "Moderate"

        else:
            impact_level = "Low"

        explanations.append({
            "factor": details["factor_name"],
            "input_value": details["input_value"],
            "normalized_score": details["normalized_score"],
            "contribution": contribution,
            "impact_level": impact_level,
        })

    # Highest contributing factors first

    explanations.sort(
        key=lambda item: item["contribution"],
        reverse=True
    )

    priority_messages = {

        "CRITICAL": (
            "This incident has an extremely high risk score "
            "and requires immediate security investigation."
        ),

        "HIGH": (
            "This incident has a high risk score "
            "and requires prompt investigation."
        ),

        "MEDIUM": (
            "This incident has a moderate risk score "
            "and should be investigated and monitored."
        ),

        "LOW": (
            "This incident has a relatively low risk score "
            "and can be handled through routine monitoring."
        ),
    }

    return {
        "priority": priority,
        "summary": priority_messages[priority],
        "top_risk_factors": explanations[:3],
        "all_factors": explanations,
    }


# 10. SECURITY RECOMMENDATIONS

def get_recommendations(priority):

    recommendations = {

        "CRITICAL": [
            "Immediately notify the security operations team.",
            "Investigate affected systems.",
            "Consider isolating compromised assets.",
            "Preserve relevant security logs and evidence.",
            "Escalate to the incident response team.",
        ],

        "HIGH": [
            "Prioritize investigation of the incident.",
            "Review affected systems and user accounts.",
            "Check security logs for suspicious activity.",
            "Notify the responsible security analyst.",
        ],

        "MEDIUM": [
            "Investigate during the normal response cycle.",
            "Monitor affected systems for unusual activity.",
            "Review relevant security events.",
        ],

        "LOW": [
            "Continue routine security monitoring.",
            "Record the incident for future reference.",
            "Reassess if new suspicious activity appears.",
        ],
    }

    return recommendations.get(priority, [])


# 11. COMPLETE EXPLAINABLE ANALYSIS

def analyze_incident_risk(incident):

    risk_details = calculate_risk_details(incident)

    rule_score = risk_details["rule_score"]

    priority = get_priority(rule_score)

    explanation = generate_risk_explanation(
        risk_details["factor_details"],
        priority
    )

    recommendations = get_recommendations(priority)

    return {
        "incident_id": incident.get("incident_id"),
        "rule_score": rule_score,
        "priority": priority,
        "factor_details": risk_details["factor_details"],
        "explanation": explanation,
        "recommendations": recommendations,
    }


# 12. TESTING

if __name__ == "__main__":

    sample_incident = {
        "incident_id": "INC-TEST-001",
        "severity": 5,
        "data_sensitivity": 5,
        "asset_importance": 5,
        "attack_confidence": 5,
        "affected_users": 100,
        "business_impact": 5,
    }

    result = analyze_incident_risk(sample_incident)

    print("\n========== CYBERRANK AI ==========")

    print("Incident ID:", result["incident_id"])

    print("Rule Score:", result["rule_score"])

    print("Priority:", result["priority"])

    print("\n========== FACTOR CONTRIBUTIONS ==========")

    for factor, details in result["factor_details"].items():

        print(
            details["factor_name"],
            "->",
            details["contribution"],
            "points"
        )

    print("\n========== EXPLANATION ==========")

    print(result["explanation"]["summary"])

    print("\nTop Risk Factors:")

    for factor in result["explanation"]["top_risk_factors"]:

        print(
            factor["factor"],
            "-",
            factor["impact_level"]
        )

    print("\n========== RECOMMENDATIONS ==========")

    for recommendation in result["recommendations"]:

        print("-", recommendation)