import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import http from 'http';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Simple in-memory game state for multiplayer rooms
  const rooms: Record<string, any> = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (roomId, initialState) => {
      socket.join(roomId);
      if (!rooms[roomId]) {
        rooms[roomId] = {
          state: initialState,
          players: [socket.id]
        };
      } else {
        if (!rooms[roomId].players.includes(socket.id)) {
          rooms[roomId].players.push(socket.id);
        }
      }
      socket.emit('gameState', rooms[roomId].state);
      io.to(roomId).emit('playerCount', rooms[roomId].players.length);
    });

    socket.on('updateState', (roomId, newState) => {
      if (rooms[roomId]) {
        rooms[roomId].state = newState;
        socket.to(roomId).emit('gameState', newState);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      Object.keys(rooms).forEach(roomId => {
        const room = rooms[roomId];
        const index = room.players.indexOf(socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          io.to(roomId).emit('playerCount', room.players.length);
          if (room.players.length === 0) {
            delete rooms[roomId]; // Clean up empty rooms
          }
        }
      });
    });
  });

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
