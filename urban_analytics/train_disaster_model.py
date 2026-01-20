import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

def create_disaster_data():
    return pd.DataFrame({
        'population_density': [1000, 2000, 1500, 3000, 2500, 1800, 3500, 1200],
        'infrastructure_age': [5, 10, 8, 15, 12, 7, 20, 4],
        'proximity_to_river': [0, 1, 0, 1, 1, 0, 1, 0],  # 1 = near river, 0 = not
        'building_quality': [4, 3, 4, 2, 3, 4, 1, 5],     # 1=poor, 5=excellent
        'disaster_risk': [0, 1, 0, 2, 1, 0, 2, 0]        # 0=low, 1=medium, 2=high
    })

def train_disaster_model():
    df = create_disaster_data()
    X = df[['population_density', 'infrastructure_age', 'proximity_to_river', 'building_quality']]
    y = df['disaster_risk']
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/disaster_risk_classifier.pkl')
    print("✅ Disaster risk classification model trained and saved!")

if __name__ == "__main__":
    train_disaster_model()