import express from 'express';
import axios from 'axios';
import { WeatherData } from '../../shared/types';

const router = express.Router();

// Get current weather
router.get('/', async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const city = process.env.DEFAULT_CITY || 'London';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const weatherData: WeatherData = {
      temperature: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      icon: response.data.weather[0].icon,
      location: response.data.name,
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

export default router; 