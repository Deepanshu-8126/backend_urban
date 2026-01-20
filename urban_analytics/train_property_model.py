import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

def create_property_data():
    return pd.DataFrame({
        'area_sqm': [100, 150, 200, 120, 180, 250, 90, 300],
        'property_type': [0, 1, 1, 0, 1, 2, 0, 2],  # 0=residential, 1=commercial, 2=industrial
        'ward_factor': [1.2, 1.5, 1.8, 1.1, 1.6, 2.0, 1.0, 2.2],  # Ward desirability score
        'building_age': [5, 10, 8, 3, 12, 15, 2, 20],
        'property_value': [500000, 1800000, 2400000, 480000, 2160000, 3750000, 405000, 4950000]
    })

def train_property_model():
    df = create_property_data()
    X = df[['area_sqm', 'property_type', 'ward_factor', 'building_age']]
    y = df['property_value']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/property_valuation.pkl')
    print("✅ Property valuation model trained and saved!")

if __name__ == "__main__":
    train_property_model()