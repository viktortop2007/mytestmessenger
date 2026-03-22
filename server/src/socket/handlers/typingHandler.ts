import { Socket } from 'socket.io';

export const handleTypingStart = (socket: Socket, data: { chatId: string }) => {
  const user = (socket as any).data.user;
  socket.to(data.chatId).emit('typing_start', { userId: user.id, chatId: data.chatId });
};

export const handleTypingEnd = (socket: Socket, data: { chatId: string }) => {
  const user = (socket as any).data.user;
  socket.to(data.chatId).emit('typing_end', { userId: user.id, chatId: data.chatId });
};
