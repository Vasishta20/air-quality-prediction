import os
import joblib
import pandas as pd
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the ML model
MODEL_PATH = 'aqi_model_8_features.pkl'
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Function to categorize AQI
def get_air_quality(aqi: float) -> str:
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    elif aqi > 400:
        return "Severe"
    return "Unknown"

# Root route
@app.route('/')
def home():
    return 'AQI Prediction API is running!'

# Prediction route
@app.route('/api/predict', methods=['POST'])
def predict_aqi():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()
        city_name = data.get('city')
        if not city_name:
            return jsonify({'error': 'No city provided'}), 400

        # Get API key from environment variable
        YOUR_API_KEY = os.environ.get("OPENWEATHER_API_KEY")
        if not YOUR_API_KEY:
            return jsonify({'error': 'API key not set in environment variables'}), 500

        # Get city coordinates
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name}&limit=1&appid={YOUR_API_KEY}"
        geo_response = requests.get(geo_url)
        geo_data = geo_response.json()

        if not geo_data:
            return jsonify({'error': 'City not found'}), 404

        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']

        # Get air pollution data
        air_url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={YOUR_API_KEY}"
        air_response = requests.get(air_url)
        air_data = air_response.json()
        components = air_data.get('list', [{}])[0].get('components', {})

        # Prepare input for model
        input_data = pd.DataFrame([[
            components.get('pm2_5', 0),
            components.get('pm10', 0),
            components.get('no', 0),
            components.get('no2', 0),
            components.get('nh3', 0),
            components.get('co', 0),
            components.get('so2', 0),
            components.get('o3', 0)
        ]], columns=['PM2.5', 'PM10', 'NO', 'NO2', 'NH3', 'CO', 'SO2', 'O3'])

        # Predict AQI
        aqi_prediction = round(model.predict(input_data)[0], 2)
        aqi_quality = get_air_quality(aqi_prediction)

        return jsonify({
            'city': city_name,
            'predicted_aqi': aqi_prediction,
            'aqi_quality': aqi_quality,
            'live_pollutants': components
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run app
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)