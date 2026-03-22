import { Socket } from 'socket.io';
import prisma from '../../config/database';
import logger from '../../config/logger';

export const handleReactToMessage = async (socket: Socket, data: { messageId: string; emoji: string }) => {
  const user = (socket as any).data.user;
  try {
    const existing = await prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId: data.messageId,
          userId: user.id,
          emoji: data.emoji,
        },
      },
    });
    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.reaction.create({
        data: {
          messageId: data.messageId,
          userId: user.id,
          emoji: data.emoji,
        },
      });
    }
    // Получаем все реакции для этого сообщения
    const reactions = await prisma.reaction.findMany({
      where: { messageId: data.messageId },
    });
    const message = await prisma.message.findUnique({
      where: { id: data.messageId },
      select: { chatId: true },
    });
    if (message) {
      socket.to(message.chatId).emit('reaction_updated', { messageId: data.messageId, reactions });
      socket.emit('reaction_updated', { messageId: data.messageId, reactions });
    }
  } catch (err) {
    logger.error('Reaction error:', err);
  }
};
