const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Store active user sockets: userId -> [socketId]
const userSockets = new Map();

// JWT Secret (should match auth middleware)
const JWT_SECRET = process.env.JWT_SECRET || 'skillera-local-dev-secret-change-in-production';

const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: '*', // Allow all origins for now (dev)
            methods: ['GET', 'POST'],
        },
    });

    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join a room for the user's own ID (for direct notifications)
        socket.join(socket.userId);

        // Join a room for a specific match/conversation
        socket.on('join_room', (matchId) => {
            socket.join(matchId);
            console.log(`User ${socket.userId} joined room: ${matchId}`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

module.exports = initializeSocket;
