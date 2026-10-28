import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import listingRoutes from './routes/listingRoutes';
import requestRoutes from './routes/requestRoutes';
import adminRoutes from './routes/adminRoutes';
import statsRoutes from './routes/statsRoutes';
import { errorHandler } from './middlewares/errorHandler';

export const app = express();

// Middlewares
app.use(cors({
  origin: true, // Allow frontend origin in dev & prod
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FoodBridge API',
    version: '1.0.0',
    hackathonProblemId: 'HACK-P197',
  });
});

// Food Safety Disclaimer Endpoint
app.get('/api/v1/food-safety', (req, res) => {
  res.status(200).json({
    title: 'FoodBridge Food Safety Disclaimer & Standards',
    disclaimer: 'FoodBridge is a technology-enabled redistribution coordination platform. FoodBridge DOES NOT inspect, test, certify, or guarantee the physical condition, temperature history, bacteriological safety, or suitability for consumption of any donated food.',
    responsibilities: {
      donor: 'Donors must ensure that donated food was prepared under sanitary conditions, stored at safe temperatures (cold foods <= 4°C, hot foods >= 63°C), and accurately described.',
      recipient: 'Recipients must inspect donations at pickup, maintain safe transport temperatures, and consume or serve food within recommended use-by guidance.',
    },
    version: '1.0',
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/stats', statsRoutes);

// 404 Route Catch-All
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);
