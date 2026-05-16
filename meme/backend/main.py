import os
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
from google import genai
from typing import Dict, Any

# Load environment variables
load_dotenv()

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5"

app = FastAPI(title="SkyCast Weather API Proxy")

# Initialize Gemini Client if API Key is present
gemini_client = None
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the SkyCast API Proxy. See /docs for endpoints."}

async def fetch_from_openweathermap(endpoint: str, params: dict):
    if not OPENWEATHERMAP_API_KEY or OPENWEATHERMAP_API_KEY == "your_api_key_here":
        raise HTTPException(status_code=500, detail="OpenWeatherMap API Key is not configured on the server.")
    
    params["appid"] = OPENWEATHERMAP_API_KEY
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/{endpoint}", params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            # Relay the error code from OpenWeatherMap if possible
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Location not found by OpenWeatherMap.")
            elif e.response.status_code == 401:
                raise HTTPException(status_code=500, detail="Invalid OpenWeatherMap API Key.")
            else:
                raise HTTPException(status_code=e.response.status_code, detail=f"OpenWeatherMap API error: {e.response.text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Failed to connect to OpenWeatherMap API: {str(e)}")

@app.get("/api/weather/current")
async def get_current_weather(
    city: str = Query(..., description="Name of the city"),
    units: str = Query("metric", description="Units of measurement (standard, metric, imperial)")
):
    params = {"q": city, "units": units}
    return await fetch_from_openweathermap("weather", params)

@app.get("/api/weather/forecast")
async def get_forecast(
    city: str = Query(..., description="Name of the city"),
    units: str = Query("metric", description="Units of measurement (standard, metric, imperial)")
):
    params = {"q": city, "units": units}
    return await fetch_from_openweathermap("forecast", params)

@app.get("/api/weather/coords")
async def get_weather_by_coords(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    units: str = Query("metric", description="Units of measurement (standard, metric, imperial)")
):
    params = {"lat": lat, "lon": lon, "units": units}
    return await fetch_from_openweathermap("weather", params)

class WeatherInfo(BaseModel):
    city: str
    tempC: float
    feelsLikeC: float
    condition: str
    description: str
    humidity: int
    windSpeed: float
    uvIndex: float | None = None
    pressure: int

@app.post("/api/weather/ai-insights")
async def get_ai_insights(weather: WeatherInfo):
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server.")
    
    prompt = f"""
    You are a helpful, concise, and friendly weather assistant. Based on the following current weather data for {weather.city}, provide a short (2-3 sentences) summary and a practical clothing or activity recommendation.
    
    Weather Data:
    - Temperature: {weather.tempC}°C (Feels like {weather.feelsLikeC}°C)
    - Condition: {weather.condition} ({weather.description})
    - Humidity: {weather.humidity}%
    - Wind Speed: {weather.windSpeed} m/s
    """
    
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"insight": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI insights: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
