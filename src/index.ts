import express from 'express';
import cors from 'cors';
import { userRoutes,
  friendRoutes,
  profileRoutes,
  analyticsRoutes,
  leaderboardRoutes,
  conversationRoutes,
  notificationRoutes,
  otpRoutes } from './routes';
import http from 'http';
import { initializeWebSocketServer } from './websocket/server';
import { startAnalyticsFlushWorker } from './workers/analyticsFlushWorker';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/otp', otpRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


const server = http.createServer(app);

initializeWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

startAnalyticsFlushWorker();