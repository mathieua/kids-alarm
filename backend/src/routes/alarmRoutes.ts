import express, { RequestHandler } from 'express';
import fs from 'fs/promises';
import path from 'path';
import type { Alarm } from 'shared/types';

const router = express.Router();
const configPath = path.join(__dirname, '../../../config/alarms.json');

// Get all alarms
router.get('/', (async (req, res) => {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const alarms = JSON.parse(data);
    res.json(alarms);
  } catch (error) {
    console.error('Error reading alarms:', error);
    res.status(500).json({ error: 'Failed to read alarms' });
  }
}) as RequestHandler);

// Get a specific alarm
router.get('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(configPath, 'utf-8');
    const alarms = JSON.parse(data);
    const alarm = alarms.alarms.find((a: Alarm) => a.id === id);

    if (!alarm) {
      return res.status(404).json({ error: 'Alarm not found' });
    }

    res.json(alarm);
  } catch (error) {
    console.error('Error reading alarm:', error);
    res.status(500).json({ error: 'Failed to read alarm' });
  }
}) as RequestHandler);

// Create a new alarm
router.post('/', (async (req, res) => {
  try {
    const newAlarm = req.body;
    const data = await fs.readFile(configPath, 'utf-8');
    const alarms = JSON.parse(data);

    newAlarm.id = Date.now().toString();
    alarms.alarms.push(newAlarm);

    await fs.writeFile(configPath, JSON.stringify(alarms, null, 2));
    res.status(201).json(newAlarm);
  } catch (error) {
    console.error('Error creating alarm:', error);
    res.status(500).json({ error: 'Failed to create alarm' });
  }
}) as RequestHandler);

// Update an alarm
router.patch('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const data = await fs.readFile(configPath, 'utf-8');
    const alarms = JSON.parse(data);
    const alarmIndex = alarms.alarms.findIndex((a: Alarm) => a.id === id);

    if (alarmIndex === -1) {
      return res.status(404).json({ error: 'Alarm not found' });
    }

    alarms.alarms[alarmIndex] = {
      ...alarms.alarms[alarmIndex],
      ...updates,
    };

    await fs.writeFile(configPath, JSON.stringify(alarms, null, 2));
    res.json(alarms.alarms[alarmIndex]);
  } catch (error) {
    console.error('Error updating alarm:', error);
    res.status(500).json({ error: 'Failed to update alarm' });
  }
}) as RequestHandler);

// Delete an alarm
router.delete('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(configPath, 'utf-8');
    const alarms = JSON.parse(data);
    const alarmIndex = alarms.alarms.findIndex((a: Alarm) => a.id === id);

    if (alarmIndex === -1) {
      return res.status(404).json({ error: 'Alarm not found' });
    }

    alarms.alarms.splice(alarmIndex, 1);
    await fs.writeFile(configPath, JSON.stringify(alarms, null, 2));
    res.json({ message: 'Alarm deleted' });
  } catch (error) {
    console.error('Error deleting alarm:', error);
    res.status(500).json({ error: 'Failed to delete alarm' });
  }
}) as RequestHandler);

export default router; 