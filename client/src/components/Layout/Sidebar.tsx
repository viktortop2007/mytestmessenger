import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/authSlice';
import ChatList from '../Chat/ChatList';
import styles from './Sidebar.module.scss';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  // временно моковые чаты
  const chats = [
    { id: '1', title: 'John Doe', lastMessage: 'Hello', timestamp: '12:00', unread: 2 },
    { id: '2', title: 'Jane Smith', lastMessage: 'Hi there', timestamp: '11:30' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <span>{user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} className={styles.logout}>Logout</button>
        </div>
        <div className={styles.search}>
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <ChatList chats={chats} onSelect={() => {}} />
    </div>
  );
};

export default Sidebar;
