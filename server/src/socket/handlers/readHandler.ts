import { Socket } from 'socket.io';
import prisma from '../../config/database';
import logger from '../../config/logger';

export const handleReadMessages = async (socket: Socket, data: { chatId: string; upToMessageId: string }) => {
  const user = (socket as any).data.user;
  try {
    await prisma.chatParticipant.update({
      where: { userId_chatId: { userId: user.id, chatId: data.chatId } },
      data: { lastReadMessageId: data.upToMessageId },
    });
    // Уведомляем участников, что пользователь прочитал сообщения
    socket.to(data.chatId).emit('read_receipt', {
      userId: user.id,
      chatId: data.chatId,
      upToMessageId: data.upToMessageId,
    });
  } catch (err) {
    logger.error('Read receipt error:', err);
  }
};
