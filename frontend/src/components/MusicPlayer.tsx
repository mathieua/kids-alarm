import { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import type { MusicFile } from 'shared/types';

interface MusicPlayerProps {
  musicFile: MusicFile;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const MusicPlayer = ({
  musicFile,
  volume,
  onVolumeChange,
  isPlaying,
  onPlayPause,
}: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (audioRef.current && typeof newValue === 'number') {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <audio
        ref={audioRef}
        src={`/media/${musicFile.path}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => onPlayPause()}
      />
      
      <Stack spacing={2} direction="row" alignItems="center">
        <IconButton onClick={onPlayPause} color="primary">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" noWrap>
            {musicFile.title}
          </Typography>
          <Slider
            value={currentTime}
            max={duration}
            onChange={handleSliderChange}
            aria-label="time"
            size="small"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption">
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 200 }}>
          <IconButton onClick={toggleMute} color="primary">
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          <Slider
            value={volume}
            onChange={(_, value) => onVolumeChange(value as number)}
            aria-label="volume"
            size="small"
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default MusicPlayer; 