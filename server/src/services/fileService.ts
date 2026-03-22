import prisma from '../config/database';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const saveAttachment = async (file: Express.Multer.File, messageId: string) => {
  const fileUrl = `/uploads/${file.filename}`;
  let thumbUrl: string | undefined;

  // Генерируем миниатюру для изображений
  if (file.mimetype.startsWith('image/')) {
    const thumbFilename = `thumb_${file.filename}`;
    const thumbPath = path.join(path.dirname(file.path), thumbFilename);
    await sharp(file.path)
      .resize(200, 200, { fit: 'inside' })
      .toFile(thumbPath);
    thumbUrl = `/uploads/${thumbFilename}`;
  }

  return prisma.attachment.create({
    data: {
      messageId,
      fileUrl,
      fileType: file.mimetype.split('/')[0],
      fileName: file.originalname,
      fileSize: file.size,
      width: undefined,
      height: undefined,
      thumbUrl,
    },
  });
};
