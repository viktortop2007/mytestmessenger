import logger from '../config/logger';

// Заглушка для push-уведомлений
export const sendPushNotification = async (userId: string, payload: any) => {
  logger.debug(`Push notification would be sent to ${userId}: ${JSON.stringify(payload)}`);
};
