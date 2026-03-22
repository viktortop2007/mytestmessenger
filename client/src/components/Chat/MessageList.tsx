import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  senderId: string;
  sender: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm');
  };

  return (
    <div className="message-list">
      {messages.map(msg => {
        const isOwn = msg.senderId === currentUserId;
        return (
          <div key={msg.id} className={`message ${isOwn ? 'message-own' : 'message-other'}`}>
            {!isOwn && (
              <div className="message-sender">
                {msg.sender.firstName} {msg.sender.lastName}
              </div>
            )}
            <div className="message-bubble">
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{formatTime(msg.createdAt)}</div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
