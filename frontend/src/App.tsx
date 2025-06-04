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
    const handleOpenMusicPlayer = () => setScreen(1);
    const handleCloseMusicPlayer = () => setScreen(0);

    // Use the default webLightTheme as our base
    // In a more complete implementation, we would create a custom theme
    // that incorporates all the colors from currentTheme
    const theme = webDarkTheme;

    return (
        <FluentProvider
            className={styles.appContainer}
            theme={theme}
        >
            <div className={styles.container}>
                {screen === 0 ? (
                    <div className={styles.screen}>
                        <Clock onOpenMusicPlayer={handleOpenMusicPlayer} />
                    </div>
                ) : (
                    <div className={styles.screen}>
                        <MusicPlayer playlistId="1" onClose={handleCloseMusicPlayer} />
                    </div>
                )}
            </div>
        </FluentProvider>
    );
}

const useStyles = makeStyles({
    appContainer: {
        width: "100vw",
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
    screen: {
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
    },
});

export default App;
