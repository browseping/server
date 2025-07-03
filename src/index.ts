import express from 'express';
import cors from 'cors';
import { userRoutes, friendRoutes } from './routes';
import http from 'http';
import { initializeWebSocketServer } from './websocket/server';
import profileRoutes from './routes/profileRoutes';
import analyticsRoutes from './routes/analyticsRoutes';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


const server = http.createServer(app);

initializeWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});