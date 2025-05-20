import {
    makeStyles,
    Text,
    tokens,
} from "@fluentui/react-components";
import { ClockAlarmRegular, WeatherSunnyFilled } from "@fluentui/react-icons";
import { useState } from "react";
import { useEffect } from "react";

type ClockProps = {
    weatherMin: number;
    weatherMax: number;
    alarmTime: string;
};

const Clock = ({ weatherMin, weatherMax, alarmTime }: ClockProps) => {
    const classes = useStyles();

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
                <WeatherSunnyFilled className={classes.weatherIcon} />
                <Text className={classes.weatherText}>
                    {weatherMin}°/ {weatherMax}°
                </Text>
            </div>

            {/* Alarm */}
            <div className={classes.alarmBox}>
                <div className={classes.alarmIcon}>
                    <ClockAlarmRegular />
                </div>
                <Text className={classes.alarmLabel}><Text className={classes.alarmTime}>{alarmTime}</Text></Text>

            </div>
        </div>
        <div className={classes.timeAndDate}>
            {/* Time */}
            <Text className={classes.timeText}>{timeStr}</Text>

            {/* Date */}
            <Text className={classes.dateText}>{dateStr}</Text>
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
        gap: "12px"
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
});
