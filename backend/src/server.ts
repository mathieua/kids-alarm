import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import alarmRoutes from './routes/alarmRoutes';
import dateRoutes from './routes/dateRoutes';
import lullabyRoutes from './routes/lullabyRoutes';
import themeRoutes from './routes/themeRoutes';
import weatherRoutes from './routes/weatherRoutes';
import audioRoutes from './routes/audioRoutes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/alarms', alarmRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/lullaby', lullabyRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/audio', audioRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
}); 