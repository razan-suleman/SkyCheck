# 🌌 SkyCheck - Can I Stargaze?

A beautiful, modern web application that tells you if tonight is perfect for stargazing. Get real-time sky conditions, moon phases, visible planets, ISS pass times, and 7-day stargazing forecasts for any location worldwide.

## ✨ Features

### 🌟 Core Functionality
- **Real-time Stargazing Score**: Intelligent scoring system (0-100) based on cloud cover, humidity, precipitation, wind speed, and moon illumination
- **Location Support**: Search any city worldwide or use your current location via browser geolocation
- **Moon Phase Tracking**: Detailed moon phase information with beautiful visualizations and illumination percentage
- **Visible Planets**: See which planets are visible tonight with altitude and azimuth data
- **ISS Pass Predictions**: Get upcoming International Space Station flyover times with brightness ratings

### 📊 Detailed Analytics
- **Sun & Moon Times**: Precise sunset, sunrise, moonrise, and moonset times with dark sky window calculations
- **Hourly Tonight Breakdown**: Hour-by-hour forecast showing the best stargazing window for tonight
- **7-Day Forecast**: Weekly stargazing outlook with daily scores and moon phases
- **Light Pollution Estimate**: Bortle Scale rating based on population density
- **Astronomical Twilight**: Understand when true darkness begins for optimal stargazing

### 🎨 User Experience
- **Glassmorphic Design**: Modern UI with blur effects and gradient overlays
- **Animated Starfield Background**: Subtle twinkling stars create an immersive atmosphere
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Transitions**: Polished animations and loading states
- **Color-Coded Ratings**: Visual indicators for quick assessment (Excellent/Good/Fair/Poor)

## 🛠️ Tech Stack

- **Frontend**: React 19.2.4
- **Build Tool**: Vite 8.0.1
- **Language**: JavaScript (ES6+)
- **Styling**: Inline CSS with modern CSS features (gradients, backdrop-filter, flexbox/grid)
- **Architecture**: Modular component-based design

## 📁 Project Structure

```
src/
├── App.jsx                    # Main application component (446 lines)
├── main.jsx                   # Entry point
├── api/                       # API integration layer
│   ├── weatherApi.js          # Open-Meteo weather data
│   ├── geocoding.js           # Location services (browser & geocoding)
│   └── issApi.js              # ISS pass predictions
├── components/                # Reusable React components
│   ├── ResultCard.jsx         # Main score display card
│   ├── SunTimes.jsx           # Sunset/sunrise/twilight times
│   ├── LightPollution.jsx     # Bortle scale display
│   ├── Planets.jsx            # Visible planets list
│   ├── ISSPasses.jsx          # ISS flyover times
│   ├── HourlyBreakdown.jsx    # Tonight's hourly forecast
│   └── WeeklyForecast.jsx     # 7-day stargazing forecast
├── utils/                     # Utility functions
│   ├── astronomy.js           # Moon/planet calculations
│   ├── scoring.js             # Stargazing quality rating
│   └── weatherHelpers.js      # Weather data processing
├── constants/                 # Static data
│   └── moonPhases.js          # Moon phase images & utilities
└── assets/                    # Images and static files
    └── moon-phases/           # 8 moon phase PNG images
```

### 🏗️ Architecture Highlights

This project follows a **clean, modular architecture** for maximum maintainability:

- **Separation of Concerns**: API calls, business logic, and UI are completely separated
- **Reusable Components**: Each UI section is an independent, testable component
- **Pure Utility Functions**: Astronomy and scoring calculations are isolated and side-effect free
- **Single Responsibility**: Each module has one clear purpose
- **Easy Testing**: Modular design allows unit testing of individual functions/components

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skycheck.git
   cd skycheck/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage

### Check Your Location
1. Click **"My Location"** button to use browser geolocation
2. Allow location permissions when prompted
3. View real-time stargazing conditions for your area

### Search Any City
1. Type a city name in the search box (e.g., "Tokyo", "London", "New York")
2. Press Enter or click **"Search City"**
3. Explore conditions for that location

### Understand the Score
- **90-100**: 🌟 Excellent - Perfect stargazing conditions
- **70-89**: ⭐ Good - Favorable conditions
- **50-69**: ☁️ Fair - Some clouds but usable
- **0-49**: ❌ Poor - Not recommended

### Read the Forecast
- **Tonight Score**: Current/tonight's conditions summary
- **Hourly Breakdown**: Find the best hour to stargaze tonight
- **Weekly Forecast**: Plan ahead with 7-day outlook
- **Moon Impact**: See how the moon phase affects visibility

## 🌐 APIs Used

This project integrates with several free, public APIs:

- **[Open-Meteo](https://open-meteo.com/)**: Weather data and forecasts (no API key required)
- **[Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api)**: City search functionality
- **[OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)**: Reverse geocoding for location names
- **[Open Notify ISS Location API](http://open-notify.org/Open-Notify-API/ISS-Pass-Times/)**: ISS pass predictions
- **Browser Geolocation API**: User's current location (requires permission)

All APIs are free to use and require no authentication.

## 🎯 Scoring Algorithm

The stargazing score is calculated using multiple weighted factors:

```javascript
Score = 100 - (cloudPenalty + humidityPenalty + precipPenalty + windPenalty + moonPenalty)
```

**Factors:**
- **Cloud Cover** (40% weight): 0-20% clouds = excellent | 20-50% = good | 50-80% = fair | >80% = poor
- **Humidity** (15% weight): <60% = excellent | 60-75% = good | 75-85% = fair | >85% = poor
- **Precipitation** (25% weight): 0mm = excellent | Any rain = poor
- **Wind Speed** (10% weight): <15 km/h = excellent | 15-30 = good | 30-45 = fair | >45 = poor
- **Moon Illumination** (10% weight): <25% = excellent | 25-50% = good | 50-75% = fair | >75% = poor

## 🌙 Astronomical Calculations

- **Moon Phase**: Synodic month calculation (29.53 days) from known New Moon reference
- **Moon Illumination**: Percentage of visible lunar surface illuminated
- **Planet Positions**: Simplified orbital mechanics for Mercury, Venus, Mars, Jupiter, Saturn
- **Light Pollution**: Bortle Scale estimation based on population density
- **Twilight Times**: Astronomical twilight calculated from solar angle

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Follow the existing modular structure
2. Keep components focused and single-purpose
3. Write pure functions in utilities
4. Use consistent styling patterns
5. Test on multiple screen sizes

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Moon phase images sourced from public domain NASA imagery
- Weather data provided by Open-Meteo
- ISS tracking data from Open Notify
- Inspired by the beauty of the night sky ✨

## 🐛 Known Issues

- Planet position calculations are simplified and may have ±5° accuracy
- Light pollution estimates are approximate based on population data
- ISS pass times require clear northern/southern horizon views

## 🔮 Future Enhancements

- [ ] Meteor shower predictions
- [ ] Deep sky object visibility (Messier catalog)
- [ ] Cloud movement animations
- [ ] Save favorite locations
- [ ] Weather alerts for clearing skies
- [ ] Mobile app version
- [ ] Dark mode toggle
- [ ] Historical weather data analysis

---

**Made with ❤️ for stargazers everywhere**

*Clear skies and dark nights!* 🌠
