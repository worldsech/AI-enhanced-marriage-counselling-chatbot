# prediction_service.py
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import sys

app = Flask(__name__)

# Load the trained model and feature list on startup
try:
    model = joblib.load('divorce_predictor_model.joblib')
    model_features = joblib.load('model_features.joblib')
    print("✅ Model and features loaded successfully.")
except FileNotFoundError:
    print("❌ Error: Model files not found. Please run train_model.py first.")
    model = None
    model_features = None
    sys.exit(1)

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        # Get the JSON data from the request
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'Invalid JSON input'}), 400

        # Create a pandas DataFrame from the input data
        input_df = pd.DataFrame([data])

        # Reorder columns to match the model's training order
        input_df = input_df[model_features]

        # Make the prediction
        prediction = model.predict(input_df)

        # Return the prediction as JSON
        return jsonify({'divorce_probability': prediction[0]})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # For production, we use a proper WSGI server like Waitress.
    # It's more secure and performant than Flask's built-in development server.
    from waitress import serve
    print("🚀 Starting production-ready prediction service at http://0.0.0.0:5001")
    serve(app, host='0.0.0.0', port=5001)
