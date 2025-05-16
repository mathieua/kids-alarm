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

// Serve static files from the media directory
app.use('/media', express.static(path.join(__dirname, '../../media')));

// API routes
app.use('/api/alarms', alarmRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/lullaby', lullabyRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/audio', audioRoutes);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 