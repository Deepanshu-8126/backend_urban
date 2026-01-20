import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

def create_population_data():
    # Create consistent training data
    data = []
    
    # Year 1
    data.append({
        'population': 100000,
        'growth_rate': 0.05,
        'migration_in': 2000,
        'births': 1500,
        'next_year_population': 107500  # 100000 + (100000*0.05) + 2000 + 1500 - deaths
    })
    
    # Year 2
    data.append({
        'population': 107500,
        'growth_rate': 0.05,
        'migration_in': 2100,
        'births': 1575,
        'next_year_population': 115475
    })
    
    # Year 3
    data.append({
        'population': 115475,
        'growth_rate': 0.05,
        'migration_in': 2205,
        'births': 1654,
        'next_year_population': 123953
    })
    
    # Year 4
    data.append({
        'population': 123953,
        'growth_rate': 0.05,
        'migration_in': 2315,
        'births': 1737,
        'next_year_population': 132951
    })
    
    return pd.DataFrame(data)

def train_population_model():
    df = create_population_data()
    X = df[['population', 'growth_rate', 'migration_in', 'births']]
    y = df['next_year_population']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/population_forecast.pkl')
    print("✅ Population forecasting model trained and saved!")
    print(f"Training data:\n{df}")

if __name__ == "__main__":
    train_population_model()