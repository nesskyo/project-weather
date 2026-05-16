# Task 2: Backend Development

## Objective
Develop a lightweight Python backend that acts as a secure API gateway to fetch data from the external OpenWeatherMap API.

## Requirements
- **Tech Stack**: Python 3.x, FastAPI (recommended).
- **Architecture**: Stateless proxy server, no database required.
- **Security**: Hide OpenWeatherMap API key securely.

## Sub-tasks
- [ ] Initialize Python environment and install dependencies (FastAPI, Uvicorn, python-dotenv, httpx/requests).
- [ ] Set up environment variables (`.env`) for the OpenWeatherMap API key securely.
- [ ] Implement the `GET /api/weather/current?city={city_name}` endpoint to proxy current weather data requests.
- [ ] Implement the `GET /api/weather/forecast?city={city_name}` endpoint to proxy multi-day forecast requests.
- [ ] Implement the `GET /api/weather/coords?lat={latitude}&lon={longitude}` endpoint for geolocation-based weather requests.
- [ ] Add CORS middleware to allow requests from the frontend client.
- [ ] Implement standardized error handling (e.g., catching external API errors and returning proper HTTP status codes like 404 or 500 to the frontend).
