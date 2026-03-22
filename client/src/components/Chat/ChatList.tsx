import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Chat {
  id: string;
  title?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  avatarColor?: string;
  unread?: number;
}

interface ChatListProps {
  chats: Chat[];
  onSelect: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelect }) => {
  const getInitials = (title: string) => {
    return title.slice(0, 2).toUpperCase();
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="chat-list">
      {chats.map(chat => (
        <div key={chat.id} className="chat-item" onClick={() => onSelect(chat.id)}>
          <div 
            className="chat-avatar" 
            style={{ backgroundColor: chat.avatarColor || '#3a3a3a' }}
          >
            {getInitials(chat.title || chat.id)}
          </div>
          <div className="chat-info">
            <div className="chat-title">{chat.title || 'Unknown'}</div>
            <div className="chat-last-message">{chat.lastMessage || 'No messages'}</div>
          </div>
          <div className="chat-time">{formatTime(chat.lastMessageTime)}</div>
          {chat.unread ? <div className="unread-badge">{chat.unread}</div> : null}
        </div>
      ))}
    </div>
  );
};

export default ChatList;
