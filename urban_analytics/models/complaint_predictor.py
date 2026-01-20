import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

# Dummy training data (in real project, use MongoDB data)
def create_dummy_data():
    return pd.DataFrame({
        'population_density': [1000, 2000, 1500, 3000],
        'infrastructure_age': [5, 10, 8, 15],
        'rainfall': [50, 80, 60, 120],
        'complaints_next_week': [10, 25, 15, 40]
    })

def train_complaint_model():
    df = create_dummy_data()
    X = df[['population_density', 'infrastructure_age', 'rainfall']]
    y = df['complaints_next_week']
    
    model = RandomForestRegressor(n_estimators=100)
    model.fit(X, y)
    
    # Save model
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/complaint_predictor.pkl')
    print("✅ Complaint prediction model trained!")

if __name__ == "__main__":
    train_complaint_model()