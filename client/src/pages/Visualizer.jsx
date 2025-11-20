import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';

const Visualizer = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [locationGroups, setLocationGroups] = useState({});
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/equipment', {
                    headers: { 'auth-token': token }
                });
                setEquipment(res.data);

                // Group equipment by location
                const grouped = res.data.reduce((acc, item) => {
                    const loc = item.location || 'Unassigned';
                    if (!acc[loc]) {
                        acc[loc] = [];
                    }
                    acc[loc].push(item);
                    return acc;
                }, {});
                setLocationGroups(grouped);
            } catch (err) {
                console.error('Error fetching equipment', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user) fetchEquipment();
    }, [user]);

    if (loading || !user) return null;

    // Define colors for different locations
    const locationColors = [
        '#8b5cf6', // purple
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#ec4899', // pink
        '#6366f1', // indigo
        '#14b8a6', // teal
    ];

    const locations = Object.keys(locationGroups);

    const handleLocationClick = (location) => {
        setSelectedLocation(location === selectedLocation ? null : location);
    };

    return (
        <Layout>
            <div className="visualizer-container">
                <div className="dashboard-header">
                    <h1>Equipment Visualizer</h1>
                    <p className="text-muted">Visual representation of equipment distribution across locations.</p>
                </div>

                {isLoadingData ? (
                    <p>Loading visualizer...</p>
                ) : (
                    <div className="visualizer-content">
                        {/* Interactive Map */}
                        <div className="location-map" style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '2px solid var(--border)',
                            borderRadius: '1rem',
                            padding: '3rem',
                            minHeight: '500px',
                            position: 'relative',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '2rem',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '1.5rem',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: 'var(--text-muted)'
                            }}>
                                Company Layout
                            </div>

                            {locations.map((location, index) => {
                                const color = locationColors[index % locationColors.length];
                                const count = locationGroups[location].length;
                                const isSelected = selectedLocation === location;

                                return (
                                    <div
                                        key={location}
                                        onClick={() => handleLocationClick(location)}
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            backgroundColor: color,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                            boxShadow: isSelected
                                                ? `0 0 30px ${color}`
                                                : '0 4px 10px rgba(0,0,0,0.2)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            padding: '1rem'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            {location}
                                        </div>
                                        <div style={{
                                            fontSize: '2rem',
                                            fontWeight: 'bold',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            borderRadius: '50%',
                                            width: '50px',
                                            height: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Equipment Details Panel */}
                        {selectedLocation && (
                            <div className="location-details" style={{
                                marginTop: '2rem',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '1rem',
                                padding: '2rem'
                            }}>
                                <h2 style={{ marginBottom: '1rem' }}>
                                    {selectedLocation} - {locationGroups[selectedLocation].length} Equipment
                                </h2>

                                <div className="equipment-list">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Equipment Name</th>
                                                <th>Serial Number</th>
                                                <th>Status</th>
                                                <th>Next Calibration</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {locationGroups[selectedLocation].map(item => (
                                                <tr key={item._id}>
                                                    <td>{item.name}</td>
                                                    <td>{item.serialNumber}</td>
                                                    <td>
                                                        <span className={`status-${item.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {item.nextCalibrationDate
                                                            ? new Date(item.nextCalibrationDate).toLocaleDateString()
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => navigate(`/edit-equipment/${item._id}`)}
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="legend" style={{
                            marginTop: '2rem',
                            padding: '1.5rem',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '1rem'
                        }}>
                            <h3 style={{ marginBottom: '1rem' }}>Legend</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {locations.map((location, index) => {
                                    const color = locationColors[index % locationColors.length];
                                    return (
                                        <div key={location} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: color
                                            }} />
                                            <span>{location} ({locationGroups[location].length})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Visualizer;
