import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EquipmentList from '../components/EquipmentList';
import Layout from '../components/Layout';
import axios from '../api/axios';
import {
    FaCheckCircle, FaBoxOpen, FaIndustry, FaWrench,
    FaCalendarCheck, FaCalendarTimes, FaBan, FaCog,
    FaExclamationTriangle, FaClock, FaCalendarAlt, FaChartLine
} from 'react-icons/fa';

const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        active: 0,
        reserve: 0,
        inplant: 0,
        maintenance: 0,
        scheduled: 0,
        unscheduled: 0,
        discontinued: 0,
        inCalibration: 0,
        overDue: 0,
        due7: 0,
        due30: 0,
        due180: 0
    });

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/equipment', {
                    headers: { 'auth-token': token }
                });
                const equipment = res.data;
                const now = new Date();
                const day7 = new Date(); day7.setDate(now.getDate() + 7);
                const day30 = new Date(); day30.setDate(now.getDate() + 30);
                const day180 = new Date(); day180.setDate(now.getDate() + 180);

                setStats({
                    active: equipment.filter(e => e.status === 'Active').length,
                    reserve: equipment.filter(e => e.status === 'Reserve' || e.status === 'Inactive').length,
                    inplant: equipment.length,
                    maintenance: equipment.filter(e => e.status === 'Maintenance').length,

                    scheduled: equipment.filter(e => e.nextCalibrationDate && new Date(e.nextCalibrationDate) > now).length,
                    unscheduled: equipment.filter(e => !e.nextCalibrationDate).length,
                    discontinued: equipment.filter(e => e.status === 'Discontinued').length,
                    inCalibration: equipment.filter(e => e.status === 'Out for Calibration').length,

                    overDue: equipment.filter(e => e.nextCalibrationDate && new Date(e.nextCalibrationDate) < now).length,
                    due7: equipment.filter(e => {
                        if (!e.nextCalibrationDate) return false;
                        const d = new Date(e.nextCalibrationDate);
                        return d >= now && d <= day7;
                    }).length,
                    due30: equipment.filter(e => {
                        if (!e.nextCalibrationDate) return false;
                        const d = new Date(e.nextCalibrationDate);
                        return d >= now && d <= day30;
                    }).length,
                    due180: equipment.filter(e => {
                        if (!e.nextCalibrationDate) return false;
                        const d = new Date(e.nextCalibrationDate);
                        return d >= now && d <= day180;
                    }).length,
                });
            } catch (err) {
                console.error('Error fetching stats');
            }
        };
        if (user) fetchStats();
    }, [user]);

    if (loading || !user) return null;

    const statCards = [
        { title: 'Active Instruments', value: stats.active, icon: FaCheckCircle, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
        { title: 'Reserve', value: stats.reserve, icon: FaBoxOpen, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f093fb' },
        { title: 'Inplant Tracking', value: stats.inplant, icon: FaIndustry, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#4facfe' },
        { title: 'Maintenance', value: stats.maintenance, icon: FaWrench, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#43e97b' },

        { title: 'Scheduled', value: stats.scheduled, icon: FaCalendarCheck, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fa709a' },
        { title: 'Unscheduled', value: stats.unscheduled, icon: FaCalendarTimes, gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: '#30cfd0' },
        { title: 'Discontinued', value: stats.discontinued, icon: FaBan, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#a8edea' },
        { title: 'In Calibration', value: stats.inCalibration, icon: FaCog, gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: '#ff9a9e' },

        { title: 'Overdue', value: stats.overDue, icon: FaExclamationTriangle, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#ff6b6b', alert: true },
        { title: 'Due in 7 Days', value: stats.due7, icon: FaClock, gradient: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', color: '#ff6e7f' },
        { title: 'Due in 30 Days', value: stats.due30, icon: FaCalendarAlt, gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', color: '#e0c3fc' },
        { title: 'Due in 180 Days', value: stats.due180, icon: FaChartLine, gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', color: '#c3cfe2' },
    ];

    return (
        <Layout>
            <div className="dashboard-container">
                <div className="dashboard-header" style={{
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '1.5rem 2rem',
                    borderRadius: '1rem',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                        Dashboard Overview
                    </h1>
                    <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                        Welcome back, <strong>{user.username}</strong> 👋
                    </p>
                </div>

                <div className="stats-grid">
                    {statCards.map((card, index) => (
                        <div
                            key={index}
                            className="stat-card-modern"
                            style={{
                                background: 'var(--bg-card)',
                                borderRadius: '1rem',
                                padding: '1.25rem',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid var(--border)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '120px',
                                height: '120px',
                                background: card.gradient,
                                borderRadius: '50%',
                                opacity: 0.1,
                                transform: 'translate(30%, -30%)'
                            }} />

                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '10px',
                                background: card.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.75rem',
                                boxShadow: `0 4px 12px ${card.color}40`
                            }}>
                                <card.icon style={{ fontSize: '1.25rem', color: 'white' }} />
                            </div>

                            <h3 style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                marginBottom: '0.4rem',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {card.title}
                            </h3>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                background: card.gradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {card.value}
                            </div>

                            {card.alert && card.value > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: '#ff6b6b',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    animation: 'pulse 2s infinite'
                                }}>
                                    ALERT
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <style>{`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.7;
                        }
                    }

                    /* Responsive Grid */
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.25rem;
                        margin-bottom: 2rem;
                    }

                    /* Tablet: 2 columns */
                    @media (max-width: 1024px) {
                        .stats-grid {
                            grid-template-columns: repeat(2, 1fr);
                            gap: 1rem;
                        }
                        
                        .dashboard-header h1 {
                            font-size: 1.75rem !important;
                        }
                        
                        .dashboard-header p {
                            font-size: 0.95rem !important;
                        }
                    }

                    /* Mobile: 1 column */
                    @media (max-width: 640px) {
                        .stats-grid {
                            grid-template-columns: 1fr;
                            gap: 0.875rem;
                        }
                        
                        .dashboard-header {
                            padding: 1.25rem 1.5rem !important;
                            margin-bottom: 1.25rem !important;
                        }
                        
                        .dashboard-header h1 {
                            font-size: 1.5rem !important;
                        }
                        
                        .dashboard-header p {
                            font-size: 0.875rem !important;
                        }
                        
                        .stat-card-modern {
                            padding: 1rem !important;
                        }
                    }
                `}</style>

                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    border: '1px solid var(--border)'
                }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Equipment Overview</h2>
                    <EquipmentList />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
