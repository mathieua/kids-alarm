import express, { RequestHandler } from 'express';
import fs from 'fs/promises';
import path from 'path';
import type { LullabySettings, MusicFile } from 'shared/types';

const router = express.Router();
const mediaPath = path.join(__dirname, '../../../media');

let currentSettings: LullabySettings | null = null;
let lullabyTimeout: NodeJS.Timeout | null = null;

// Get available music files
router.get('/music', (async (req, res) => {
  try {
    const files = await fs.readdir(mediaPath);
    const musicFiles: MusicFile[] = await Promise.all(
      files
        .filter(file => file.endsWith('.mp3'))
        .map(async (file) => {
          const stats = await fs.stat(path.join(mediaPath, file));
          return {
            id: file,
            title: file.replace('.mp3', ''),
            path: file,
            duration: 0, // We'll get this from the frontend
          };
        })
    );
    res.json({ files: musicFiles });
  } catch (error) {
    console.error('Error reading music files:', error);
    res.status(500).json({ error: 'Failed to read music files' });
  }
}) as RequestHandler);

// Start lullaby mode
router.post('/start', (async (req, res) => {
  try {
    const settings: LullabySettings = req.body;
    
    // Clear any existing timeout
    if (lullabyTimeout) {
      clearTimeout(lullabyTimeout);
    }

    // Set new timeout
    lullabyTimeout = setTimeout(() => {
      lullabyTimeout = null;
      currentSettings = null;
    }, settings.duration * 60 * 1000); // Convert minutes to milliseconds

    currentSettings = settings;
    res.json({ message: 'Lullaby mode started', settings });
  } catch (error) {
    console.error('Error starting lullaby:', error);
    res.status(500).json({ error: 'Failed to start lullaby' });
  }
}) as RequestHandler);

// Stop lullaby mode
router.post('/stop', (async (req, res) => {
  try {
    if (lullabyTimeout) {
      clearTimeout(lullabyTimeout);
      lullabyTimeout = null;
      currentSettings = null;
    }
    res.json({ message: 'Lullaby mode stopped' });
  } catch (error) {
    console.error('Error stopping lullaby:', error);
    res.status(500).json({ error: 'Failed to stop lullaby' });
  }
}) as RequestHandler);

// Get lullaby status
router.get('/status', (async (req, res) => {
  try {
    res.json({
      isPlaying: lullabyTimeout !== null,
      settings: currentSettings
    });
  } catch (error) {
    console.error('Error getting lullaby status:', error);
    res.status(500).json({ error: 'Failed to get lullaby status' });
  }
}) as RequestHandler);

export default router; 