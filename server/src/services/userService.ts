import prisma from '../config/database';
import bcrypt from 'bcryptjs';

export const createUser = async (data: {
  phoneNumber: string;
  username: string;
  firstName: string;
  lastName?: string;
  password: string;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
};

export const findByPhoneNumber = async (phoneNumber: string) => {
  return prisma.user.findUnique({ where: { phoneNumber } });
};

export const findById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUser = async (id: string, data: Partial<{
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  settings: any;
}>) => {
  return prisma.user.update({ where: { id }, data });
};

export const searchUsers = async (query: string, excludeUserId?: string) => {
  return prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { phoneNumber: { contains: query } },
      ],
      NOT: { id: excludeUserId },
    },
    take: 20,
  });
};

export const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isOnline, lastSeen: new Date() },
  });
};
