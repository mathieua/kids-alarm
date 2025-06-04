import {
    makeStyles,
    Spinner,
    Text,
    Button,
} from "@fluentui/react-components";
import { ClockAlarmRegular, PlayCircleRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

interface WeatherData {
    temperature: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    city: string;
    dailyIcon?: string;
    minTemp?: number;
    maxTemp?: number;
}

type ClockProps = {
    onOpenMusicPlayer: () => void;
};

const Clock = ({ onOpenMusicPlayer }: ClockProps) => {
    const classes = useStyles();

    const [now, setNow] = useState(new Date());
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

        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <Spinner />
        );
    }

    if (error) {
        console.error(error);
        return (
            <></>
        );
    }

    if (!weather) {
        return null;
    }


    const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    const dateStr = now.toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
    });


    return <div className={classes.clock}>

        <div className={classes.topRow}>
            {/* Weather */}
            <div className={classes.weatherBox}>
                {/* <WeatherSunnyFilled className={classes.weatherIcon} /> */}
                <img
                    src={`http://openweathermap.org/img/wn/${weather.dailyIcon || weather.icon}@2x.png`}
                    alt={weather.description}
                    style={{ width: 48, height: 48 }}
                />
                <Text className={classes.weatherText}>
                    {weather.minTemp}°/ {weather.maxTemp}°
                </Text>
            </div>

            {/* Alarm */}
            <div className={classes.alarmBox}>
                <div className={classes.alarmIcon}>
                    <ClockAlarmRegular />
                </div>
                <Text className={classes.alarmLabel}><Text className={classes.alarmTime}>
                    {/* {alarmTime} */}
                </Text></Text>

            </div>
        </div>
        <div className={classes.timeAndDate}>
            {/* Time */}
            <Text className={classes.timeText}>{timeStr}</Text>

            {/* Date */}
            <Text className={classes.dateText}>{dateStr}</Text>

        </div>

        <div className={classes.bottomRow}>
            <Button
                icon={<PlayCircleRegular className={classes.playIcon} />}
                onClick={onOpenMusicPlayer}
                className={classes.playButton}
                appearance="transparent"
            />
        </div>

    </div>;
};

export default Clock;

const useStyles = makeStyles({
    clock: {
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "48px"
    },

    topRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },

    timeText: {
        fontSize: "128px",
        lineHeight: "1",
    },

    weatherBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
    },
    weatherText: {
        fontSize: "24px"
    },
    weatherIcon: {
        fontSize: "48px"
    },
    alarmBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // gap: "12px"
    },

    timeAndDate: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: "20px",
        flexDirection: "column"
    },
    alarmLabel: {
        fontSize: "24px"

    },
    alarmIcon: {
        fontSize: "48px"
    },
    alarmTime: {
        fontSize: "24px"

    },
    dateText: {
        fontSize: "48px",
    },
    playButton: {
        height: "48px",
        width: "48px",
        minWidth: "48px",
        "& > span": {
            height: "48px",
            width: "48px",
            fontSize: "48px"
        },
    },

    bottomRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
    },
    playIcon: {
        fontSize: "48px"
    }
});
