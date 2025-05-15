import { useState } from 'react';
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

const LullabyControls = () => {
  const [settings, setSettings] = useState<LullabySettings>({
    duration: 30,
    volume: 50,
    fadeOut: true,
    selectedMusic: '',
  });
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

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

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Music</InputLabel>
        <Select
          value={settings.selectedMusic}
          onChange={(e) =>
            setSettings({ ...settings, selectedMusic: e.target.value })
          }
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

      <Typography gutterBottom>Volume</Typography>
      <Slider
        value={settings.volume}
        onChange={(_, value) =>
          setSettings({ ...settings, volume: value as number })
        }
        min={0}
        max={100}
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