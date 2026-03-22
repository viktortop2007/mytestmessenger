import prisma from '../config/database';
import { Message } from '@prisma/client';

export const createMessage = async (data: {
  chatId: string;
  senderId: string;
  text?: string;
  replyToId?: string;
  forwardedFromId?: string;
  attachments?: string[]; // ids of attachments
}) => {
  return prisma.message.create({
    data: {
      chatId: data.chatId,
      senderId: data.senderId,
      text: data.text,
      replyToId: data.replyToId,
      forwardedFromId: data.forwardedFromId,
      attachments: data.attachments
        ? { connect: data.attachments.map(id => ({ id })) }
        : undefined,
    },
    include: {
      sender: true,
      attachments: true,
      replyTo: true,
    },
  });
};

export const editMessage = async (messageId: string, userId: string, newText: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message || message.senderId !== userId) throw new Error('Not allowed');
  return prisma.message.update({
    where: { id: messageId },
    data: { text: newText, editedAt: new Date() },
  });
};

export const deleteMessageForAll = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error('Message not found');
  // Проверка прав: только автор или администратор чата
  const chat = await prisma.chat.findUnique({
    where: { id: message.chatId },
    include: { participants: { where: { userId } } },
  });
  const participant = chat?.participants[0];
  const isAuthor = message.senderId === userId;
  const isAdmin = participant?.role === 'ADMIN' || participant?.role === 'CREATOR';
  if (!isAuthor && !isAdmin) throw new Error('Not allowed');
  return prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });
};

export const deleteMessageForMe = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error('Message not found');
  const deletedForUserIds = (message.deletedForUserIds as string[]) || [];
  if (!deletedForUserIds.includes(userId)) {
    deletedForUserIds.push(userId);
  }
  return prisma.message.update({
    where: { id: messageId },
    data: { deletedForUserIds },
  });
};

export const getChatMessages = async (chatId: string, userId: string, limit: number = 50, offset: number = 0) => {
  // Проверяем, что пользователь в чате
  const participant = await prisma.chatParticipant.findUnique({
    where: { userId_chatId: { userId, chatId } },
  });
  if (!participant || participant.leftAt) throw new Error('Not in chat');

  const messages = await prisma.message.findMany({
    where: {
      chatId,
      deletedAt: null,
      // не показываем сообщения, удалённые для этого пользователя
      NOT: { deletedForUserIds: { array_contains: userId } },
    },
    include: {
      sender: true,
      attachments: true,
      replyTo: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
  return messages.reverse();
};

export const forwardMessage = async (messageId: string, targetChatId: string, userId: string) => {
  const original = await prisma.message.findUnique({
    where: { id: messageId },
    include: { attachments: true },
  });
  if (!original) throw new Error('Original message not found');

  return prisma.message.create({
    data: {
      chatId: targetChatId,
      senderId: userId,
      text: original.text,
      forwardedFromId: messageId,
      attachments: original.attachments
        ? { connect: original.attachments.map(a => ({ id: a.id })) }
        : undefined,
    },
    include: { sender: true, attachments: true },
  });
};

export const searchMessages = async (chatId: string, query: string, userId: string) => {
  return prisma.message.findMany({
    where: {
      chatId,
      text: { contains: query, mode: 'insensitive' },
      deletedAt: null,
      NOT: { deletedForUserIds: { array_contains: userId } },
    },
    include: { sender: true, attachments: true },
    take: 50,
  });
};
