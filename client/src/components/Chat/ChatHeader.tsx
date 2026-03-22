import React from 'react';
import Avatar from '../Common/Avatar';
import styles from './ChatHeader.module.scss';

interface ChatHeaderProps {
  title: string;
  avatar?: string;
  isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, avatar, isOnline }) => {
  return (
    <div className={styles.header}>
      <Avatar src={avatar} name={title} size="medium" />
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        {isOnline !== undefined && (
          <div className={styles.status}>{isOnline ? 'Online' : 'Offline'}</div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
