import React from 'react';
import Avatar from '../Common/Avatar';
import styles from './ChatItem.module.scss';

interface ChatItemProps {
  id: string;
  title: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  selected?: boolean;
  onClick: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  title,
  avatar,
  lastMessage,
  timestamp,
  unread = 0,
  selected,
  onClick,
}) => {
  return (
    <div className={`${styles.chatItem} ${selected ? styles.selected : ''}`} onClick={onClick}>
      <Avatar src={avatar} name={title} size="medium" />
      <div className={styles.info}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {timestamp && <span className={styles.timestamp}>{timestamp}</span>}
        </div>
        <div className={styles.footer}>
          <span className={styles.lastMessage}>{lastMessage || 'No messages yet'}</span>
          {unread > 0 && <span className={styles.unread}>{unread}</span>}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
