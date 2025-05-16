import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { LullabySettings, MusicFile } from "shared/types";
import axios from 'axios';
import MusicPlayer from './MusicPlayer';

const LullabyControls = () => {
  const [settings, setSettings] = useState<LullabySettings>({
    duration: 30,
    volume: 50,
    fadeOut: true,
    selectedMusic: '',
  });
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMusicFile, setSelectedMusicFile] = useState<MusicFile | null>(null);

  useEffect(() => {
    const fetchMusicFiles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/lullaby/music');
        setMusicFiles(response.data.files);
        if (response.data.files.length > 0) {
          setSelectedMusicFile(response.data.files[0]);
          setSettings(prev => ({ ...prev, selectedMusic: response.data.files[0].id }));
        }
      } catch (error) {
        console.error('Error fetching music files:', error);
      }
    };

    fetchMusicFiles();
  }, []);

  const handleStartLullaby = async () => {
    try {
      await axios.post('http://localhost:3001/api/lullaby/start', settings);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error starting lullaby:', error);
    }
  };

  const handleStopLullaby = async () => {
    try {
      await axios.post('http://localhost:3001/api/lullaby/stop');
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping lullaby:', error);
    }
  };

  const handleMusicChange = (musicId: string) => {
    const musicFile = musicFiles.find(file => file.id === musicId);
    if (musicFile) {
      setSelectedMusicFile(musicFile);
      setSettings(prev => ({ ...prev, selectedMusic: musicId }));
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        flex: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Lullaby Mode
      </Typography>

      {selectedMusicFile && (
        <MusicPlayer
          musicFile={selectedMusicFile}
          volume={settings.volume}
          onVolumeChange={(volume) => setSettings(prev => ({ ...prev, volume }))}
          isPlaying={isPlaying}
          onPlayPause={isPlaying ? handleStopLullaby : handleStartLullaby}
        />
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Music</InputLabel>
        <Select
          value={settings.selectedMusic}
          onChange={(e) => handleMusicChange(e.target.value)}
        >
          {musicFiles.map((file) => (
            <MenuItem key={file.id} value={file.id}>
              {file.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography gutterBottom>Duration (minutes)</Typography>
      <Slider
        value={settings.duration}
        onChange={(_, value) =>
          setSettings({ ...settings, duration: value as number })
        }
        min={5}
        max={120}
        step={5}
        marks
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={settings.fadeOut}
            onChange={(e) =>
              setSettings({ ...settings, fadeOut: e.target.checked })
            }
          />
        }
        label="Fade Out"
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color={isPlaying ? 'error' : 'primary'}
        onClick={isPlaying ? handleStopLullaby : handleStartLullaby}
        fullWidth
      >
        {isPlaying ? 'Stop Lullaby' : 'Start Lullaby'}
      </Button>
    </Box>
  );
};

export default LullabyControls; 