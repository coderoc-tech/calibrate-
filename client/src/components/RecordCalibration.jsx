import { useState, useContext, useEffect } from 'react';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from './Layout';

const RecordCalibration = () => {
    const { id } = useParams(); // Equipment ID
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        performedBy: user.username,
        certificateNumber: '',
        status: 'Pass',
        notes: '',
        nextCalibrationDate: ''
    });
    const [equipment, setEquipment] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/equipment/${id}`, {
                    headers: { 'auth-token': token }
                });
                setEquipment(res.data);

                // Calculate next calibration date based on frequency
                const date = new Date();
                date.setMonth(date.getMonth() + res.data.calibrationFrequencyInMonths);
                setFormData(prev => ({
                    ...prev,
                    nextCalibrationDate: date.toISOString().split('T')[0]
                }));
            } catch (err) {
                setError('Error fetching equipment details');
            }
        };
        fetchEquipment();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/calibration', { ...formData, equipmentId: id }, {
                headers: { 'auth-token': token }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error recording calibration');
        }
    };

    if (!equipment) return <div>Loading...</div>;

    return (
        <Layout>
            <div className="add-equipment-container">
                <h2>Record Calibration for {equipment.name}</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <label>Calibration Date:</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />

                    <input name="performedBy" value={formData.performedBy} placeholder="Performed By" onChange={handleChange} required />
                    <input name="certificateNumber" value={formData.certificateNumber} placeholder="Certificate Number" onChange={handleChange} />

                    <label>Status:</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="Conditional Pass">Conditional Pass</option>
                    </select>

                    <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange}></textarea>

                    <label>Next Calibration Date:</label>
                    <input type="date" name="nextCalibrationDate" value={formData.nextCalibrationDate} onChange={handleChange} required />

                    <button type="submit">Save Record</button>
                </form>
            </div>
        </Layout>
    );
};

export default RecordCalibration;
