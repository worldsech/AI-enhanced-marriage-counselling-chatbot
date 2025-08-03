# train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib
import sys

# 1. Load the dataset from the CSV file
try:
    df = pd.read_csv('divorce_data.csv')
    # Sanitize column names to be valid Python identifiers
    # (replace spaces with underscores, remove special characters)
    df.columns = [c.strip().replace(' ', '_').replace('-', '_') for c in df.columns]
    print("✅ Dataset loaded successfully.")
except FileNotFoundError:
    print("❌ Error: divorce_data.csv not found. Please create it from your dataset.")
    sys.exit(1)

# 2. Prepare the data for training
# The last column 'Divorce_Probability' is our target variable (what we want to predict)
X = df.drop('Divorce_Probability', axis=1)
y = df['Divorce_Probability']

# Split data into a training set and a testing set for evaluation
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Train the model
# A RandomForestRegressor is a robust and effective choice for this type of tabular data.
print("⏳ Training the prediction model...")
model = RandomForestRegressor(n_estimators=100, random_state=42, oob_score=True)
model.fit(X_train, y_train)
print("✅ Model training complete.")

# 4. Evaluate the model (optional but highly recommended)
predictions = model.predict(X_test)
mse = mean_squared_error(y_test, predictions)
print(f"📊 Model Mean Squared Error on test data: {mse:.4f}")
print(f"📊 Model OOB (Out-of-Bag) Score: {model.oob_score_:.4f} (A score closer to 1.0 is better)")

# 5. Save the trained model and the list of feature columns to files
joblib.dump(model, 'divorce_predictor_model.joblib')
joblib.dump(list(X.columns), 'model_features.joblib')

print("\n🎉 Success! Model saved to 'divorce_predictor_model.joblib' and feature list saved to 'model_features.joblib'.")

