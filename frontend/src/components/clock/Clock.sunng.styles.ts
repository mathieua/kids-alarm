import { tokens, makeStyles } from "@fluentui/react-components";

export const useClockStyles = makeStyles({
    clockContainer: {
        position: "relative",
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #7ecbfa 0%, #b3e0ff 100%)",
        overflow: "hidden",
        borderRadius: "8px",
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
