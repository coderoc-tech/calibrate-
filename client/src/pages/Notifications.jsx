import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import { FaBell, FaCheckCircle, FaTrash, FaExclamationTriangle, FaUndo, FaBan } from 'react-icons/fa';
import { generateOverdueNotifications } from '../utils/notificationHelper';

const Notifications = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [overdueNotifications, setOverdueNotifications] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch stored notifications
                const notifRes = await axios.get('/notifications', {
                    headers: { 'auth-token': token }
                });
                setNotifications(notifRes.data);

                // Fetch equipment to generate overdue notifications
                const equipRes = await axios.get('/equipment', {
                    headers: { 'auth-token': token }
                });
                setEquipment(equipRes.data);

                // Generate overdue notifications in real-time
                const overdue = generateOverdueNotifications(equipRes.data);
                setOverdueNotifications(overdue);

            } catch (err) {
                console.error('Error fetching notifications', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/notifications/${id}/read`, {}, {
                headers: { 'auth-token': token }
            });
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
        } catch (err) {
            console.error('Error marking notification as read', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/notifications/${id}`, {
                headers: { 'auth-token': token }
            });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            console.error('Error deleting notification', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('/notifications/read-all', {}, {
                headers: { 'auth-token': token }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Error marking all as read', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'overdue':
                return <FaExclamationTriangle style={{ color: '#ef4444' }} />;
            case 'return':
                return <FaUndo style={{ color: '#10b981' }} />;
            case 'discontinued':
                return <FaBan style={{ color: '#f59e0b' }} />;
            default:
                return <FaBell />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'overdue':
                return 'rgba(239, 68, 68, 0.1)';
            case 'return':
                return 'rgba(16, 185, 129, 0.1)';
            case 'discontinued':
                return 'rgba(245, 158, 11, 0.1)';
            default:
                return 'var(--bg-card)';
        }
    };

    if (loading || !user) return null;

    const unreadCount = notifications.filter(n => !n.read).length;
    const allNotifications = [...overdueNotifications, ...notifications].sort((a, b) =>
        new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
    );

    return (
        <Layout>
            <div className="notifications-container">
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>
                            <FaBell style={{ marginRight: '0.5rem' }} />
                            Notifications
                            {unreadCount > 0 && (
                                <span style={{
                                    marginLeft: '1rem',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.9rem'
                                }}>
                                    {unreadCount} unread
                                </span>
                            )}
                        </h1>
                        <p className="text-muted">Stay updated on equipment status changes and calibration alerts.</p>
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} style={{ padding: '0.5rem 1rem' }}>
                            Mark All as Read
                        </button>
                    )}
                </div>

                {isLoadingData ? (
                    <p>Loading notifications...</p>
                ) : (
                    <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {allNotifications.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                backgroundColor: 'var(--bg-card)',
                                borderRadius: '1rem',
                                border: '1px solid var(--border)'
                            }}>
                                <FaBell style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                                <p className="text-muted">No notifications at this time.</p>
                            </div>
                        ) : (
                            allNotifications.map((notification, index) => (
                                <div
                                    key={notification._id || `overdue-${index}`}
                                    style={{
                                        backgroundColor: notification.read ? 'var(--bg-card)' : getNotificationColor(notification.type),
                                        border: `1px solid ${notification.read ? 'var(--border)' : 'transparent'}`,
                                        borderRadius: '0.75rem',
                                        padding: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        opacity: notification.read ? 0.7 : 1,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem' }}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: notification.read ? 'normal' : 'bold', marginBottom: '0.25rem' }}>
                                            {notification.message}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                            {new Date(notification.createdAt || notification.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {!notification.read && notification._id && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid var(--border)',
                                                    color: 'var(--text-main)',
                                                    cursor: 'pointer',
                                                    borderRadius: '0.5rem'
                                                }}
                                                title="Mark as read"
                                            >
                                                <FaCheckCircle />
                                            </button>
                                        )}
                                        {notification._id && (
                                            <button
                                                onClick={() => handleDelete(notification._id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid var(--border)',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    borderRadius: '0.5rem'
                                                }}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                        {notification.equipmentId && (
                                            <button
                                                onClick={() => navigate(`/edit-equipment/${notification.equipmentId}`)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                View Equipment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Notifications;
