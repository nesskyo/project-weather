# Task 1: Frontend Development

## Objective
Implement the user interface and client-side logic for the Weather Web Application based on the PRD and Technical Design Document.

## Requirements
- **Tech Stack**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla JS).
- **Design**: Responsive layout, Mobile-first approach, Glassmorphism theme with dynamic backgrounds based on weather conditions.

## Sub-tasks
- [ ] Set up the basic HTML structure (Header, Main Content Area, Current Weather Card, Details Grid, Forecast Section).
- [ ] Implement CSS styling, including glassmorphism (`backdrop-filter: blur`) and dynamic weather background themes.
- [ ] Implement Vanilla JS to handle DOM manipulation and user events (search bar input, geolocation button, toggle Celsius/Fahrenheit).
- [ ] Integrate with the backend API using `fetch` to retrieve weather data:
  - `GET /api/weather/current?city={city_name}`
  - `GET /api/weather/forecast?city={city_name}`
  - `GET /api/weather/coords?lat={latitude}&lon={longitude}`
- [ ] Handle HTML5 Geolocation API for auto-detecting user coordinates on page load.
- [ ] Implement UI error handling (e.g., "City not found", "Location access denied").
- [ ] Add micro-interactions (hover effects, loading skeletons) to enhance UX.
