import express, { RequestHandler } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { Theme } from 'shared/types';

const router = express.Router();
const configPath = path.join(__dirname, '../../../config/themes.json');

// Get all themes
router.get('/', (async (req, res) => {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const themes = JSON.parse(data);
    res.json(themes);
  } catch (error) {
    console.error('Error reading themes:', error);
    res.status(500).json({ error: 'Failed to read themes' });
  }
}) as RequestHandler);

// Get a specific theme
router.get('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(configPath, 'utf-8');
    const themes = JSON.parse(data);
    const theme = themes.themes.find((t: Theme) => t.id === id);

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    res.json(theme);
  } catch (error) {
    console.error('Error reading theme:', error);
    res.status(500).json({ error: 'Failed to read theme' });
  }
}) as RequestHandler);

// Create a new theme
router.post('/', (async (req, res) => {
  try {
    const newTheme = req.body;
    const data = await fs.readFile(configPath, 'utf-8');
    const themes = JSON.parse(data);

    newTheme.id = Date.now().toString();
    themes.themes.push(newTheme);

    await fs.writeFile(configPath, JSON.stringify(themes, null, 2));
    res.status(201).json(newTheme);
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
}) as RequestHandler);

// Update a theme
router.patch('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const data = await fs.readFile(configPath, 'utf-8');
    const themes = JSON.parse(data);
    const themeIndex = themes.themes.findIndex((t: Theme) => t.id === id);

    if (themeIndex === -1) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    themes.themes[themeIndex] = {
      ...themes.themes[themeIndex],
      ...updates,
    };

    await fs.writeFile(configPath, JSON.stringify(themes, null, 2));
    res.json(themes.themes[themeIndex]);
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
}) as RequestHandler);

export default router; 