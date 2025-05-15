import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { ImportantDate } from '../../shared/types';

const router = express.Router();
const configPath = path.join(__dirname, '../../../config/dates.json');

// Get all important dates
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const dates = JSON.parse(data);
    res.json(dates);
  } catch (error) {
    console.error('Error reading dates:', error);
    res.status(500).json({ error: 'Failed to read dates' });
  }
});

// Create a new important date
router.post('/', async (req, res) => {
  try {
    const newDate = req.body;
    const data = await fs.readFile(configPath, 'utf-8');
    const dates = JSON.parse(data);

    newDate.id = Date.now().toString();
    dates.dates.push(newDate);

    await fs.writeFile(configPath, JSON.stringify(dates, null, 2));
    res.status(201).json(newDate);
  } catch (error) {
    console.error('Error creating date:', error);
    res.status(500).json({ error: 'Failed to create date' });
  }
});

// Update an important date
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const data = await fs.readFile(configPath, 'utf-8');
    const dates = JSON.parse(data);
    const dateIndex = dates.dates.findIndex((d: ImportantDate) => d.id === id);

    if (dateIndex === -1) {
      return res.status(404).json({ error: 'Date not found' });
    }

    dates.dates[dateIndex] = {
      ...dates.dates[dateIndex],
      ...updates,
    };

    await fs.writeFile(configPath, JSON.stringify(dates, null, 2));
    res.json(dates.dates[dateIndex]);
  } catch (error) {
    console.error('Error updating date:', error);
    res.status(500).json({ error: 'Failed to update date' });
  }
});

// Delete an important date
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(configPath, 'utf-8');
    const dates = JSON.parse(data);
    const dateIndex = dates.dates.findIndex((d: ImportantDate) => d.id === id);

    if (dateIndex === -1) {
      return res.status(404).json({ error: 'Date not found' });
    }

    dates.dates.splice(dateIndex, 1);
    await fs.writeFile(configPath, JSON.stringify(dates, null, 2));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting date:', error);
    res.status(500).json({ error: 'Failed to delete date' });
  }
});

export default router; 