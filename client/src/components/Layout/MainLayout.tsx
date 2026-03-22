import React, { useState } from 'react';
import ChatList from '../Chat/ChatList';
import ChatWindow from '../Chat/ChatWindow';

const MainLayout: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  // Заглушка для списка чатов
  const chats = [
    { id: '1', title: 'Alice' },
    { id: '2', title: 'Bob' },
  ];

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <ChatList chats={chats} onSelect={setSelectedChatId} />
      </aside>
      <main className="content">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="no-chat-selected">Select a chat to start messaging</div>
        )}
      </main>
    </div>
  );
};

export default MainLayout;
