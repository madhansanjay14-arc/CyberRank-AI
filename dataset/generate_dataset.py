import csv
import random
from pathlib import Path

# Reproducible sample data
random.seed(42)

# Incident categories and record counts
incident_types = {
    "Failed Login": 20,
    "Malware Detection": 15,
    "Port Scan": 15,
    "Data Exfiltration": 15,
    "Suspicious Email": 15,
    "Brute Force": 20
}

# Generate one incident
def generate_incident(incident_id, incident_type):

    severity = random.randint(1, 5)
    data_sensitivity = random.randint(1, 5)
    asset_importance = random.randint(1, 5)
    attack_confidence = random.randint(1, 5)
    affected_users = random.randint(0, 150)
    business_impact = random.randint(1, 5)

    # Simulated training label
    # This is a synthetic demonstration rule,
    # not a real-world security verdict.

    attack_label = int(
        attack_confidence >= 4
        and severity >= 3
    )

    return {
        "incident_id": incident_id,
        "incident_type": incident_type,
        "severity": severity,
        "data_sensitivity": data_sensitivity,
        "asset_importance": asset_importance,
        "attack_confidence": attack_confidence,
        "affected_users": affected_users,
        "business_impact": business_impact,
        "attack_label": attack_label
    }


# Generate all incidents
incidents = []

counter = 1

for incident_type, count in incident_types.items():

    for _ in range(count):

        incident = generate_incident(
            f"INC-{counter:03d}",
            incident_type
        )

        incidents.append(incident)

        counter += 1


# Save dataset as CSV
output_path = Path(__file__).with_name("sample_incidents.csv")

with open(output_path, "w", newline="", encoding="utf-8") as file:

    fieldnames = incidents[0].keys()

    writer = csv.DictWriter(
        file,
        fieldnames=fieldnames
    )

    writer.writeheader()
    writer.writerows(incidents)


# Display results
print("\n======= CYBERRANK AI DATASET =======")

print("Total incidents generated:", len(incidents))

for incident_type, count in incident_types.items():

    print(f"{incident_type}: {count}")

print("\nDataset saved successfully!")
print("Location:", output_path)