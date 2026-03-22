import React from 'react';
import styles from './Avatar.module.scss';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'medium', className }) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className={`${styles.avatar} ${styles[size]} ${className || ''}`}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
