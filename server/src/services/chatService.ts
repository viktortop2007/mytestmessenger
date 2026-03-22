import prisma from '../config/database';
import { ChatType, ParticipantRole } from '@prisma/client';

export const createPrivateChat = async (userId1: string, userId2: string) => {
  // Проверяем, существует ли уже диалог
  const existing = await prisma.chat.findFirst({
    where: {
      type: ChatType.PRIVATE,
      participants: {
        every: {
          userId: { in: [userId1, userId2] },
        },
      },
    },
  });
  if (existing) return existing;

  // Создаём новый чат
  return prisma.chat.create({
    data: {
      type: ChatType.PRIVATE,
      createdById: userId1,
      participants: {
        create: [
          { userId: userId1, role: ParticipantRole.MEMBER },
          { userId: userId2, role: ParticipantRole.MEMBER },
        ],
      },
    },
    include: { participants: true },
  });
};

export const createGroupChat = async (
  creatorId: string,
  title: string,
  memberIds: string[]
) => {
  return prisma.chat.create({
    data: {
      type: ChatType.GROUP,
      title,
      createdById: creatorId,
      participants: {
        create: [
          { userId: creatorId, role: ParticipantRole.CREATOR },
          ...memberIds.map(id => ({ userId: id, role: ParticipantRole.MEMBER })),
        ],
      },
    },
    include: { participants: true },
  });
};

export const getUserChats = async (userId: string) => {
  return prisma.chat.findMany({
    where: {
      participants: {
        some: {
          userId,
          leftAt: null,
        },
      },
    },
    include: {
      participants: {
        include: { user: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const getChatById = async (chatId: string, userId?: string) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: {
        include: { user: true },
        where: userId ? { userId } : undefined,
      },
    },
  });
  if (userId && !chat?.participants.some(p => p.userId === userId)) {
    return null;
  }
  return chat;
};

export const addParticipant = async (chatId: string, userId: string, role: ParticipantRole = ParticipantRole.MEMBER) => {
  return prisma.chatParticipant.create({
    data: {
      chatId,
      userId,
      role,
    },
  });
};

export const removeParticipant = async (chatId: string, userId: string) => {
  return prisma.chatParticipant.update({
    where: { userId_chatId: { userId, chatId } },
    data: { leftAt: new Date() },
  });
};

export const updateParticipantRole = async (chatId: string, userId: string, role: ParticipantRole) => {
  return prisma.chatParticipant.update({
    where: { userId_chatId: { userId, chatId } },
    data: { role },
  });
};

export const isUserInChat = async (chatId: string, userId: string) => {
  const participant = await prisma.chatParticipant.findUnique({
    where: { userId_chatId: { userId, chatId } },
  });
  return participant !== null && participant.leftAt === null;
};

export const canUserSendMessage = async (chatId: string, userId: string) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { participants: { where: { userId } } },
  });
  if (!chat) return false;
  const participant = chat.participants[0];
  if (!participant || participant.leftAt) return false;
  if (chat.type === ChatType.CHANNEL) {
    return participant.role === ParticipantRole.ADMIN || participant.role === ParticipantRole.CREATOR;
  }
  return true;
};
