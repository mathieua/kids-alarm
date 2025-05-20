import { useState, useRef } from "react";
import {
    FluentProvider,
    makeStyles,
    webDarkTheme,
} from "@fluentui/react-components";
import Clock from "./components/clock/Clock";
import MusicPlayer from "./components/music-player/MusicPlayer";

function App() {
    const styles = useStyles();
    const [screen, setScreen] = useState(0); // 0 = Clock, 1 = MusicPlayer
    const touchStartX = useRef<number | null>(null);

    // Simple touch event handlers
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        if (deltaX < -50 && screen === 0) setScreen(1); // swipe left
        if (deltaX > 50 && screen === 1) setScreen(0); // swipe right
        touchStartX.current = null;
    };

    // Use the default webLightTheme as our base
    // In a more complete implementation, we would create a custom theme
    // that incorporates all the colors from currentTheme
    const theme = webDarkTheme;

    return (
        <FluentProvider
            className={styles.appContainer}
            theme={theme}
        >
            <div
                className={styles.container}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <div
                    className={styles.slider}
                    style={{ transform: `translateX(-${screen * 100}vw)` }}
                >
                    <div className={styles.screen}>
                        <Clock />
                    </div>
                    <div className={styles.screen}>
                        <MusicPlayer playlistId="1" />
                    </div>
                </div>
            </div>
        </FluentProvider>
    );
}

const useStyles = makeStyles({
    appContainer: {
        width: "200vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--colorNeutralBackground1)",
        position: "relative",
        // transform: "translateX(-100vw)",
    },
    container: {
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        touchAction: "pan-y",
    },
    slider: {
        display: "flex",
        width: "200vw",
        height: "100%",
        transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
    },
    screen: {
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
    },
});

export default App;
