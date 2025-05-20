import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";

interface WeatherData {
    temperature: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    city: string;
}

const WeatherWidget = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = async (lat?: number, lon?: number) => {
        try {
            setLoading(true);
            setError(null);
            const params = lat && lon ? `?lat=${lat}&lon=${lon}` : "";
            const response = await axios.get(
                `http://localhost:3001/api/weather${params}`
            );
            setWeather(response.data);
        } catch (error) {
            console.error("Error fetching weather:", error);
            setError("Failed to fetch weather data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchWeather(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        // Fallback to default location (Paris)
                        fetchWeather();
                    }
                );
            } else {
                console.log("Geolocation is not supported by this browser.");
                // Fallback to default location (Paris)
                fetchWeather();
            }
        };

        getLocation();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!weather) {
        return null;
    }

    return (
        <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
                {weather.city}
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                }}
            >
                <img
                    src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    style={{ width: 50, height: 50 }}
                />
                <Typography variant="h4">{weather.temperature}°C</Typography>
            </Box>
            <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                {weather.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Humidity: {weather.humidity}% | Wind: {weather.windSpeed} km/h
            </Typography>
        </Box>
    );
};

export default WeatherWidget;
