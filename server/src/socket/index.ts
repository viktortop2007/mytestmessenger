import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { pubClient, subClient } from '../config/redis';
import logger from '../config/logger';
import { jwtConfig } from '../config/jwt';
import { updateOnlineStatus } from '../services/userService';
import {
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleForwardMessage,
} from './handlers/messageHandler';
import { handleTypingStart, handleTypingEnd } from './handlers/typingHandler';
import { handleReadMessages } from './handlers/readHandler';
import { handleReactToMessage } from './handlers/reactionHandler';

const RedisAdapter = require('socket.io-redis');

export const initSocket = (httpServer: Server) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
    adapter: RedisAdapter({ pubClient, subClient }),
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, jwtConfig.accessSecret) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) return next(new Error('User not found'));
      socket.data.user = user;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.data.user;
    logger.info(`User ${user.id} connected`);

    await updateOnlineStatus(user.id, true);

    const userChats = await prisma.chatParticipant.findMany({
      where: { userId: user.id, leftAt: null },
      select: { chatId: true },
    });
    userChats.forEach(({ chatId }) => socket.join(chatId));

    socket.broadcast.emit('user_status', { userId: user.id, isOnline: true });

    socket.on('send_message', (data) => handleSendMessage(socket, data));
    socket.on('edit_message', (data) => handleEditMessage(socket, data));
    socket.on('delete_message', (data) => handleDeleteMessage(socket, data));
    socket.on('forward_message', (data) => handleForwardMessage(socket, data));
    socket.on('react_to_message', (data) => handleReactToMessage(socket, data));
    socket.on('typing_start', (data) => handleTypingStart(socket, data));
    socket.on('typing_end', (data) => handleTypingEnd(socket, data));
    socket.on('read_messages', (data) => handleReadMessages(socket, data));

    socket.on('disconnect', async () => {
      logger.info(`User ${user.id} disconnected`);
      await updateOnlineStatus(user.id, false);
      socket.broadcast.emit('user_status', { userId: user.id, isOnline: false });
    });
  });

  return io;
};
