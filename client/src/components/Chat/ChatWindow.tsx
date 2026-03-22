import React, { useEffect, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import api from '../../services/api';
import { useAppSelector } from '../../hooks/redux';

interface ChatWindowProps {
  chatId: string;
}

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

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTitle, setChatTitle] = useState('');
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    // Загрузка информации о чате
    const loadChatInfo = async () => {
      try {
        const response = await api.get(`/chats/${chatId}`);
        setChatTitle(response.data.title || response.data.name || 'Chat');
      } catch (error) {
        console.error('Failed to load chat info', error);
      }
    };
    // Загрузка сообщений чата
    const loadMessages = async () => {
      try {
        const response = await api.get(`/messages/${chatId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load messages', error);
      }
    };
    loadChatInfo();
    loadMessages();
  }, [chatId]);

  const handleSendMessage = async (text: string) => {
    try {
      const response = await api.post('/messages', { chatId, text });
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar">{chatTitle.slice(0, 2).toUpperCase()}</div>
        <div className="chat-header-info">
          <div className="chat-header-title">{chatTitle || 'Loading...'}</div>
          <div className="chat-header-status">online</div>
        </div>
      </div>
      <MessageList messages={messages} currentUserId={user?.id || ''} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
