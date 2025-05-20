import React, { useEffect, useState } from "react";
import {
    makeStyles,
    shorthands,
    Text,
    tokens,
    mergeClasses,
} from "@fluentui/react-components";

interface ClockProps {
    weatherMin: number;
    weatherMax: number;
    alarmTime: string;
}

const sunIcon = (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="10" fill="#FFD600" />
        <g stroke="#FFD600" strokeWidth="2">
            <line x1="24" y1="4" x2="24" y2="0" />
            <line x1="24" y1="44" x2="24" y2="48" />
            <line x1="4" y1="24" x2="0" y2="24" />
            <line x1="44" y1="24" x2="48" y2="24" />
            <line x1="38.14" y1="9.86" x2="41.31" y2="6.69" />
            <line x1="9.86" y1="38.14" x2="6.69" y2="41.31" />
            <line x1="38.14" y1="38.14" x2="41.31" y2="41.31" />
            <line x1="9.86" y1="9.86" x2="6.69" y2="6.69" />
        </g>
        <ellipse cx="34" cy="30" rx="10" ry="5" fill="#fff" opacity="0.8" />
    </svg>
);

const alarmIcon = (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle
            cx="20"
            cy="22"
            r="12"
            stroke="#234"
            strokeWidth="2.5"
            fill="none"
        />
        <rect x="17.5" y="12" width="5" height="10" rx="2.5" fill="#234" />
        <circle cx="20" cy="22" r="2" fill="#234" />
        <rect
            x="7"
            y="5"
            width="6"
            height="3"
            rx="1.5"
            fill="#234"
            transform="rotate(-30 7 5)"
        />
        <rect
            x="27"
            y="5"
            width="6"
            height="3"
            rx="1.5"
            fill="#234"
            transform="rotate(30 27 5)"
        />
    </svg>
);

const birdIcon = (
    <svg width="70" height="40" viewBox="0 0 70 40" fill="none">
        <ellipse cx="50" cy="20" rx="14" ry="10" fill="#FFD600" />
        <ellipse cx="38" cy="20" rx="8" ry="7" fill="#FFA726" />
        <circle cx="56" cy="18" r="2" fill="#234" />
        <polygon points="64,20 70,18 64,16" fill="#FFA726" />
        <rect
            x="32"
            y="27"
            width="10"
            height="3"
            rx="1.5"
            fill="#FFA726"
            transform="rotate(-20 32 27)"
        />
        <rect
            x="60"
            y="27"
            width="10"
            height="3"
            rx="1.5"
            fill="#FFA726"
            transform="rotate(20 60 27)"
        />
    </svg>
);

const cloud = (size: number, x: number, y: number, opacity = 1) => {
    const styles = useStyles();

    return (
        <svg
            width={size}
            height={size * 0.6}
            className={styles.cloudElement}
            style={{ left: x, top: y, opacity }}
            viewBox="0 0 100 60"
            fill="none"
        >
            <ellipse cx="30" cy="40" rx="30" ry="20" fill="#fff" />
            <ellipse cx="70" cy="30" rx="20" ry="15" fill="#fff" />
            <ellipse cx="60" cy="50" rx="15" ry="10" fill="#fff" />
        </svg>
    );
};

const Clock: React.FC<ClockProps> = ({ weatherMin, weatherMax, alarmTime }) => {
    const styles = useStyles();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const dateStr = now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    return (
        <div className={styles.clockContainer}>
            {/* Clouds */}
            {cloud(120, 40, 30, 0.5)}
            {cloud(80, 300, 60, 0.4)}
            {cloud(100, 600, 40, 0.6)}
            {cloud(60, 900, 100, 0.3)}
            {cloud(90, 1000, 250, 0.5)}

            {/* Bird */}
            <div className={styles.birdBox}>{birdIcon}</div>

            {/* Weather */}
            <div className={styles.weatherBox}>
                {sunIcon}
                <Text className={styles.weatherText}>
                    {weatherMin}°/ {weatherMax}°
                </Text>
            </div>

            {/* Alarm */}
            <div className={styles.alarmBox}>
                {alarmIcon}
                <Text className={styles.alarmLabel}>Alarm:</Text>
                <Text className={styles.alarmTime}>{alarmTime}</Text>
            </div>

            {/* Time */}
            <Text className={styles.timeText}>{timeStr}</Text>

            {/* Date */}
            <Text className={styles.dateText}>{dateStr}</Text>
        </div>
    );
};

export default Clock;

const useStyles = makeStyles({
    clockContainer: {
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #7ecbfa 0%, #b3e0ff 100%)",
        overflow: "hidden",
        ...shorthands.borderRadius("8px"),
        boxShadow: tokens.shadow16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    absoluteBox: {
        position: "absolute",
    },
    cloudElement: {
        position: "absolute",
    },
    birdBox: {
        position: "absolute",
        right: "120px",
        top: "40px",
    },
    weatherBox: {
        position: "absolute",
        left: "60px",
        top: "80px",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
    },
    weatherText: {
        color: "#234",
        fontWeight: "600",
        marginTop: "4px",
        fontSize: "20px",
    },
    alarmBox: {
        position: "absolute",
        right: "60px",
        top: "90px",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
    },
    alarmLabel: {
        color: "#234",
        fontWeight: "600",
        marginTop: "4px",
        fontSize: "16px",
    },
    alarmTime: {
        color: "#234",
        fontWeight: "600",
        fontSize: "20px",
    },
    timeText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: "clamp(4rem, 8vw, 7rem)",
        letterSpacing: "2px",
        textShadow: "0 2px 8px #2348",
    },
    dateText: {
        color: "#fff",
        fontWeight: "500",
        marginTop: "8px",
        fontSize: "clamp(1.5rem, 4vw, 2.125rem)",
        textShadow: "0 2px 8px #2346",
    },
});
