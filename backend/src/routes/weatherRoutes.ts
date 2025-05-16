import { Router } from 'express';
import { WeatherService } from '../services/weatherService';

const router = Router();
const weatherService = WeatherService.getInstance();

router.get('/', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    
    const weatherData = await weatherService.getWeather(lat, lon);
    res.json(weatherData);
  } catch (error) {
    console.error('Error in weather route:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

export default router; 