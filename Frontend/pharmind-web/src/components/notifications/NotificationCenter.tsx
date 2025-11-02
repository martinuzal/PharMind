import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { notifications } = useNotifications();

  return (
    <div className="notification-center">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification-toast notification-${notification.type}`}
        >
          <div className="notification-icon">
            <span className="material-icons">
              {notification.type === 'success' && 'check_circle'}
              {notification.type === 'error' && 'error'}
              {notification.type === 'warning' && 'warning'}
              {notification.type === 'info' && 'info'}
            </span>
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
