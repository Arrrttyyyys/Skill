require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const sessionRoutes = require('./routes/sessions');
const messageRoutes = require('./routes/messages');
const feedbackRoutes = require('./routes/feedback');

const http = require('http');
const initializeSocket = require('./socket');

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

// Make io available in routes
app.set('io', io);

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Skillera API is running' });
});

server.listen(PORT, () => {
  console.log(`🚀 Skillera API server running on port ${PORT}`);
});

