import {
    makeStyles,
    Text,
    Button,
    tokens,
    Slider,
    type SliderOnChangeData,
    mergeClasses,
    Divider,
} from "@fluentui/react-components";
import {
    PlayCircleRegular,
    PauseCircleRegular,
    PreviousRegular,
    NextRegular,
    Speaker0Regular,
} from "@fluentui/react-icons";
import { useState, useEffect, useCallback } from "react";
import { playlists } from "../../data/playlists";
import type { Song } from "../../types/audio";

type AudioStatus = {
    isPlaying: boolean;
    volume: number;
    currentFilePath: string | null;
    progress: number;
    duration: number;
};

type MusicPlayerProps = {
    playlistId: string;
    onClose: () => void;
};

const MusicPlayer = ({ playlistId, onClose }: MusicPlayerProps) => {
    const classes = useStyles();
    const [status, setStatus] = useState<AudioStatus>({
        isPlaying: false,
        volume: 80,
        currentFilePath: null,
        progress: 0,
        duration: 0,
    });
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [seekValue, setSeekValue] = useState<number | null>(null);
    const [now, setNow] = useState(new Date());

    const playlist = playlists.find(p => p.id === playlistId);
    const songs = playlist?.songs || [];

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 1000);
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, []);

    const fetchStatus = useCallback(async () => {
        if (isDragging) return;
        try {
            const response = await fetch("http://localhost:3001/api/audio/status");
            if (!response.ok) {
                throw new Error(`Failed to fetch status: ${response.statusText}`);
            }
            const data = await response.json();
            console.log("Status update:", data);
            setStatus(data);
        } catch (error) {
            console.error("Error fetching audio status:", error);
        }
    }, [isDragging]);

    const handlePlay = async (song: Song) => {
        try {
            console.log("Starting playback for song:", song.title);

            // Stop any current playback first
            try {
                await fetch("http://localhost:3001/api/audio/stop", {
                    method: "POST",
                });
            } catch (error) {
                console.warn("Error stopping current playback:", error);
            }

            // Play the new song
            console.log("Sending play request for:", song.filePath);
            const response = await fetch("http://localhost:3001/api/audio/play", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    filePath: song.filePath,
                    volume: status.volume,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to play audio: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const responseData = await response.json();
            console.log("Play response:", responseData);

            // Update the current song first
            setCurrentSong(song);

            // Reset seek state and set isPlaying true
            setIsDragging(false);
            setSeekValue(null);
            setStatus(prev => ({
                ...prev,
                isPlaying: true,
                currentFilePath: song.filePath
            }));

            // Force a status check after a short delay
            setTimeout(async () => {
                await fetchStatus();
            }, 100);

        } catch (error) {
            console.error("Error playing audio:", error);
            // Reset the status on error
            setStatus(prev => ({
                ...prev,
                isPlaying: false,
                currentFilePath: null
            }));
        }
    };

    const handlePause = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/audio/pause", {
                method: "POST",
            });
            const responseData = await response.json();
            setStatus(responseData.status);
            // Force a status check
            await fetchStatus();
        } catch (error) {
            console.error("Error pausing audio:", error);
        }
    };

    const handleResume = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/audio/resume", {
                method: "POST",
            });
            const responseData = await response.json();
            setStatus(responseData.status);
            // Force a status check
            await fetchStatus();
        } catch (error) {
            console.error("Error resuming audio:", error);
        }
    };

    const handleVolumeChange = async (_: any, data: SliderOnChangeData) => {
        try {
            const response = await fetch("http://localhost:3001/api/audio/volume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ volume: data.value }),
            });
            const responseData = await response.json();
            setStatus(responseData.status);
        } catch (error) {
            console.error("Error setting volume:", error);
        }
    };

    const handleSeekChange = (_: any, data: SliderOnChangeData) => {
        setIsDragging(true);
        setSeekValue(data.value);
    };

    const handleSeekRelease = async (event: React.PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (isDragging && seekValue !== null) {
            setIsDragging(false);
            try {
                const response = await fetch("http://localhost:3001/api/audio/seek", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ position: seekValue }),
                });
                const responseData = await response.json();
                if (responseData.status) {
                    setStatus(responseData.status);
                }
                // Always fetch status after seek to update UI
                await fetchStatus();
            } catch (error) {
                console.error("Error seeking audio:", error);
                fetchStatus();
            } finally {
                setSeekValue(null);
            }
        }
    };

    const handlePrevious = async () => {
        if (!currentSong) return;
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        if (currentIndex > 0) {
            const previousSong = songs[currentIndex - 1];
            await handlePlay(previousSong);
        }
    };

    const handleNext = async () => {
        if (!currentSong) return;
        const currentIndex = songs.findIndex(song => song.id === currentSong.id);
        if (currentIndex < songs.length - 1) {
            const nextSong = songs[currentIndex + 1];
            await handlePlay(nextSong);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    // Prevent swipe/scroll on slider interaction
    const preventTouchScroll = (event: React.PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
    };

    if (!playlist) {
        return <Text>Playlist not found</Text>;
    }

    return (
        <div className={classes.container}>
            {/* Top bar with current time and close button */}
            {/* <div className={classes.topBar}>
                <Text className={classes.currentTime}>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}</Text>
                <Button
                    icon={<DismissRegular />}
                    appearance="subtle"
                    onClick={onClose}
                    className={classes.closeButton}
                    aria-label="Close"
                />
            </div> */}
            {/* Left side - Playlist */}
            <div className={classes.playlistSection}>
                <Text className={classes.currentTime} onClick={onClose}>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}</Text>
                <Divider />
                <Text className={classes.playlistTitle} >{playlist.name}</Text>
                <div className={classes.songList}>
                    {songs.map((song) => (
                        <div
                            key={song.id}
                            className={`${classes.songItem} ${currentSong?.id === song.id ? classes.activeSong : ""
                                }`}
                            onClick={() => handlePlay(song)}
                        >
                            <img
                                src={`http://localhost:3001/media/${encodeURIComponent(
                                    song.thumbnail.split("/").pop() || ""
                                )}`}
                                alt={song.title}
                                className={classes.songThumbnail}
                            />
                            <div className={classes.songInfo}>
                                <Text className={classes.songTitle}>{song.title}</Text>
                                <Text className={classes.songArtist}>{song.artist}</Text>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side - Now Playing */}
            <div className={classes.nowPlayingSection}>
                {currentSong ? (
                    <>
                        <img
                            src={`http://localhost:3001/media/${encodeURIComponent(
                                currentSong.thumbnail.split("/").pop() || ""
                            )}`}
                            alt={currentSong.title}
                            className={classes.currentThumbnail}
                        />
                        <Text className={classes.currentTitle}>{currentSong.title}</Text>
                        <Text className={classes.currentArtist}>{currentSong.artist}</Text>

                        {/* Progress bar */}
                        <div className={classes.progressContainer}>
                            <Slider
                                className={classes.noTouchAction}
                                value={isDragging ? seekValue || 0 : status.progress || 0}
                                max={status.duration || 0}
                                onChange={handleSeekChange}
                                onPointerUp={handleSeekRelease}
                                onPointerDown={preventTouchScroll}
                                onPointerMove={preventTouchScroll}
                                disabled={!currentSong}
                            />
                            <div className={classes.timeDisplay}>
                                <Text size={200}>
                                    {formatTime(
                                        isDragging ? seekValue || 0 : status.progress || 0
                                    )}
                                </Text>
                                <Text size={200}>{formatTime(status.duration || 0)}</Text>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className={classes.controls}>
                            <Button
                                appearance="transparent"
                                icon={<PreviousRegular />}
                                onClick={handlePrevious}
                                className={classes.controlButton}
                            />
                            <Button
                                appearance="transparent"
                                icon={
                                    status.isPlaying ? (
                                        <PauseCircleRegular />
                                    ) : (
                                        <PlayCircleRegular />
                                    )
                                }
                                onClick={status.isPlaying ? handlePause : handleResume}
                                className={classes.controlButton}
                            />
                            <Button
                                appearance="transparent"
                                icon={<NextRegular />}
                                onClick={handleNext}
                                className={classes.controlButton}
                            />
                        </div>

                        {/* Volume Control */}
                        <div className={classes.volumeControl}>
                            <Speaker0Regular className={classes.volumeIcon} />
                            <Slider
                                className={mergeClasses(classes.volumeSlider, classes.noTouchAction)}
                                value={status.volume}
                                onChange={handleVolumeChange}
                                min={0}
                                max={100}
                                onPointerDown={preventTouchScroll}
                                onPointerMove={preventTouchScroll}
                            />
                        </div>
                    </>
                ) : (
                    <div className={classes.ghostUI}>
                        <div className={classes.ghostThumbnail} />
                        <div className={classes.ghostTitle} />
                        <div className={classes.ghostArtist} />
                        <div className={classes.ghostProgress} />
                        <div className={classes.ghostControls}>
                            <div className={classes.ghostButton} />
                            <div className={classes.ghostButton} />
                            <div className={classes.ghostButton} />
                        </div>
                        <div className={classes.ghostVolume}>
                            <div className={classes.ghostVolumeIcon} />
                            <div className={classes.ghostVolumeSlider} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MusicPlayer;

const useStyles = makeStyles({
    container: {
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "32px",
        gap: "32px",
    },
    playlistSection: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    playlistTitle: {
        fontSize: "32px",
        fontWeight: "bold",
    },
    songList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    songItem: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        ":hover": {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },
    activeSong: {
        backgroundColor: tokens.colorNeutralBackground3,
    },
    songThumbnail: {
        width: "48px",
        height: "48px",
        borderRadius: "4px",
        objectFit: "cover",
    },
    songInfo: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    songTitle: {
        fontSize: "16px",
        fontWeight: "bold",
    },
    songArtist: {
        fontSize: "14px",
        color: tokens.colorNeutralForeground3,
    },
    nowPlayingSection: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
    },
    currentThumbnail: {
        width: "300px",
        height: "300px",
        borderRadius: "8px",
        objectFit: "cover",
    },
    currentTitle: {
        fontSize: "32px",
        fontWeight: "bold",
        textAlign: "center",
    },
    currentArtist: {
        fontSize: "24px",
        color: tokens.colorNeutralForeground3,
        textAlign: "center",
    },
    progressContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    timeDisplay: {
        display: "flex",
        justifyContent: "space-between",
        color: tokens.colorNeutralForeground3,
    },
    controls: {
        display: "flex",
        gap: "24px",
        alignItems: "center",
    },
    controlButton: {
        fontSize: "48px",
        padding: "8px",
        ":hover": {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },
    volumeControl: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        maxWidth: "300px",
    },
    volumeIcon: {
        fontSize: "24px",
        color: tokens.colorNeutralForeground3,
    },
    volumeSlider: {
        flex: 1,
    },
    ghostUI: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        width: "100%",
    },
    ghostThumbnail: {
        width: "300px",
        height: "300px",
        borderRadius: "8px",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    ghostTitle: {
        width: "200px",
        height: "32px",
        borderRadius: "4px",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    ghostArtist: {
        width: "150px",
        height: "24px",
        borderRadius: "4px",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    ghostProgress: {
        width: "100%",
        height: "4px",
        borderRadius: "2px",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    ghostControls: {
        display: "flex",
        gap: "24px",
        alignItems: "center",
    },
    ghostButton: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    ghostVolume: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        maxWidth: "300px",
    },
    ghostVolumeIcon: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    ghostVolumeSlider: {
        flex: 1,
        height: "4px",
        borderRadius: "2px",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    noTouchAction: {
        touchAction: 'none',
    },
    topBar: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
    },
    currentTime: {
        fontSize: "32px",
        fontWeight: "bold",
    },
    closeButton: {
        fontSize: "32px",
        minWidth: "48px",
        minHeight: "48px",
        alignSelf: "flex-end",
    },
}); 