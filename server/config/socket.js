const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join group room
        socket.on('join-group', (groupId) => {
            socket.join(`group-${groupId}`);
            console.log(`User ${socket.id} joined group-${groupId}`);
        });

        // Leave group room
        socket.on('leave-group', (groupId) => {
            socket.leave(`group-${groupId}`);
            console.log(`User ${socket.id} left group-${groupId}`);
        });

        // Join user room for private notifications
        socket.on('join-user', (userId) => {
            socket.join(userId);
            console.log(`User ${socket.id} joined user room ${userId}`);
        });

        // Handle new message
        socket.on('send-message', (data) => {
            io.to(`group-${data.groupId}`).emit('new-message', data);
        });

        // Handle task updates
        socket.on('task-update', (data) => {
            io.to(`group-${data.groupId}`).emit('task-updated', data);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIO };
