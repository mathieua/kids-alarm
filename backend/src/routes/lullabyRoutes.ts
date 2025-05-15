import express from 'express';
import { LullabySettings } from '../../shared/types';

const router = express.Router();

let currentLullaby: LullabySettings | null = null;
let lullabyTimeout: NodeJS.Timeout | null = null;

// Start lullaby mode
router.post('/start', async (req, res) => {
  try {
    const settings: LullabySettings = req.body;
    currentLullaby = settings;

    // Set timeout to stop lullaby after duration
    if (lullabyTimeout) {
      clearTimeout(lullabyTimeout);
    }

    lullabyTimeout = setTimeout(() => {
      currentLullaby = null;
      // Here you would implement the actual music stopping logic
    }, settings.duration * 60 * 1000);

    // Here you would implement the actual music playing logic
    res.json({ message: 'Lullaby started', settings });
  } catch (error) {
    console.error('Error starting lullaby:', error);
    res.status(500).json({ error: 'Failed to start lullaby' });
  }
});

// Stop lullaby mode
router.post('/stop', async (req, res) => {
  try {
    if (lullabyTimeout) {
      clearTimeout(lullabyTimeout);
      lullabyTimeout = null;
    }
    currentLullaby = null;

    // Here you would implement the actual music stopping logic
    res.json({ message: 'Lullaby stopped' });
  } catch (error) {
    console.error('Error stopping lullaby:', error);
    res.status(500).json({ error: 'Failed to stop lullaby' });
  }
});

// Get current lullaby status
router.get('/status', (req, res) => {
  res.json({
    isPlaying: currentLullaby !== null,
    currentSettings: currentLullaby,
  });
});

export default router; 