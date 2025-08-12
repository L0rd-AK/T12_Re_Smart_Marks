import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from './models/User';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: ["http://localhost:5173", "https://t12resmartmarks.vercel.app"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET!) as any;
      
      if (!decoded.id) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Verify user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user info to socket
      socket.data.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      };

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.id} (${socket.data.user.email})`);

    // Join user to their personal room
    socket.join(socket.data.user.id);

    // Join role-based rooms
    if (socket.data.user.role === 'module-leader') {
      socket.join('module-leaders');
    }
    if (socket.data.user.role === 'admin') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });

    // Handle custom events if needed
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${socket.data.user.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.data.user.id} left room: ${room}`);
    });
  });

  console.log('Socket.IO server initialized');
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

// Export io for use in other modules
export { io }; 