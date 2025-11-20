import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';

const ReportDetail = () => {
    const { id } = useParams();
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/equipment/${id}`, {
                    headers: { 'auth-token': token }
                });
                setEquipment(res.data);
            } catch (err) {
                setError('Error fetching report details');
                console.error(err);
            }
        };
        if (user && id) fetchEquipment();
    }, [user, id]);

    const handleExport = () => {
        window.print();
    };

    if (loading || !user) return null;
    if (error) return <Layout><div className="error">{error}</div></Layout>;
    if (!equipment) return <Layout><div>Loading...</div></Layout>;

    // Get the latest document if available
    const latestDoc = equipment.documents && equipment.documents.length > 0
        ? equipment.documents[equipment.documents.length - 1]
        : null;

    return (
        <Layout>
            <div className="report-detail-container">
                <div className="dashboard-header">
                    <h1>Calibration Report Detail</h1>
                </div>

                <div className="report-content" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 150px)' }}>
                    {/* Left Column: Details */}
                    <div className="report-info" style={{ flex: '1', backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>

                        <div className="gauge-id-badge" style={{
                            background: 'linear-gradient(90deg, #ef4444, #8b5cf6)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '2rem',
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: '1.2rem'
                        }}>
                            Gauge ID: {equipment.serialNumber}
                        </div>

                        <div className="info-grid" style={{ display: 'grid', gap: '1.5rem', flex: '1' }}>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Equipment Name</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{equipment.name}</div>
                            </div>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manufacturer</label>
                                <div>{equipment.manufacturer || '-'}</div>
                            </div>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Model Number</label>
                                <div>{equipment.modelNumber || '-'}</div>
                            </div>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Location</label>
                                <div>{equipment.location || '-'}</div>
                            </div>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Last Calibration</label>
                                <div>{equipment.lastCalibrationDate ? new Date(equipment.lastCalibrationDate).toLocaleDateString() : '-'}</div>
                            </div>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Next Due Date</label>
                                <div style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
                                    {equipment.nextCalibrationDate ? new Date(equipment.nextCalibrationDate).toLocaleDateString() : '-'}
                                </div>
                            </div>
                            <div className="info-item">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status</label>
                                <div className={`status-${equipment.status?.toLowerCase().replace(/\s+/g, '-')}`}>{equipment.status}</div>
                            </div>
                        </div>

                        <button
                            onClick={handleExport}
                            style={{
                                marginTop: 'auto',
                                backgroundColor: '#ec4899',
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem'
                            }}
                        >
                            Export / Print
                        </button>
                    </div>

                    {/* Right Column: Report View */}
                    <div className="report-view" style={{ flex: '1.5', backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {latestDoc ? (
                            <iframe
                                src={`http://localhost:5000${latestDoc.filePath}`}
                                title="Report Preview"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                            />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333' }}>
                                <p>No document available for preview.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReportDetail;
