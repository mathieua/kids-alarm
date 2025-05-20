import { useState, useEffect, useCallback } from "react";
import {
    Button,
    Slider,
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import type { AudioStatus, Song, Playlist } from "../types/audio";
import { playlists } from "../data/playlists";

const AudioPlayer = () => {
    const [status, setStatus] = useState<AudioStatus>({
        isPlaying: false,
        volume: 80,
        currentFilePath: null,
        progress: 0,
        duration: 0,
    });
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
        null
    );
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [seeking, setSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Fetch current status on component mount and periodically
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    // Don't update progress while dragging
    useEffect(() => {
        if (isDragging) {
            const interval = setInterval(fetchStatus, 1000);
            return () => clearInterval(interval);
        }
    }, [isDragging]);

    const fetchStatus = useCallback(async () => {
        if (isDragging) return; // Don't update while dragging
        try {
            const response = await fetch(
                "http://localhost:3001/api/audio/status"
            );
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error("Error fetching audio status:", error);
        }
    }, [isDragging]);

    const handlePlay = async (song: Song) => {
        try {
            const response = await fetch(
                "http://localhost:3001/api/audio/play",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        filePath: song.filePath,
                        volume: status.volume,
                    }),
                }
            );
            const data = await response.json();
            setStatus(data.status);
            setCurrentSong(song);
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    };

    const handlePause = async () => {
        try {
            const response = await fetch(
                "http://localhost:3001/api/audio/pause",
                {
                    method: "POST",
                }
            );
            const data = await response.json();
            setStatus(data.status);
        } catch (error) {
            console.error("Error pausing audio:", error);
        }
    };

    const handleResume = async () => {
        try {
            const response = await fetch(
                "http://localhost:3001/api/audio/resume",
                {
                    method: "POST",
                }
            );
            const data = await response.json();
            setStatus(data.status);
        } catch (error) {
            console.error("Error resuming audio:", error);
        }
    };

    const handleStop = async () => {
        try {
            const response = await fetch(
                "http://localhost:3001/api/audio/stop",
                {
                    method: "POST",
                }
            );
            const data = await response.json();
            setStatus(data.status);
            setCurrentSong(null);
        } catch (error) {
            console.error("Error stopping audio:", error);
        }
    };

    const handleVolumeChange = async (
        _event: Event,
        newValue: number | number[]
    ) => {
        const volume = newValue as number;
        try {
            const response = await fetch(
                "http://localhost:3001/api/audio/volume",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ volume }),
                }
            );
            const data = await response.json();
            setStatus(data.status);
        } catch (error) {
            console.error("Error setting volume:", error);
        }
    };

    const handleSeekChange = (_event: any, value: number | number[]) => {
        setIsDragging(true);
        setSeekValue(value as number);
    };

    const handleSeekCommitted = async (
        _event: any,
        value: number | number[]
    ) => {
        const position = value as number;
        setIsDragging(false);
        setSeeking(true);

        try {
            const response = await fetch(
                "http://localhost:3001/api/audio/seek",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ position }),
                }
            );
            const data = await response.json();
            if (data.status) {
                setStatus(data.status);
            }
        } catch (error) {
            console.error("Error seeking audio:", error);
            fetchStatus();
        } finally {
            setSeeking(false);
            setSeekValue(null);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h5" gutterBottom>
                Audio Player
            </Typography>

            <Box sx={{ display: "flex", gap: 4 }}>
                {/* Playlist Selection */}
                <Box sx={{ width: 300 }}>
                    <Typography variant="h6" gutterBottom>
                        Playlists
                    </Typography>
                    <List>
                        {playlists.map((playlist) => (
                            <ListItem key={playlist.id} disablePadding>
                                <ListItemButton
                                    selected={
                                        selectedPlaylist?.id === playlist.id
                                    }
                                    onClick={() =>
                                        setSelectedPlaylist(playlist)
                                    }
                                >
                                    <ListItemText primary={playlist.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Song List */}
                <Box sx={{ flex: 1 }}>
                    {selectedPlaylist && (
                        <>
                            <Typography variant="h6" gutterBottom>
                                {selectedPlaylist.name}
                            </Typography>
                            <List>
                                {selectedPlaylist.songs.map((song) => (
                                    <ListItem key={song.id} disablePadding>
                                        <Card sx={{ width: "100%", mb: 1 }}>
                                            <Box sx={{ display: "flex" }}>
                                                <CardMedia
                                                    component="img"
                                                    sx={{
                                                        width: 100,
                                                        height: 100,
                                                    }}
                                                    image={`http://localhost:3001/media/${encodeURIComponent(song.thumbnail.split("/").pop() || "")}`}
                                                    alt={song.title}
                                                />
                                                <CardContent sx={{ flex: 1 }}>
                                                    <Typography variant="h6">
                                                        {song.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {song.artist}
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>
                                                        {status.isPlaying &&
                                                        currentSong?.id ===
                                                            song.id ? (
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={
                                                                    <PauseIcon />
                                                                }
                                                                onClick={
                                                                    handlePause
                                                                }
                                                                color="primary"
                                                            >
                                                                Pause
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={
                                                                    <PlayArrowIcon />
                                                                }
                                                                onClick={() =>
                                                                    handlePlay(
                                                                        song
                                                                    )
                                                                }
                                                                disabled={
                                                                    status.isPlaying &&
                                                                    currentSong?.id !==
                                                                        song.id
                                                                }
                                                            >
                                                                Play
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Box>
                                        </Card>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </Box>
            </Box>

            {/* Now Playing */}
            {currentSong && (
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Now Playing
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <CardMedia
                            component="img"
                            sx={{ width: 60, height: 60 }}
                            image={`http://localhost:3001/media/${encodeURIComponent(currentSong.thumbnail.split("/").pop() || "")}`}
                            alt={currentSong.title}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1">
                                {currentSong.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {currentSong.artist}
                            </Typography>
                            {/* Progress Bar */}
                            <Box sx={{ mt: 1 }}>
                                <Slider
                                    value={
                                        isDragging
                                            ? seekValue || 0
                                            : status.progress || 0
                                    }
                                    max={status.duration || 0}
                                    onChange={handleSeekChange}
                                    onChangeCommitted={handleSeekCommitted}
                                    aria-label="time"
                                    size="small"
                                    disabled={!currentSong}
                                />
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography variant="caption">
                                        {formatTime(
                                            isDragging
                                                ? seekValue || 0
                                                : status.progress || 0
                                        )}
                                    </Typography>
                                    <Typography variant="caption">
                                        {formatTime(status.duration || 0)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {status.isPlaying ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<PauseIcon />}
                                    onClick={handlePause}
                                >
                                    Pause
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={handleResume}
                                >
                                    Resume
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<StopIcon />}
                                onClick={handleStop}
                                disabled={!status.isPlaying}
                            >
                                Stop
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Volume Control */}
            <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <VolumeUpIcon />
                <Slider
                    value={status.volume}
                    onChange={handleVolumeChange}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    sx={{ flex: 1 }}
                />
            </Box>
        </Box>
    );
};

export default AudioPlayer;
