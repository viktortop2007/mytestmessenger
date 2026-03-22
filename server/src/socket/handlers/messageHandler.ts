import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { createMessage, editMessage, deleteMessageForAll, deleteMessageForMe, forwardMessage } from '../../services/messageService';
import { canUserSendMessage } from '../../services/chatService';
import logger from '../../config/logger';
import { sendPushNotification } from '../../services/notificationService';
import prisma from '../../config/database';

export const handleSendMessage = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  data: any
) => {
  const user = (socket as any).data.user;
  const { chatId, text, replyToId, attachments } = data;

  try {
    const canSend = await canUserSendMessage(chatId, user.id);
    if (!canSend) {
      socket.emit('error', { code: 'FORBIDDEN', message: 'Cannot send message in this chat' });
      return;
    }

    const message = await createMessage({
      chatId,
      senderId: user.id,
      text,
      replyToId,
      attachments,
    });

    // Отправляем всем участникам чата
    socket.to(chatId).emit('new_message', message);
    socket.emit('new_message', message); // отправителю тоже

    // Push-уведомления для офлайн-пользователей
    const participants = await prisma.chatParticipant.findMany({
      where: { chatId, userId: { not: user.id } },
      include: { user: true },
    });
    for (const p of participants) {
      await sendPushNotification(p.userId, {
        title: 'New message',
        body: message.text?.substring(0, 100) || 'New message',
        data: { chatId, messageId: message.id },
      });
    }
  } catch (err) {
    logger.error('Send message error:', err);
    socket.emit('error', { code: 'INTERNAL', message: 'Failed to send message' });
  }
};

export const handleEditMessage = async (socket: Socket, data: any) => {
  const user = (socket as any).data.user;
  const { messageId, text } = data;
  try {
    const updated = await editMessage(messageId, user.id, text);
    const chatId = updated.chatId;
    socket.to(chatId).emit('message_edited', { messageId, text, editedAt: updated.editedAt });
    socket.emit('message_edited', { messageId, text, editedAt: updated.editedAt });
  } catch (err: any) {
    socket.emit('error', { code: 'FORBIDDEN', message: err.message });
  }
};

export const handleDeleteMessage = async (socket: Socket, data: any) => {
  const user = (socket as any).data.user;
  const { messageId, forAll } = data;
  try {
    let chatId: string;
    if (forAll) {
      const deleted = await deleteMessageForAll(messageId, user.id);
      chatId = deleted.chatId;
      socket.to(chatId).emit('message_deleted', { messageId, deletedForAll: true });
      socket.emit('message_deleted', { messageId, deletedForAll: true });
    } else {
      const deleted = await deleteMessageForMe(messageId, user.id);
      chatId = deleted.chatId;
      socket.emit('message_deleted', { messageId, deletedForAll: false });
    }
  } catch (err: any) {
    socket.emit('error', { code: 'FORBIDDEN', message: err.message });
  }
};

export const handleForwardMessage = async (socket: Socket, data: any) => {
  const user = (socket as any).data.user;
  const { messageId, targetChatId } = data;
  try {
    const message = await forwardMessage(messageId, targetChatId, user.id);
    socket.to(targetChatId).emit('new_message', message);
    socket.emit('new_message', message);
  } catch (err: any) {
    socket.emit('error', { code: 'INTERNAL', message: err.message });
  }
};
