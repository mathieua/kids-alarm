import { makeStyles } from "@fluentui/react-components";

type BackgroundProps = {};

export const Background = ({ }: BackgroundProps) => {
    const classes = useStyles();

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
        return (
            <svg
                width={size}
                height={size * 0.6}
                className={classes.cloudElement}
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

    return (
        <div className={classes.background}>
            {/* Clouds */}
            {cloud(120, 40, 30, 0.5)}
            {cloud(80, 300, 60, 0.4)}
            {cloud(100, 600, 40, 0.6)}
            {cloud(60, 900, 100, 0.3)}
            {cloud(90, 1000, 250, 0.5)}

            {/* Bird */}
            <div className={classes.birdBox}>{birdIcon}</div>
        </div>
    );
};

const useStyles = makeStyles({
    background: {},

    cloudElement: {
        position: "absolute",
    },
    birdBox: {
        position: "absolute",
        right: "120px",
        top: "40px",
    },
});
