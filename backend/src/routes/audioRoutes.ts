import { Router, RequestHandler } from 'express';
import audioService from '../services/audioService';

const router = Router();

// Play audio
router.post('/play', async (req, res) => {
  try {
    const { filePath, volume } = req.body;
    const result = await audioService.play(filePath, volume);
    res.json(result);
  } catch (error) {
    console.error('Error in play route:', error);
    res.status(500).json({ error: 'Failed to play audio' });
  }
});

// Pause audio
router.post('/pause', async (req, res) => {
  try {
    const result = await audioService.pause();
    res.json(result);
  } catch (error) {
    console.error('Error in pause route:', error);
    res.status(500).json({ error: 'Failed to pause audio' });
  }
});

// Resume audio
router.post('/resume', async (req, res) => {
  try {
    const result = await audioService.resume();
    res.json(result);
  } catch (error) {
    console.error('Error in resume route:', error);
    res.status(500).json({ error: 'Failed to resume audio' });
  }
});

// Stop audio
router.post('/stop', async (req, res) => {
  try {
    const result = await audioService.stop();
    res.json(result);
  } catch (error) {
    console.error('Error in stop route:', error);
    res.status(500).json({ error: 'Failed to stop audio' });
  }
});

// Set volume
router.post('/volume', async (req, res) => {
  try {
    const { volume } = req.body;
    const result = await audioService.setVolume(volume);
    res.json(result);
  } catch (error) {
    console.error('Error in volume route:', error);
    res.status(500).json({ error: 'Failed to set volume' });
  }
});

// Get status
router.get('/status', (req, res) => {
  try {
    const status = audioService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error in status route:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Seek audio
router.post('/seek', (async (req, res) => {
  try {
    const { position } = req.body;
    if (typeof position !== 'number' || isNaN(position) || position < 0) {
      return res.status(400).json({ error: 'Invalid position' });
    }
    const result = await audioService.seek(position);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to seek' });
  }
}) as RequestHandler);

export default router; 