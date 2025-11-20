import { useState, useEffect } from 'react';
import axios from '../api/axios';

const CalibrationHistory = ({ equipmentId }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/calibration/${equipmentId}`, {
                    headers: { 'auth-token': token }
                });
                setHistory(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (equipmentId) fetchHistory();
    }, [equipmentId]);

    return (
        <div className="calibration-history">
            <h3>Calibration History</h3>
            {history.length === 0 ? <p>No history found.</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Performed By</th>
                            <th>Certificate</th>
                            <th>Next Due</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(record => (
                            <tr key={record._id}>
                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td className={`status-${record.status.toLowerCase().replace(' ', '-')}`}>{record.status}</td>
                                <td>{record.performedBy}</td>
                                <td>{record.certificateNumber}</td>
                                <td>{new Date(record.nextCalibrationDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CalibrationHistory;
