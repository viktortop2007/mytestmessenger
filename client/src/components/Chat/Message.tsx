import React from 'react';
import Avatar from '../Common/Avatar';
import styles from './Message.module.scss';

interface MessageProps {
  id: string;
  text: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: string;
  isOwn: boolean;
}

const Message: React.FC<MessageProps> = ({
  text,
  senderName,
  senderAvatar,
  createdAt,
  isOwn,
}) => {
  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`${styles.message} ${isOwn ? styles.own : styles.other}`}>
      {!isOwn && <Avatar src={senderAvatar} name={senderName} size="small" />}
      <div className={styles.bubble}>
        {!isOwn && <div className={styles.sender}>{senderName}</div>}
        <div className={styles.text}>{text}</div>
        <div className={styles.time}>{time}</div>
      </div>
    </div>
  );
};

export default Message;
