import { useState } from "react";
import {
    FluentProvider,
    webLightTheme,
    makeStyles,
    webDarkTheme,
} from "@fluentui/react-components";
import type { Alarm, Theme as ThemeType } from "shared/types";

// Import components (to be created)
import AlarmDisplay from "./components/AlarmDisplay";
import WeatherWidget from "./components/WeatherWidget";
import ImportantDates from "./components/ImportantDates";
import LullabyControls from "./components/LullabyControls";
import ThemeSelector from "./components/ThemeSelector";
import AudioPlayer from "./components/AudioPlayer";
import Clock from "./components/clock/Clock";

function App() {
    const styles = useStyles();
    // const [currentTheme, setCurrentTheme] = useState<ThemeType>({
    //     id: "default",
    //     name: "Default",
    //     primaryColor: "#4A90E2",
    //     secondaryColor: "#50E3C2",
    //     backgroundColor: "#FFFFFF",
    //     textColor: "#333333",
    // });

    // Use the default webLightTheme as our base
    // In a more complete implementation, we would create a custom theme
    // that incorporates all the colors from currentTheme
    const theme = webDarkTheme;

    return (
        <FluentProvider
            className={styles.appContainer}
            theme={theme}
        // style={
        //     {
        //         "--brand-color": currentTheme.primaryColor,
        //         "--background-color": currentTheme.backgroundColor,
        //         "--text-color": currentTheme.textColor,
        //     } as React.CSSProperties
        // }
        >
            <Clock weatherMin={13} weatherMax={21} alarmTime="07:30" />
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
    },
});

export default App;
