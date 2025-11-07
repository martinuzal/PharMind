import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePage } from '../../contexts/PageContext';
import { useNavigate } from 'react-router-dom';
import './Toolbar.css';

const Toolbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, removeNotification } = useNotifications();
  const {
    pageTitle,
    pageIcon,
    pageColor,
    toolbarContent,
    toolbarCenterContent,
    toolbarRightContent,
    showFiltersButton,
    activeFiltersCount,
    onFiltersClick
  } = usePage();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleRemoveNotification = (id: string) => {
    removeNotification(id);
  };

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.length;

  return (
    <div className="app-toolbar">
      <div className="toolbar-left">
        {toolbarContent}
      </div>

      <div className="toolbar-center">
        {toolbarCenterContent}
      </div>

      <div className="toolbar-right">
        {toolbarRightContent}
        {/* Filtros */}
        {showFiltersButton && (
          <button
            className={`toolbar-icon-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
            onClick={onFiltersClick}
            title="Filtros"
          >
            <span className="material-icons">filter_list</span>
            {activeFiltersCount > 0 && (
              <span className="notification-badge">{activeFiltersCount}</span>
            )}
          </button>
        )}
        {/* Notificaciones */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            className={`toolbar-icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={toggleNotifications}
            title="Notificaciones"
          >
            <span className="material-icons">notifications</span>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <h3>Notificaciones</h3>
                <span className="notification-count">{unreadCount}</span>
              </div>
              <div className="notification-panel-content">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <span className="material-icons">notifications_none</span>
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item notification-${notification.type}`}
                    >
                      <div className="notification-item-icon">
                        <span className="material-icons">
                          {notification.type === 'success' && 'check_circle'}
                          {notification.type === 'error' && 'error'}
                          {notification.type === 'warning' && 'warning'}
                          {notification.type === 'info' && 'info'}
                        </span>
                      </div>
                      <div className="notification-item-content">
                        <div className="notification-item-title">{notification.title}</div>
                        <div className="notification-item-message">{notification.message}</div>
                      </div>
                      <button
                        className="notification-item-close"
                        onClick={() => handleRemoveNotification(notification.id)}
                        title="Cerrar"
                      >
                        <span className="material-icons">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ayuda */}
        <button className="toolbar-icon-btn" title="Ayuda">
          <span className="material-icons">help_outline</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
