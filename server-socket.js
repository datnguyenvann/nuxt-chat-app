// Simple Socket.IO server for testing
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: ["http://localhost:3002", "http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3002", "http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Store active rooms and users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room
  socket.on('joinRoom', ({ roomId, userName }) => {
    console.log(`${userName || socket.id} joining room: ${roomId}`);
    
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = userName || `User_${socket.id.slice(0, 6)}`;
    
    // Add to rooms tracking
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add({
      id: socket.id,
      userName: socket.userName
    });

    // Notify others in room
    socket.to(roomId).emit('userJoined', {
      userName: socket.userName,
      roomId: roomId
    });

    console.log(`${socket.userName} joined room ${roomId}`);
  });

  // Send message
  socket.on('sendMessage', ({ roomId, messageData }) => {
    console.log(`Message in room ${roomId}:`, messageData);
    
    // Broadcast message to all users in room (including sender)
    io.to(roomId).emit('chatMessage', {
      id: messageData.id || Date.now().toString(),
      sender: messageData.sender,
      content: messageData.content,
      timestamp: messageData.timestamp || new Date().toISOString()
    });
  });

  // Leave room
  socket.on('leaveRoom', ({ roomId, userName }) => {
    console.log(`${userName || socket.id} leaving room: ${roomId}`);
    
    socket.leave(roomId);
    
    // Remove from rooms tracking
    if (rooms.has(roomId)) {
      const roomUsers = rooms.get(roomId);
      roomUsers.forEach(user => {
        if (user.id === socket.id) {
          roomUsers.delete(user);
        }
      });
      
      if (roomUsers.size === 0) {
        rooms.delete(roomId);
      }
    }

    // Notify others in room
    socket.to(roomId).emit('userLeft', {
      userName: userName || socket.userName,
      roomId: roomId
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    if (socket.roomId) {
      // Remove from rooms tracking
      if (rooms.has(socket.roomId)) {
        const roomUsers = rooms.get(socket.roomId);
        roomUsers.forEach(user => {
          if (user.id === socket.id) {
            roomUsers.delete(user);
          }
        });
        
        if (roomUsers.size === 0) {
          rooms.delete(socket.roomId);
        }
      }

      // Notify others in room
      socket.to(socket.roomId).emit('userLeft', {
        userName: socket.userName,
        roomId: socket.roomId
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:3002, http://localhost:3000, http://localhost:3001`);
});
