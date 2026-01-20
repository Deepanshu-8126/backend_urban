import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# Create realistic training data
def create_training_data():
    return pd.DataFrame({
        'population_density': [1000, 2000, 1500, 3000, 2500, 1800, 3500, 1200],
        'infrastructure_age': [5, 10, 8, 15, 12, 7, 20, 4],
        'rainfall': [50, 80, 60, 120, 90, 55, 150, 40],
        'complaints_next_week': [10, 25, 15, 40, 30, 12, 50, 8]
    })

def train_and_save_model():
    df = create_training_data()
    X = df[['population_density', 'infrastructure_age', 'rainfall']]
    y = df['complaints_next_week']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save model
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/complaint_predictor.pkl')
    print("✅ Complaint prediction model trained and saved!")

if __name__ == "__main__":
    train_and_save_model()