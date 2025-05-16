import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

export class WeatherService {
  private static instance: WeatherService;
  private lastFetch: number = 0;
  private cache: WeatherData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  public async getWeather(lat?: number, lon?: number): Promise<WeatherData> {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (this.cache && now - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not configured');
    }

    try {
      // If coordinates are provided, use them, otherwise default to Paris
      const query = lat && lon 
        ? `lat=${lat}&lon=${lon}`
        : 'q=Paris';

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );

      const data = response.data;
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        city: data.name,
      };

      // Update cache
      this.cache = weatherData;
      this.lastFetch = now;

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
} 