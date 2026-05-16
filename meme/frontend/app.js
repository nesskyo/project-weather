// Configuration
const CONFIG = {
    USE_MOCK_DATA: false, // Set to false when backend is ready
    API_BASE: 'http://localhost:8000/api/weather'
};

// DOM Elements
const elements = {
    form: document.getElementById('search-form'),
    input: document.getElementById('search-input'),
    locationBtn: document.getElementById('location-btn'),
    unitC: document.getElementById('unit-c'),
    unitF: document.getElementById('unit-f'),
    
    // States
    mainContent: document.getElementById('main-content'),
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    emptyState: document.getElementById('empty-state'),
    
    // Data Elements
    cityName: document.getElementById('city-name'),
    currentDate: document.getElementById('current-date'),
    currentTemp: document.getElementById('current-temp'),
    currentIcon: document.getElementById('current-icon'),
    currentDesc: document.getElementById('current-desc'),
    feelsLike: document.getElementById('feels-like-temp'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    uvIndex: document.getElementById('uv-index'),
    pressure: document.getElementById('pressure'),
    forecastList: document.getElementById('forecast-list'),
    
    // AI Elements
    aiLoading: document.getElementById('ai-loading'),
    aiText: document.getElementById('ai-text'),
    
    unitSymbols: document.querySelectorAll('.unit-symbol')
};

// App State
let state = {
    isCelsius: true,
    currentData: null,
    forecastData: null
};

// Initialize App
function init() {
    setupEventListeners();
    updateDate();
    
    // Optional: Auto-fetch location on load if preferred
    // handleGeolocation();
}

function setupEventListeners() {
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = elements.input.value.trim();
        if (city) {
            fetchWeatherData(city);
        }
    });

    elements.locationBtn.addEventListener('click', handleGeolocation);

    elements.unitC.addEventListener('click', () => {
        if (!state.isCelsius) {
            state.isCelsius = true;
            elements.unitC.classList.add('active');
            elements.unitF.classList.remove('active');
            updateUI();
        }
    });

    elements.unitF.addEventListener('click', () => {
        if (state.isCelsius) {
            state.isCelsius = false;
            elements.unitF.classList.add('active');
            elements.unitC.classList.remove('active');
            updateUI();
        }
    });
}

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.currentDate.textContent = new Date().toLocaleDateString('en-US', options);
}

// --- API & Data Fetching ---

async function fetchWeatherData(city) {
    showState('loading');
    
    try {
        if (CONFIG.USE_MOCK_DATA) {
            await simulateNetworkDelay();
            state.currentData = getMockCurrent(city);
            state.forecastData = getMockForecast();
        } else {
            const [currentRes, forecastRes] = await Promise.all([
                fetch(`${CONFIG.API_BASE}/current?city=${encodeURIComponent(city)}`),
                fetch(`${CONFIG.API_BASE}/forecast?city=${encodeURIComponent(city)}`)
            ]);
            
            if (!currentRes.ok || !forecastRes.ok) throw new Error('City not found or API error');
            
            state.currentData = await currentRes.json();
            state.forecastData = await forecastRes.json();
        }
        
        updateUI();
        showState('content');
        fetchAIInsights(state.currentData);
    } catch (err) {
        showError(err.message);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    showState('loading');
    
    try {
        if (CONFIG.USE_MOCK_DATA) {
            await simulateNetworkDelay();
            state.currentData = getMockCurrent("Local Area");
            state.forecastData = getMockForecast();
        } else {
            const res = await fetch(`${CONFIG.API_BASE}/coords?lat=${lat}&lon=${lon}`);
            if (!res.ok) throw new Error('Failed to fetch location weather');
            
            const data = await res.json();
            // Assuming the backend returns both current and forecast in one for coords, 
            // or we might need separate calls. Adjust based on backend implementation.
            state.currentData = data.current; 
            state.forecastData = data.forecast;
        }
        
        updateUI();
        showState('content');
        fetchAIInsights(state.currentData);
    } catch (err) {
        showError(err.message);
    }
}

function handleGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                showError("Location access denied. Please search for a city.");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
}

async function fetchAIInsights(currentData) {
    if (!currentData) return;
    
    // Show loading state for AI
    elements.aiLoading.classList.remove('hidden');
    elements.aiText.classList.add('hidden');
    
    try {
        if (CONFIG.USE_MOCK_DATA) {
            await simulateNetworkDelay();
            elements.aiText.textContent = "AI Summary (Mock): It looks like a nice day! Grab a light jacket just in case, and enjoy the weather.";
        } else {
            const payload = {
                city: currentData.city || "Unknown City",
                tempC: currentData.tempC,
                feelsLikeC: currentData.feelsLikeC,
                condition: currentData.condition,
                description: currentData.description,
                humidity: currentData.humidity,
                windSpeed: parseFloat(currentData.windSpeed) || 0,
                uvIndex: currentData.uvIndex,
                pressure: currentData.pressure
            };
            
            const res = await fetch(`${CONFIG.API_BASE}/ai-insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error('AI request failed');
            
            const data = await res.json();
            elements.aiText.textContent = data.insight;
        }
    } catch (err) {
        console.error("AI Insights Error:", err);
        elements.aiText.textContent = "Unable to generate AI insights at this time.";
    } finally {
        elements.aiLoading.classList.add('hidden');
        elements.aiText.classList.remove('hidden');
    }
}

// --- UI Updating ---

function updateUI() {
    if (!state.currentData || !state.forecastData) return;
    
    const curr = state.currentData;
    
    // Update Theme
    updateTheme(curr.condition);
    function updateTheme(condition) {
    document.body.className = ''; 
    
    // Tambahkan pengecekan ini:
    if (!condition) {
        document.body.classList.add('theme-default');
        return;
    }

    const condStr = condition.toLowerCase();
    // ... sisa kode tetap sama
}
    
    // Update text
    elements.cityName.textContent = curr.city;
    elements.currentDesc.textContent = curr.description;
    
    // Update Temps
    elements.currentTemp.textContent = formatTemp(curr.tempC);
    elements.feelsLike.textContent = formatTemp(curr.feelsLikeC);
    elements.unitSymbols.forEach(el => el.textContent = state.isCelsius ? '°C' : '°F');
    
    // Update Details
    elements.humidity.textContent = `${curr.humidity}%`;
    elements.windSpeed.textContent = `${curr.windSpeed} m/s`;
    elements.uvIndex.textContent = curr.uvIndex;
    elements.pressure.textContent = `${curr.pressure} hPa`;
    
    // Update Icon
    updateIcon(elements.currentIcon, curr.condition);
    
    // Render Forecast
    renderForecast(state.forecastData);
}
function getIconClass(condition) {
    // Tambahkan pengecekan ini:
    if (!condition) return 'fa-solid fa-cloud-sun'; 

    const condStr = condition.toLowerCase();
    // ... sisa kode tetap sama
}

function renderForecast(forecastArray) {
    elements.forecastList.innerHTML = '';
    
    forecastArray.forEach(day => {
        const item = document.createElement('div');
        item.className = 'forecast-item';
        
        const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
        const temp = formatTemp(day.tempC);
        
        item.innerHTML = `
            <span class="day">${dayName}</span>
            <i class="${getIconClass(day.condition)}"></i>
            <span class="temp">${temp}°</span>
        `;
        elements.forecastList.appendChild(item);
    });
}

function updateTheme(condition) {
    document.body.className = ''; // reset
    const condStr = condition.toLowerCase();
    
    if (condStr.includes('clear')) {
        document.body.classList.add('theme-clear-day');
    } else if (condStr.includes('rain') || condStr.includes('drizzle')) {
        document.body.classList.add('theme-rain');
    } else if (condStr.includes('snow')) {
        document.body.classList.add('theme-snow');
    } else if (condStr.includes('cloud')) {
        document.body.classList.add('theme-clouds');
    } else {
        document.body.classList.add('theme-default');
    }
}

function updateIcon(element, condition) {
    element.className = getIconClass(condition);
}

function getIconClass(condition) {
    const condStr = condition.toLowerCase();
    if (condStr.includes('clear')) return 'fa-solid fa-sun';
    if (condStr.includes('rain')) return 'fa-solid fa-cloud-rain';
    if (condStr.includes('snow')) return 'fa-solid fa-snowflake';
    if (condStr.includes('cloud')) return 'fa-solid fa-cloud';
    if (condStr.includes('thunder')) return 'fa-solid fa-cloud-bolt';
    return 'fa-solid fa-cloud-sun';
}

function formatTemp(tempCelsius) {
    if (state.isCelsius) {
        return Math.round(tempCelsius);
    } else {
        return Math.round((tempCelsius * 9/5) + 32);
    }
}

// --- State Management ---

function showState(stateName) {
    elements.mainContent.classList.add('hidden');
    elements.loadingState.classList.add('hidden');
    elements.errorState.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
    
    if (stateName === 'content') elements.mainContent.classList.remove('hidden');
    else if (stateName === 'loading') elements.loadingState.classList.remove('hidden');
    else if (stateName === 'error') elements.errorState.classList.remove('hidden');
    else if (stateName === 'empty') elements.emptyState.classList.remove('hidden');
}

function showError(msg) {
    document.getElementById('error-msg').textContent = msg;
    showState('error');
}

// --- Mock Data Helpers ---

function simulateNetworkDelay() {
    return new Promise(resolve => setTimeout(resolve, 800));
}

function getMockCurrent(city) {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
        city: city || "London",
        tempC: 15 + (Math.random() * 15 - 5), // 10 to 25
        feelsLikeC: 14 + (Math.random() * 15 - 5),
        condition: randomCondition,
        description: `scattered ${randomCondition.toLowerCase()}`,
        humidity: Math.floor(Math.random() * 50) + 40,
        windSpeed: (Math.random() * 10).toFixed(1),
        uvIndex: Math.floor(Math.random() * 10),
        pressure: 1012 + Math.floor(Math.random() * 20 - 10)
    };
}

function getMockForecast() {
    const forecast = [];
    let d = new Date();
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
    
    for (let i = 1; i <= 7; i++) {
        d.setDate(d.getDate() + 1);
        forecast.push({
            date: d.toISOString(),
            tempC: 10 + (Math.random() * 20),
            condition: conditions[Math.floor(Math.random() * conditions.length)]
        });
    }
    return forecast;
}
function updateUI() {
    // 1. Cek apakah data benar-benar ada
    if (!state.currentData || !state.forecastData) {
        console.error("Data cuaca belum lengkap atau format API salah.");
        return; 
    }
    
    const curr = state.currentData;
    
    // 2. Gunakan Optional Chaining (?.) dan Fallback (||)
    // Ini agar jika 'condition' kosong, aplikasi tidak langsung crash
    const condition = curr.condition || "default";
    
    // Update Theme & UI
    updateTheme(condition);
    
    elements.cityName.textContent = curr.city || "Unknown";
    elements.currentDesc.textContent = curr.description || "";
    
    // Sisa kode...
    elements.currentTemp.textContent = formatTemp(curr.tempC || 0);
    // ...
}
async function fetchWeatherData(city) {
    showState('loading');
    
    try {
        // Ganti 'API_KEY_KAMU' dengan API Key dari OpenWeather
        const API_KEY = 'a7f6e0e6aadbb0824c0e3a3350bf3828'; 
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) throw new Error('Kota tidak ditemukan');
        
        const rawData = await response.json();
        
        // Mapping data agar sesuai dengan state UI kamu
        state.currentData = {
            city: rawData.name,
            tempC: rawData.main.temp,
            feelsLikeC: rawData.main.feels_like,
            condition: rawData.weather[0].main,
            description: rawData.weather[0].description,
            humidity: rawData.main.humidity,
            windSpeed: rawData.wind.speed,
            uvIndex: 0, // Default 0 jika tidak ada
            pressure: rawData.main.pressure
        };
        
        // Mock data untuk forecast (karena API OpenWeather gratis butuh endpoint terpisah)
        state.forecastData = getMockForecast(); 
        
        updateUI();
        showState('content');
    } catch (err) {
        showError(err.message);
    }
}


// Start App
init();
