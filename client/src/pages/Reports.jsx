import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const [allEquipment, setAllEquipment] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch Equipment for Search
                const equipRes = await axios.get('/equipment', {
                    headers: { 'auth-token': token }
                });
                setAllEquipment(equipRes.data);

                // Fetch Global Calibration History
                const historyRes = await axios.get('/calibration', {
                    headers: { 'auth-token': token }
                });
                setHistory(historyRes.data);

            } catch (err) {
                console.error('Error fetching report data', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setSearchResult(null);
            return;
        }
        const found = allEquipment.find(e => e.serialNumber.toLowerCase() === searchQuery.trim().toLowerCase());
        setSearchResult(found || 'not-found');
    };

    if (loading || !user) return null;

    return (
        <Layout>
            <div className="reports-container">
                <div className="dashboard-header">
                    <h1>Calibration Reports</h1>
                    <p className="text-muted">Overview of upcoming tasks and recent activities.</p>
                </div>

                {isLoadingData ? (
                    <p>Loading reports...</p>
                ) : (
                    <>
                        <div className="search-section" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search by Gauge ID"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ maxWidth: '300px', marginBottom: 0 }}
                                />
                                <button onClick={handleSearch}>Search</button>
                            </div>
                            {searchResult === 'not-found' && <p className="text-muted" style={{ marginTop: '0.5rem' }}>No equipment found with that Gauge ID.</p>}
                            {searchResult && searchResult !== 'not-found' && (
                                <div className="search-result" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{searchResult.name}</strong> <span className="text-muted">({searchResult.serialNumber})</span>
                                    </div>
                                    <button onClick={() => navigate(`/reports/${searchResult._id}`)}>View Report</button>
                                </div>
                            )}
                        </div>



                        <div className="report-section">
                            <h2 style={{ marginBottom: '1rem' }}>📋 Recent Activity Log</h2>
                            {history.length > 0 ? (
                                <div className="equipment-list">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Equipment</th>
                                                <th>Performed By</th>
                                                <th>Status</th>
                                                <th>Certificate</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(record => (
                                                <tr key={record._id}>
                                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                                    <td>
                                                        {record.equipment ? (
                                                            <span>{record.equipment.name} <small className="text-muted">({record.equipment.serialNumber})</small></span>
                                                        ) : (
                                                            <span className="text-muted">Unknown Equipment</span>
                                                        )}
                                                    </td>
                                                    <td>{record.performedBy}</td>
                                                    <td>
                                                        <span className={record.status === 'Pass' ? 'status-pass' : 'status-fail'}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td>{record.certificateNumber || '-'}</td>
                                                    <td>
                                                        {record.equipment && (
                                                            <button
                                                                onClick={() => navigate(`/reports/${record.equipment._id}`)}
                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--primary)' }}
                                                            >
                                                                View
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted">No calibration history found.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Reports;
