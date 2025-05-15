import express from 'express';
import alarmRoutes from './alarmRoutes';
import themeRoutes from './themeRoutes';
import dateRoutes from './dateRoutes';
import weatherRoutes from './weatherRoutes';
import lullabyRoutes from './lullabyRoutes';

const router = express.Router();

router.use('/alarms', alarmRoutes);
router.use('/themes', themeRoutes);
router.use('/dates', dateRoutes);
router.use('/weather', weatherRoutes);
router.use('/lullaby', lullabyRoutes);

export default router; 