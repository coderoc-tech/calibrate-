import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const CalibrationStatus = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const fetchEquipment = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/equipment', {
                headers: { 'auth-token': token }
            });
            // Filter for 'Out for Calibration'
            const outForCal = res.data.filter(e => e.status === 'Out for Calibration');
            setEquipment(outForCal);
        } catch (err) {
            console.error('Error fetching equipment', err);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user) fetchEquipment();
    }, [user]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/equipment/${id}`, { status: newStatus }, {
                headers: { 'auth-token': token }
            });
            fetchEquipment(); // Refresh list
        } catch (err) {
            console.error('Error updating status', err);
            alert('Failed to update status');
        }
    };

    if (loading || !user) return null;

    return (
        <Layout>
            <div className="calibration-status-container">
                <div className="dashboard-header">
                    <h1>Calibration Status</h1>
                    <p className="text-muted">Track equipment currently out for calibration.</p>
                </div>

                {isLoadingData ? (
                    <p>Loading...</p>
                ) : (
                    <div className="equipment-list">
                        {equipment.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Calibration Sent</th>
                                        <th>Lab Name</th>
                                        <th>Return Date</th>
                                        <th>Gauge ID</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipment.map(item => (
                                        <tr key={item._id}>
                                            <td>
                                                {item.calibrationSentDate ? new Date(item.calibrationSentDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td>{item.calibrationLab || '-'}</td>
                                            <td>
                                                {item.calibrationReturnDate ? new Date(item.calibrationReturnDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td>{item.serialNumber}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => navigate(`/edit-equipment/${item._id}`)}
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--primary)' }}
                                                    >
                                                        Upload Cert
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(item._id, 'Active')}
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--success)' }}
                                                    >
                                                        Deploy
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(item._id, 'Reserve')}
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--warning)', color: 'black' }}
                                                    >
                                                        Reserve
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <p>No equipment currently out for calibration.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CalibrationStatus;
